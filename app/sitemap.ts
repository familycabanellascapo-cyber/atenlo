import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/aviso-legal", "/privacidad", "/cookies"].map((p) => ({ url: `${site.url}${p}` }));
}
