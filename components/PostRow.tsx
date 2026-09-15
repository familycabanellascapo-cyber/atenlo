import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block py-6 border-b border-line first:pt-0"
    >
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <span className="font-mono text-xs text-teal">{post.category}</span>
        <span className="font-mono text-xs text-muted whitespace-nowrap">
          {formatDate(post.date)} · {post.readingTime}
        </span>
      </div>
      <h3 className="font-display text-xl text-paper group-hover:text-amber transition-colors mb-2">
        {post.title}
      </h3>
      <p className="text-muted leading-relaxed max-w-prose">{post.excerpt}</p>
    </Link>
  );
}
