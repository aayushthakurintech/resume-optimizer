// app/page.tsx (Home)
"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-20 grid gap-10 md:grid-cols-2 items-center">
        {/* Left: copy */}
        <div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300">
              AI Resume Reviewer
            </span>
          </h1>
          <p className="mt-5 text-slate-300 text-lg md:pr-8">
            Upload your resume (PDF / DOCX / TXT) and get concise, actionable feedback
            powered by Our <span className="font-semibold">Smart LLM</span> models.
            We highlight keyword gaps, rewrite bullets, and score ATS-readiness.
          </p>

          {/* How it works */}
          <ol className="mt-8 space-y-3 text-slate-300">
            <li className="flex gap-3"><span className="text-slate-400">1.</span> Attach your resume — we extract clean text client-side.</li>
            <li className="flex gap-3"><span className="text-slate-400">2.</span> Pick a target role and (optionally) paste a job description.</li>
            <li className="flex gap-3"><span className="text-slate-400">3.</span> Get scores, rewrites, and prioritized action items.</li>
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/review"
              className="inline-flex items-center rounded-2xl px-6 py-3 font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 shadow-lg hover:shadow-fuchsia-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 transition"
            >
              Go to Reviewer
            </Link>
          </div>
        </div>

        {/* Right: hero image (AI-related, online src) */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1600&auto=format&fit=crop"
            alt="Abstract AI circuit illustration"
            className="w-full rounded-3xl border border-white/10 shadow-2xl"
            loading="lazy"
          />
          <p className="sr-only">Background artwork from Unsplash.</p>
        </div>
      </div>

      {/* Why Ollama */}
      <section id="why-ollama" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Private by default", body: "All extraction is done in the browser; reviews run via your local Ollama endpoint." },
            { title: "Fast iteration", body: "Tweak target roles and JDs to instantly see keyword and bullet improvements." },
            { title: "ATS-friendly", body: "We emphasize clarity, quantifiable impact, and consistent formatting." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-slate-300 text-sm">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}