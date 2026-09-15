import Link from "next/link";
import PostRow from "@/components/PostRow";
import { getAllPostsMeta } from "@/lib/posts";

export default function Home() {
  const posts = getAllPostsMeta().slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-16 pb-14 border-b border-line">
        <p className="font-mono text-sm text-teal mb-4">Diario de automatización · para cualquier negocio</p>
        <h1 className="font-display text-4xl sm:text-5xl leading-tight max-w-3xl text-paper mb-6">
          Construyo automatizaciones con IA para negocios reales.
          <br />
          Esto es lo que pasa cuando se ponen en marcha.
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed mb-10">
          Nada de teoría genérica: flujos de n8n y Make, agentes de IA para atención al
          cliente, ventas y tareas administrativas, y los números reales de tiempo y
          dinero que ahorran — o de lo que falla cuando algo no sale bien.
        </p>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-2xl">
          <div>
            <dt className="font-mono text-xs text-muted mb-1">Para quién</dt>
            <dd className="font-display text-2xl text-paper">Cualquier negocio</dd>
          </div>
          <div>
            <dt className="font-mono text-xs text-muted mb-1">Herramientas</dt>
            <dd className="font-display text-2xl text-paper">n8n · Make · IA</dd>
          </div>
          <div>
            <dt className="font-mono text-xs text-muted mb-1">Con qué</dt>
            <dd className="font-display text-2xl text-paper">Casos y números reales</dd>
          </div>
        </dl>
      </section>

      {/* Latest posts */}
      <section className="py-14">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-display text-2xl text-paper">Últimas entradas</h2>
          <Link href="/blog" className="font-mono text-sm text-teal hover:text-amber transition-colors">
            Ver todo el blog
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted py-10">
            Todavía no hay artículos publicados. En cuanto añadas el primer archivo a{" "}
            <code className="font-mono text-sm">content/posts</code>, aparecerá aquí.
          </p>
        ) : (
          <div>
            {posts.map((post) => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Tool CTA */}
      <section className="py-14 border-t border-line">
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-teal mb-3">Herramienta</p>
          <h2 className="font-display text-2xl text-paper mb-4">
            ¿Cuánto te ahorraría automatizar una tarea?
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            Mete cuánto tiempo dedicas a una tarea repetitiva cada semana y su coste, y
            calcula el ahorro real al automatizarla.
          </p>
          <Link
            href="/herramientas/ahorro-automatizacion"
            className="inline-block font-mono text-sm border border-amber text-amber px-5 py-3 hover:bg-amber hover:text-ink transition-colors"
          >
            Abrir la calculadora
          </Link>
        </div>
      </section>
    </div>
  );
}
