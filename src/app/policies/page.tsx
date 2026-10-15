import PoliciesClient from "./PoliciesClient";

export const runtime = "edge";

export const metadata = {
  title: "Mazala | Policies",
};

export default function PoliciesPage() {
  return <PoliciesClient />;
}
