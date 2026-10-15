"use client";

import SubPage from "@/components/SubPage";
import { POLICIES_HTML } from "@/lib/policies-html";

export default function PoliciesClient() {
  return (
    <SubPage active="policies">
      <div
        className="w-5/6 md:w-2/3 mx-auto mt-40 lg:mt-20 pb-10 text-gray-800 policies-content"
        dangerouslySetInnerHTML={{ __html: POLICIES_HTML }}
      />
    </SubPage>
  );
}
