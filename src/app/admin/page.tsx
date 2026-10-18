"use client";

import { useCallback, useEffect, useState } from "react";
import { parseSocials, SOCIAL_LABELS, SOCIAL_TYPES, type SocialLink } from "@/components/SocialIcons";
import { ProjectCard } from "@/components/ProjectCard";
import type { CmsProject } from "@/components/MazalaPage";

export const runtime = "edge";

interface Project {
  id: number; title: string; description_fr: string; description_en: string;
  techs: string; image_url: string; project_url: string;
  platform: "" | "web" | "mobile" | "desktop"; sort_order: number;
}
interface Member {
  id: number; name: string; role_fr: string; role_en: string;
  bio_fr: string; bio_en: string; photo_url: string; socials: string; sort_order: number;
}
// Formulaire : socials manipulé en tableau, sérialisé en JSON à l'envoi.
type MemberForm = Omit<Member, "socials"> & { socials: SocialLink[] };
interface Message {
  id: number; name: string; email: string; message: string; read: number; created_at: string;
  attachment_id?: number | null; attachment_name?: string | null; attachment_size?: number | null;
}
interface AdminAccount {
  id: number; email: string; name: string; role: "superadmin" | "admin";
  permissions: string; created_at: string;
}
interface AdminForm {
  id?: number; name: string; email: string; password: string; permissions: string[];
  role?: "superadmin" | "admin";
}
interface CurrentUser {
  id: number; email: string; name: string; role: "superadmin" | "admin"; permissions: string;
}

