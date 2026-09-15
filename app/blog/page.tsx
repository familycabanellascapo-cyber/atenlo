import type { Metadata } from "next";
import PostRow from "@/components/PostRow";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Todas las entradas del diario de automatización.",
};

export default function BlogIndex() {
  const posts = getAllPostsMeta();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-paper mb-2">Blog</h1>
      <p className="text-muted mb-10">
        Todo lo que voy documentando, en orden. {posts.length} entradas por ahora.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted py-10">
          Todavía no hay artículos. Añade un archivo <code className="font-mono text-sm">.md</code>{" "}
          dentro de <code className="font-mono text-sm">content/posts</code> y aparecerá aquí
          automáticamente.
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
