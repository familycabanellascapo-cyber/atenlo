import type { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/posts";
import { site } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPostsMeta();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${site.url}/herramientas/ahorro-automatizacion`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${site.url}/sobre-mi`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/contacto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/aviso-legal`, changeFrequency: "yearly", priority: 0.1 },
    {
      url: `${site.url}/politica-de-privacidad`,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${site.url}/politica-de-cookies`,
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
