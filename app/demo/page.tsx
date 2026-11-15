import { redirect } from "next/navigation";

// /demo lleva al chat del restaurante ficticio.
export default function DemoPage() {
  redirect("/c/demo");
}
