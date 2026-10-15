"use client";

import { useCallback, useEffect, useState } from "react";

export const runtime = "edge";

interface Project {
  id: number; title: string; description_fr: string; description_en: string;
  techs: string; image_url: string; sort_order: number;
}
interface Member {
  id: number; name: string; role_fr: string; role_en: string;
  bio_fr: string; bio_en: string; photo_url: string; linkedin: string; sort_order: number;
}
interface Message {
  id: number; name: string; email: string; message: string; read: number; created_at: string;
}

const EMPTY_PROJECT: Omit<Project, "id"> = { title: "", description_fr: "", description_en: "", techs: "", image_url: "", sort_order: 0 };
const EMPTY_MEMBER: Omit<Member, "id"> = { name: "", role_fr: "", role_en: "", bio_fr: "", bio_en: "", photo_url: "", linkedin: "", sort_order: 0 };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

export default function AdminPage() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"projects" | "team" | "messages">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editProject, setEditProject] = useState<Partial<Project> | null>(null);
  const [editMember, setEditMember] = useState<Partial<Member> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [p, m, msg] = await Promise.all([
      api<{ projects: Project[] }>("/api/admin/projects"),
      api<{ members: Member[] }>("/api/admin/team"),
      api<{ messages: Message[] }>("/api/admin/messages"),
    ]);
    setProjects(p.projects);
    setMembers(m.members);
    setMessages(msg.messages);
  }, []);

  useEffect(() => {
    api<{ user: { email: string; name: string } }>("/api/auth/me")
      .then((d) => {
        setUser(d.user);
        return load();
      })
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, [load]);

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
      const d = (await res.json()) as { user: { email: string; name: string } };
      setUser(d.user);
      await load();
    } else {
      alert("Identifiants incorrects.");
    }
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
    await load();
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
    await load();
  }

  async function remove(kind: "projects" | "team", id: number) {
    if (!confirm("Supprimer définitivement ?")) return;
    await api(`/api/admin/${kind}/${id}`, { method: "DELETE" });
    await load();
  }

  async function toggleRead(m: Message) {
    await api("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, read: !m.read }),
    });
    await load();
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
          <span className="text-gray-300">{user.email}</span>
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); setUser(null); }}
            className="bg-ternary px-3 py-1.5 rounded-full"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex gap-2 px-4 md:px-10 pt-6">
        {([["projects", "Projets"], ["team", "Équipe"], ["messages", `Messages${messages.filter((m) => !m.read).length ? ` (${messages.filter((m) => !m.read).length})` : ""}`]] as const).map(([key, label]) => (
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
                    <div className="w-14 h-14 rounded-lg bg-ternary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <span className="text-ternary font-title">{p.title[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-secondary">{p.title} <span className="text-xs text-gray-400">#{p.sort_order}</span></div>
                      <div className="text-xs text-gray-500 truncate">{p.description_en}</div>
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
                    <div className="w-14 h-14 rounded-full bg-secondary/10 bg-cover bg-top shrink-0" style={{ backgroundImage: `url(${m.photo_url})` }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-secondary">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.role_en}</div>
                    </div>
                    <button onClick={() => setEditMember(m)} className="text-secondary underline text-sm">Modifier</button>
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
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
                {!messages.length && <p className="text-gray-400 text-sm">Aucun message.</p>}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Modal édition projet ── */}
      {editProject && (
        <EditModal title={editProject.id ? "Modifier le projet" : "Nouveau projet"} onClose={() => setEditProject(null)} onSave={saveProject} saving={saving}>
          <Field label="Titre"><input className="w-full border rounded px-3 py-2" value={editProject.title ?? ""} onChange={(e) => setEditProject({ ...editProject, title: e.target.value })} /></Field>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Description (EN)"><textarea rows={4} className="w-full border rounded px-3 py-2" value={editProject.description_en ?? ""} onChange={(e) => setEditProject({ ...editProject, description_en: e.target.value })} /></Field>
            <Field label="Description (FR)"><textarea rows={4} className="w-full border rounded px-3 py-2" value={editProject.description_fr ?? ""} onChange={(e) => setEditProject({ ...editProject, description_fr: e.target.value })} /></Field>
          </div>
          <Field label="Technologies (séparées par des virgules)"><input className="w-full border rounded px-3 py-2" value={editProject.techs ?? ""} onChange={(e) => setEditProject({ ...editProject, techs: e.target.value })} placeholder="React.js, Next.js, Node.js" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Image (URL /images/…)"><input className="w-full border rounded px-3 py-2" value={editProject.image_url ?? ""} onChange={(e) => setEditProject({ ...editProject, image_url: e.target.value })} /></Field>
            <Field label="Ordre"><input type="number" className="w-full border rounded px-3 py-2" value={editProject.sort_order ?? 0} onChange={(e) => setEditProject({ ...editProject, sort_order: Number(e.target.value) })} /></Field>
          </div>
        </EditModal>
      )}

      {/* ── Modal édition membre ── */}
      {editMember && (
        <EditModal title={editMember.id ? "Modifier le membre" : "Nouveau membre"} onClose={() => setEditMember(null)} onSave={saveMember} saving={saving}>
          <Field label="Nom"><input className="w-full border rounded px-3 py-2" value={editMember.name ?? ""} onChange={(e) => setEditMember({ ...editMember, name: e.target.value })} /></Field>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Rôle (EN)"><input className="w-full border rounded px-3 py-2" value={editMember.role_en ?? ""} onChange={(e) => setEditMember({ ...editMember, role_en: e.target.value })} /></Field>
            <Field label="Rôle (FR)"><input className="w-full border rounded px-3 py-2" value={editMember.role_fr ?? ""} onChange={(e) => setEditMember({ ...editMember, role_fr: e.target.value })} /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Bio (EN)"><textarea rows={4} className="w-full border rounded px-3 py-2" value={editMember.bio_en ?? ""} onChange={(e) => setEditMember({ ...editMember, bio_en: e.target.value })} /></Field>
            <Field label="Bio (FR)"><textarea rows={4} className="w-full border rounded px-3 py-2" value={editMember.bio_fr ?? ""} onChange={(e) => setEditMember({ ...editMember, bio_fr: e.target.value })} /></Field>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Photo (URL)"><input className="w-full border rounded px-3 py-2" value={editMember.photo_url ?? ""} onChange={(e) => setEditMember({ ...editMember, photo_url: e.target.value })} placeholder="/images/xxx.jpg" /></Field>
            <Field label="LinkedIn"><input className="w-full border rounded px-3 py-2" value={editMember.linkedin ?? ""} onChange={(e) => setEditMember({ ...editMember, linkedin: e.target.value })} /></Field>
            <Field label="Ordre"><input type="number" className="w-full border rounded px-3 py-2" value={editMember.sort_order ?? 0} onChange={(e) => setEditMember({ ...editMember, sort_order: Number(e.target.value) })} /></Field>
          </div>
        </EditModal>
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
