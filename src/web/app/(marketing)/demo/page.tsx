import { redirect } from "next/navigation";

// Permanent redirect: /demo → /testen
export default function DemoRedirect() {
  redirect("/testen");
}
