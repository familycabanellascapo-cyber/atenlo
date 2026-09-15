import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-prose mx-auto px-6 py-16">
      <Link href="/blog" className="font-mono text-sm text-teal hover:text-amber transition-colors">
        ← Volver al blog
      </Link>

      <div className="flex items-baseline gap-3 mt-8 mb-3">
        <span className="font-mono text-xs text-teal">{post.category}</span>
        <span className="font-mono text-xs text-muted">
          {formatDate(post.date)} · {post.readingTime}
        </span>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl text-paper leading-tight mb-10">
        {post.title}
      </h1>

      <div
        className="prose-log text-paper"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
