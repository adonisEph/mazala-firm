"use client";

import SubPage from "@/components/SubPage";
import { T } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

export default function AboutClient() {
  const [lang] = useLang();
  const t = T[lang];

  return (
    <SubPage active="about">
      <section>
        <div>
          <h3 className="text-ternary font-title text-3xl md:text-4xl text-center mb-10 mt-40 lg:mt-20">{t.about.title}</h3>
        </div>
        <div className="w-5/6 md:w-1/2 text-justify mx-auto text-lg text-gray-800 whitespace-pre-line pb-10">
          {t.about.body}
        </div>
      </section>
    </SubPage>
  );
}