const SECTION_LABELS: Record<string, string> = { projects: "Projets", team: "Équipe", messages: "Messages" };
const SECTIONS = Object.keys(SECTION_LABELS);
type TabKey = "projects" | "team" | "messages" | "admins";
const parsePerms = (json?: string): string[] => {
  try {
    const a = JSON.parse(json ?? "[]");
    return Array.isArray(a) ? a.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
};
const userPerms = (u: CurrentUser | null): string[] =>
  u?.role === "superadmin" ? Object.keys(SECTION_LABELS) : parsePerms(u?.permissions);

const EMPTY_PROJECT: Omit<Project, "id"> = { title: "", description_fr: "", description_en: "", techs: "", image_url: "", project_url: "", platform: "", sort_order: 0 };
const EMPTY_MEMBER: Omit<MemberForm, "id"> = { name: "", role_fr: "", role_en: "", bio_fr: "", bio_en: "", photo_url: "", socials: [], sort_order: 0 };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function AdminPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<TabKey>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [editProject, setEditProject] = useState<Partial<Project> | null>(null);
  const [editMember, setEditMember] = useState<Partial<MemberForm> | null>(null);
  const [editAdmin, setEditAdmin] = useState<Partial<AdminForm> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  // Message de retour de l'upload d'image (conforme / refusée + pourquoi).
  const [imgMsg, setImgMsg] = useState<{ text: string; ok: boolean } | null>(null);
  // Aperçu fidèle du rendu d'une image dans sa section du site (modal ou clic sur vignette).
  const [previewMember, setPreviewMember] = useState<Pick<Member, "photo_url" | "name" | "role_fr"> | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const modalOpen = editProject !== null || editMember !== null || editAdmin !== null;
  useEffect(() => { setImgMsg(null); }, [modalOpen]);

  // Ne charge que les sections autorisées — sinon un admin restreint prendrait des 403.
  const load = useCallback(async (u: CurrentUser | null) => {
    if (!u) return;
    const perms = userPerms(u);
    const [p, m, msg] = await Promise.all([
      perms.includes("projects") ? api<{ projects: Project[] }>("/api/admin/projects") : Promise.resolve({ projects: [] as Project[] }),
      perms.includes("team") ? api<{ members: Member[] }>("/api/admin/team") : Promise.resolve({ members: [] as Member[] }),
      perms.includes("messages") ? api<{ messages: Message[] }>("/api/admin/messages") : Promise.resolve({ messages: [] as Message[] }),
    ]);
    setProjects(p.projects);
    setMembers(m.members);
    setMessages(msg.messages);
    if (u.role === "superadmin") {
      const a = await api<{ admins: AdminAccount[] }>("/api/admin/admins");
      setAdmins(a.admins);
    }
  }, []);

  useEffect(() => {
    api<{ user: CurrentUser }>("/api/auth/me")
      .then((d) => {
        setUser(d.user);
        return load(d.user);
      })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, [load]);

  // Onglet par défaut = première section autorisée.
  useEffect(() => {
    if (!user) return;
    const allowed = [...userPerms(user), ...(user.role === "superadmin" ? ["admins"] : [])];
    if (!allowed.includes(tab) && allowed.length) setTab(allowed[0] as typeof tab);
  }, [user, tab]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    if (res.ok) {
      const d = (await res.json()) as { user: CurrentUser };
      setUser(d.user);
      await load(d.user);
    } else {
      alert("Identifiants incorrects.");
    }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>, kind: "project" | "member") {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgMsg(null);
    let dims: { w: number; h: number } | null = null;
    // SVG = vectoriel, pas de contrainte de dimensions.
    if (file.type !== "image/svg+xml") {
      dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
      });
      if (!dims) {
        setImgMsg({ ok: false, text: `Image refusée : « ${file.name} » est illisible — formats acceptés : PNG, JPG, WebP, SVG.` });
        e.target.value = "";
        return;
      }
      const invalid =
        kind === "project"
          ? dims.w < 640 || dims.h < 360 || dims.h > dims.w
          : dims.w < 360 || dims.h < 360;
      if (invalid) {
        const hint = kind === "project"
          ? "une image paysage d'au moins 640×360 px (idéal ~1600×900)"
          : "une image d'au moins 360×360 px (idéal : carré ≥ 500×500)";
        setImgMsg({ ok: false, text: `Image refusée — ${dims.w}×${dims.h}px : il faut ${hint}.` });
        e.target.value = "";
        return;
      }
    }
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api<{ url: string }>(`/api/admin/images?for=${kind}`, { method: "POST", body: fd });
      if (kind === "project") setEditProject((p) => (p ? { ...p, image_url: res.url } : p));
      else setEditMember((m) => (m ? { ...m, photo_url: res.url } : m));
      const info = dims ? `${dims.w}×${dims.h}px` : "vectoriel";
      setImgMsg({ ok: true, text: `Image conforme — « ${file.name} » (${info}, ${Math.round(file.size / 1024)} Ko) chargée.` });
    } catch (err) {
      setImgMsg({ ok: false, text: `Image refusée : ${err instanceof Error ? err.message : "échec de l'envoi"}.` });
      e.target.value = "";
    }
    setUploadingImg(false);
  }

  async function saveProject() {
    if (!editProject?.title) return;
    setSaving(true);
    const isNew = !editProject.id;
    await api(`/api/admin/projects${isNew ? "" : `/${editProject.id}`}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...EMPTY_PROJECT, ...editProject }),
    }).catch(() => alert("Erreur d'enregistrement"));
    setSaving(false);
    setEditProject(null);
    await load(user);
  }

  async function saveMember() {
    if (!editMember?.name) return;
    setSaving(true);
    const isNew = !editMember.id;
    await api(`/api/admin/team${isNew ? "" : `/${editMember.id}`}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...EMPTY_MEMBER, ...editMember }),
    }).catch(() => alert("Erreur d'enregistrement"));
    setSaving(false);
    setEditMember(null);
    await load(user);
  }

  async function remove(kind: "projects" | "team" | "admins", id: number) {
    if (!confirm("Supprimer définitivement ?")) return;
    try {
      await api(`/api/admin/${kind}/${id}`, { method: "DELETE" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible.");
    }
    await load(user);
  }

  async function saveAdmin() {
    if (!editAdmin?.name || !editAdmin.email) return;
    if (!editAdmin.id && !editAdmin.password) {
      alert("Mot de passe requis pour un nouveau compte.");
      return;
    }
    setSaving(true);
    const isNew = !editAdmin.id;
    const body: Record<string, unknown> = {
      name: editAdmin.name,
      email: editAdmin.email,
      permissions: editAdmin.permissions ?? [],
    };
    if (editAdmin.password) body.password = editAdmin.password;
    try {
      await api(`/api/admin/admins${isNew ? "" : `/${editAdmin.id}`}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditAdmin(null);
      await load(user);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    }
    setSaving(false);
  }

  async function toggleRead(m: Message) {
    await api("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, read: !m.read }),
    });
    await load(user);
  }

  if (checking) {
    return <div className="min-h-screen bg-paper flex items-center justify-center"><div className="w-8 h-8 border-2 border-secondary border-t-ternary rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <div className="text-center">
            <span className="font-logo text-3xl text-ternary">Mazala</span>
            <p className="text-text-sec text-sm mt-1">Back-office</p>
          </div>
          <input name="email" type="email" required placeholder="Email admin" className="w-full px-3 py-2 rounded border border-gray-200" />
          <input name="password" type="password" required placeholder="Mot de passe" className="w-full px-3 py-2 rounded border border-gray-200" />
          <button className="w-full bg-ternary text-white font-semibold py-2.5 rounded-full">Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-secondary text-white px-4 md:px-10 py-4 flex items-center justify-between">
        <span className="font-logo text-2xl text-ternary-light">Mazala <span className="font-body text-sm text-gray-300">— back-office</span></span>
        <div className="flex items-center gap-4 text-sm">
          <a href="/" target="_blank" className="text-gray-300 hover:text-white underline">Voir le site ↗</a>
          <span className="text-gray-300">
            {user.name}
            {user.role === "superadmin" && <span className="ml-1.5 text-[10px] uppercase tracking-wider bg-ternary px-1.5 py-0.5 rounded-full">superadmin</span>}
          </span>
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); setUser(null); }}
            className="bg-ternary px-3 py-1.5 rounded-full"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex gap-2 px-4 md:px-10 pt-6">
        {([
          ...userPerms(user).map((key) => [key, key === "messages" ? `Messages${messages.filter((m) => !m.read).length ? ` (${messages.filter((m) => !m.read).length})` : ""}` : SECTION_LABELS[key]] as const),
          ...(user.role === "superadmin" ? [["admins", "Admins"] as const] : []),
        ] as ReadonlyArray<readonly [TabKey, string]>).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-t-lg font-semibold text-sm ${tab === key ? "bg-white text-secondary shadow" : "text-text-sec hover:text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="px-4 md:px-10 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8">
          {/* ── PROJETS ── */}
          {tab === "projects" && (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-title text-2xl text-secondary">Projets ({projects.length})</h2>
                <button onClick={() => setEditProject({ ...EMPTY_PROJECT, sort_order: projects.length + 1 })} className="bg-ternary text-white px-4 py-2 rounded-full text-sm font-semibold">
                  + Nouveau projet
                </button>
              </div>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3">
                    <button type="button" onClick={() => setPreviewProject(p)} title="Aperçu du rendu sur le site" className="w-14 h-14 rounded-lg bg-ternary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-zoom-in hover:ring-2 hover:ring-ternary transition-shadow">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-ternary font-title">{p.title[0]}</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-secondary">{p.title} <span className="text-xs text-gray-400">#{p.sort_order}</span></div>
                      <div className="text-xs text-text-sec truncate">{p.description_en}</div>
                      <div className="text-xs text-ternary">{p.techs}</div>
                    </div>
                    <button onClick={() => setEditProject(p)} className="text-secondary underline text-sm">Modifier</button>
                    <button onClick={() => remove("projects", p.id)} className="text-red-500 underline text-sm">Supprimer</button>
                  </div>
                ))}
                {!projects.length && <p className="text-gray-400 text-sm">Aucun projet.</p>}
              </div>
            </>
          )}

          {/* ── ÉQUIPE ── */}
          {tab === "team" && (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-title text-2xl text-secondary">Équipe ({members.length})</h2>
                <button onClick={() => setEditMember({ ...EMPTY_MEMBER, sort_order: members.length + 1 })} className="bg-ternary text-white px-4 py-2 rounded-full text-sm font-semibold">
                  + Nouveau membre
                </button>
              </div>
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3">
                    <button type="button" onClick={() => setPreviewMember(m)} title="Aperçu du rendu sur le site" className="w-14 h-14 rounded-full bg-secondary/10 bg-cover bg-top shrink-0 cursor-zoom-in hover:ring-2 hover:ring-ternary transition-shadow" style={{ backgroundImage: `url(${m.photo_url})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-secondary">{m.name}</div>
                      <div className="text-xs text-text-sec">{m.role_en}</div>
                    </div>
                    <button onClick={() => setEditMember({ ...m, socials: parseSocials(m.socials) })} className="text-secondary underline text-sm">Modifier</button>
                    <button onClick={() => remove("team", m.id)} className="text-red-500 underline text-sm">Supprimer</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── MESSAGES ── */}
          {tab === "messages" && (
            <>
              <h2 className="font-title text-2xl text-secondary mb-5">Messages ({messages.length})</h2>
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`border rounded-xl p-4 ${m.read ? "border-gray-100" : "border-ternary bg-ternary/5"}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-semibold text-secondary">{m.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{m.email}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(m.created_at).toLocaleString("fr-FR")}</span>
                      </div>
                      <button onClick={() => toggleRead(m)} className="text-xs text-text-sec underline shrink-0">
                        {m.read ? "Marquer non lu" : "Marquer lu"}
                      </button>
                    </div>
                    <p className="text-sm text-secondary mt-2 whitespace-pre-wrap">{m.message}</p>
                    {m.attachment_id && m.attachment_name ? (
                      <a
                        href={`/api/files/${m.attachment_id}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-secondary underline hover:text-ternary"
                        download
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden>
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        {m.attachment_name} ({m.attachment_size != null && m.attachment_size > 1048576 ? `${(m.attachment_size / 1048576).toFixed(1)} Mo` : `${Math.max(1, Math.round((m.attachment_size ?? 0) / 1024))} Ko`})
                      </a>
                    ) : null}
                  </div>
                ))}
                {!messages.length && <p className="text-gray-400 text-sm">Aucun message.</p>}
              </div>
            </>
          )}

          {/* ── ADMINS (superadmin uniquement) ── */}
          {tab === "admins" && user.role === "superadmin" && (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-title text-2xl text-secondary">Comptes admin ({admins.length})</h2>
                <button onClick={() => setEditAdmin({ name: "", email: "", password: "", permissions: ["projects", "team", "messages"] })} className="bg-ternary text-white px-4 py-2 rounded-full text-sm font-semibold">
                  + Nouvel admin
                </button>
              </div>
              <div className="space-y-3">
                {admins.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <span className="font-title text-xl text-secondary">{a.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-secondary">
                        {a.name}
                        {a.role === "superadmin" ? (
                          <span className="ml-2 text-[10px] uppercase tracking-wider bg-ternary text-white px-2 py-0.5 rounded-full align-middle">superadmin</span>
                        ) : null}
                        {a.id === user.id ? <span className="ml-2 text-xs text-gray-400">(vous)</span> : null}
                      </div>
                      <div className="text-xs text-text-sec truncate">{a.email}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {a.role === "superadmin" ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">Tous les droits</span>
                        ) : parsePerms(a.permissions).length ? (
                          parsePerms(a.permissions).map((s) => (
                            <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{SECTION_LABELS[s] ?? s}</span>
                          ))
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Aucun droit</span>
                        )}
                      </div>
                    </div>
                    {/* Soi-même ou tout admin non-superadmin peut être modifié ; un superadmin n'est jamais supprimable. */}
                    {(a.id === user.id || a.role !== "superadmin") && (
                      <button
                        onClick={() => setEditAdmin({ id: a.id, name: a.name, email: a.email, password: "", permissions: parsePerms(a.permissions), role: a.role })}
                        className="text-secondary underline text-sm"
                      >
                        Modifier
                      </button>
                    )}
                    {a.role !== "superadmin" && (
                      <button onClick={() => remove("admins", a.id)} className="text-red-500 underline text-sm">Supprimer</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Modal édition projet ── */}
      {editProject && (
        <EditModal title={editProject.id ? "Modifier le projet" : "Nouveau projet"} onClose={() => setEditProject(null)} onSave={saveProject} saving={saving}>
          <Field label="Titre"><input className="w-full border rounded px-3 py-2" value={editProject.title ?? ""} onChange={(e) => setEditProject({ ...editProject, title: e.target.value })} /></Field>
          <Field label="Description (FR) — traduite automatiquement en anglais">
            <textarea rows={5} className="w-full border rounded px-3 py-2" value={editProject.description_fr ?? ""} onChange={(e) => setEditProject({ ...editProject, description_fr: e.target.value })} />
          </Field>
          <Field label="Technologies (séparées par des virgules)"><input className="w-full border rounded px-3 py-2" value={editProject.techs ?? ""} onChange={(e) => setEditProject({ ...editProject, techs: e.target.value })} placeholder="React.js, Next.js, Node.js" /></Field>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Lien projet (demo, store, site)"><input className="w-full border rounded px-3 py-2" value={editProject.project_url ?? ""} onChange={(e) => setEditProject({ ...editProject, project_url: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Plateforme">
              <select className="w-full border rounded px-3 py-2" value={editProject.platform ?? ""} onChange={(e) => setEditProject({ ...editProject, platform: e.target.value as Project["platform"] })}>
                <option value="">Multi-plateforme</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Image du projet">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => uploadImage(e, "project")}
                className="w-full text-sm text-text-sec file:mr-3 file:rounded-full file:border-0 file:bg-ternary file:px-4 file:py-1.5 file:text-white file:text-sm file:font-semibold hover:file:bg-ternary-light file:cursor-pointer"
              />
              <p className="text-xs text-text-sec mt-1">PNG, JPG, WebP ou SVG — paysage, min 640×360 px (idéal ~1600×900), 5 Mo max.</p>
              {uploadingImg && <p className="text-xs text-ternary font-semibold mt-1">Envoi de l'image…</p>}
              {imgMsg && <p className={`text-xs mt-1 font-semibold ${imgMsg.ok ? "text-green-600" : "text-red-500"}`}>{imgMsg.text}</p>}
              {editProject.image_url ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={editProject.image_url} alt="Aperçu" className="h-20 w-auto rounded-lg object-cover border border-gray-200" />
                  <button type="button" onClick={() => setPreviewProject({ ...EMPTY_PROJECT, ...editProject } as Project)} className="text-xs px-3 py-1.5 rounded-full border border-secondary text-secondary font-semibold hover:bg-secondary hover:text-white transition-colors">
                    Aperçu sur le site
                  </button>
                </div>
              ) : null}
            </Field>
            <Field label="Ordre"><input type="number" className="w-full border rounded px-3 py-2" value={editProject.sort_order ?? 0} onChange={(e) => setEditProject({ ...editProject, sort_order: Number(e.target.value) })} /></Field>
          </div>
        </EditModal>
      )}

      {/* ── Modal édition membre ── */}
      {editMember && (
        <EditModal title={editMember.id ? "Modifier le membre" : "Nouveau membre"} onClose={() => setEditMember(null)} onSave={saveMember} saving={saving}>
          <Field label="Nom"><input className="w-full border rounded px-3 py-2" value={editMember.name ?? ""} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} /></Field>
          <Field label="Rôle (FR) — traduit automatiquement en anglais">
            <input className="w-full border rounded px-3 py-2" value={editMember.role_fr ?? ""} onChange={(e) => setEditMember({ ...editMember, role_fr: e.target.value })} />
          </Field>
          <Field label="Bio (FR) — traduite automatiquement en anglais">
            <textarea rows={5} className="w-full border rounded px-3 py-2" value={editMember.bio_fr ?? ""} onChange={(e) => setEditMember({ ...editMember, bio_fr: e.target.value })} />
          </Field>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Photo de profil">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => uploadImage(e, "member")}
                className="w-full text-sm text-text-sec file:mr-3 file:rounded-full file:border-0 file:bg-ternary file:px-4 file:py-1.5 file:text-white file:text-sm file:font-semibold hover:file:bg-ternary-light file:cursor-pointer"
              />
              <p className="text-xs text-text-sec mt-1">Min 360×360 px — idéal : carré ≥ 500×500.</p>
              {uploadingImg && <p className="text-xs text-ternary font-semibold mt-1">Envoi…</p>}
              {imgMsg && <p className={`text-xs mt-1 font-semibold ${imgMsg.ok ? "text-green-600" : "text-red-500"}`}>{imgMsg.text}</p>}
              {editMember.photo_url ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={editMember.photo_url} alt="Aperçu" className="w-14 h-14 rounded-full object-cover object-top border border-gray-200" />
                  <button type="button" onClick={() => setPreviewMember({ photo_url: editMember.photo_url!, name: editMember.name ?? "", role_fr: editMember.role_fr ?? "" })} className="text-xs px-3 py-1.5 rounded-full border border-secondary text-secondary font-semibold hover:bg-secondary hover:text-white transition-colors">
                    Aperçu sur le site
                  </button>
                </div>
              ) : null}
            </Field>
            <Field label="Ordre"><input type="number" className="w-full border rounded px-3 py-2" value={editMember.sort_order ?? 0} onChange={(e) => setEditMember({ ...editMember, sort_order: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Réseaux sociaux">
            <div className="space-y-2">
              {(editMember.socials ?? []).map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    className="border rounded px-2 py-2 w-36 shrink-0"
                    value={s.type}
                    onChange={(e) => {
                      const socials = [...(editMember.socials ?? [])];
                      socials[i] = { ...s, type: e.target.value as SocialLink["type"] };
                      setEditMember({ ...editMember, socials });
                    }}
                  >
                    {SOCIAL_TYPES.map((t) => (
                      <option key={t} value={t}>{SOCIAL_LABELS[t]}</option>
                    ))}
                  </select>
                  <input
                    className="flex-1 border rounded px-3 py-2 min-w-0"
                    value={s.url}
                    placeholder="https://…"
                    onChange={(e) => {
                      const socials = [...(editMember.socials ?? [])];
                      socials[i] = { ...s, url: e.target.value };
                      setEditMember({ ...editMember, socials });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setEditMember({ ...editMember, socials: (editMember.socials ?? []).filter((_, j) => j !== i) })}
                    className="text-red-500 font-bold px-1 shrink-0"
                    aria-label="Retirer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEditMember({ ...editMember, socials: [...(editMember.socials ?? []), { type: "linkedin", url: "" }] })}
                className="text-sm text-ternary font-semibold"
              >
                + Ajouter un réseau
              </button>
            </div>
          </Field>
        </EditModal>
      )}

      {/* ── Modal édition admin ── */}
      {editAdmin && (
        <EditModal title={editAdmin.id ? `Modifier ${editAdmin.name}` : "Nouvel administrateur"} onClose={() => setEditAdmin(null)} onSave={saveAdmin} saving={saving}>
          <Field label="Nom">
            <input className="w-full border rounded px-3 py-2" value={editAdmin.name ?? ""} onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className="w-full border rounded px-3 py-2" value={editAdmin.email ?? ""} onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })} />
          </Field>
          <Field label={editAdmin.id ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}>
            <input type="password" autoComplete="new-password" className="w-full border rounded px-3 py-2" value={editAdmin.password ?? ""} onChange={(e) => setEditAdmin({ ...editAdmin, password: e.target.value })} placeholder={editAdmin.id ? "••••••••" : "Min 8 caractères"} />
          </Field>
          {editAdmin.role !== "superadmin" && (
          <Field label="Droits d'accès">
            <div className="flex flex-wrap gap-4 pt-1">
              {SECTIONS.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editAdmin.permissions ?? []).includes(s)}
                    onChange={(e) => {
                      const perms = new Set(editAdmin.permissions ?? []);
                      if (e.target.checked) perms.add(s); else perms.delete(s);
                      setEditAdmin({ ...editAdmin, permissions: [...perms] });
                    }}
                    className="w-4 h-4 accent-ternary"
                  />
                  <span className="text-sm">{SECTION_LABELS[s]}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-sec mt-2">L'admin ne verra et ne pourra gérer que les sections cochées.</p>
          </Field>
          )}
        </EditModal>
      )}

      {/* ── Aperçu du rendu image tel qu'affiché sur le site ── */}
      {previewMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewMember(null)}>
          <div className="bg-secondary rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center space-y-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-ternary-light text-xs uppercase tracking-widest font-semibold self-start">Aperçu — section Équipe</p>
            {/* Réplique exacte du rendu : cercle bg-top/bg-cover + voile violet 70% */}
            <div
              className="w-52 h-52 md:w-60 md:h-60 rounded-full bg-top bg-cover shadow-lg"
              style={{ backgroundImage: `url(${previewMember.photo_url})` }}
            >
              <div
                className="rounded-full w-full h-full opacity-70"
                style={{ background: "linear-gradient(rgb(var(--secondary) / 0.4), rgb(var(--secondary-light) / 0.4))" }}
              />
            </div>
            <div className="text-gray-100 flex flex-col items-center">
              <span className="font-bold text-xl">{previewMember.name || "Nom du membre"}</span>
              <span className="text-sm text-gray-200">{previewMember.role_fr || "Rôle"}</span>
            </div>
            <button onClick={() => setPreviewMember(null)} className="text-sm text-gray-300 underline">Fermer</button>
          </div>
        </div>
      )}
      {previewProject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewProject(null)}>
          <div className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-300 text-xs uppercase tracking-widest font-semibold mb-3">Aperçu — carte projet</p>
            {/* Vraie carte ProjectCard */}
            <ProjectCard lang="fr" p={previewProject as CmsProject} />
            <button onClick={() => setPreviewProject(null)} className="mt-3 text-sm text-gray-300 underline">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-text-sec uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function EditModal({ title, children, onClose, onSave, saving }: {
  title: string; children: React.ReactNode; onClose: () => void; onSave: () => void; saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-title text-xl text-secondary">{title}</h3>
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm text-text-sec">Annuler</button>
          <button onClick={onSave} disabled={saving} className="px-5 py-2 rounded-full bg-ternary text-white text-sm font-semibold disabled:opacity-60">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
