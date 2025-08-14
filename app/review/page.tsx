// app/review/page.tsx (Reviewer)
"use client";
import React, { useMemo, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

async function extractFromPDF(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content: any = await page.getTextContent();
    text += content.items.map((it: any) => it.str || "").join(" ") + "\n";
  }
  return text;
}

async function extractFromDOCX(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let mod: any;
  try {
    mod = await import("mammoth");
  } catch (e) {
    throw new Error("Failed to load 'mammoth'. Please run: npm i mammoth");
  }
  const mammoth = mod.default ?? mod;
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return String(value || "");
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractFromPDF(file);
  if (name.endsWith(".docx")) return extractFromDOCX(file);
  if (name.endsWith(".txt")) return await file.text();
  throw new Error("Unsupported file. Please upload PDF, DOCX, or TXT.");
}

async function requestReview(payload: {
  resumeText: string;
  targetRole?: string;
  jobDescription?: string;
  seniority?: "intern" | "junior" | "mid" | "senior" | "lead";
  model?: string;
}) {
  const res = await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : `HTTP ${res.status}`);
  return data;
}

export default function ResumeReviewPage() {
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Data Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [seniority, setSeniority] =
    useState<"intern" | "junior" | "mid" | "senior" | "lead">("mid");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<any>(null);

  const canReview = resumeText.trim().length > 30 && !loading;
  const score = useMemo(() => review?.scores || {}, [review]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setReview(null);
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setFileName(f.name);
      const text = await extractTextFromFile(f);
      setResumeText(text.trim());
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }

  async function onRun() {
    if (!canReview) return;
    setLoading(true);
    setError(null);
    setReview(null);
    try {
      const data = await requestReview({
        resumeText,
        targetRole,
        jobDescription,
        seniority,
        model: model || undefined,
      });
      setReview(data);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        {/* Title without emojis */}
        <header className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300">
              AI Resume Reviewer
            </span>
          </h1>
          <p className="text-slate-300 max-w-3xl">
            Attach your resume below. You can edit extracted text before running the review. We never send files to a server for extraction; parsing happens in your browser.
          </p>
        </header>

        {/* Upload + settings */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left: file + extracted text */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-xs uppercase tracking-wide text-slate-400">Attach (PDF / DOCX / TXT)</label>

              {/* Custom drop zone replacing raw input; changes color on hover */}
              <label
                htmlFor="resume"
                className="group flex flex-col items-center justify-center w-full h-36 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 cursor-pointer transition hover:bg-indigo-900/30 focus-within:ring-2 focus-within:ring-fuchsia-400"
              >
                <span className="text-sm text-slate-300">
                  {fileName ? (
                    <>
                      <span className="font-semibold">Loaded:</span> {fileName}
                    </>
                  ) : (
                    "Click to choose a file or drag & drop"
                  )}
                </span>
                <span className="mt-1 text-xs text-slate-400">Max ~10 MB • Client-side extraction</span>
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="sr-only"
                  onChange={onFileChange}
                />
              </label>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">Extracted Text (editable)</label>
                <textarea
                  className="w-full h-56 rounded-2xl bg-slate-900/60 border border-white/10 p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="(Your resume text will appear here after upload)"
                />
              </div>
            </div>

            {/* Right: controls */}
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Target Role</label>
                <input
                  className="w-full rounded-2xl bg-slate-900/60 border border-white/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Seniority</label>
                <select
                  className="w-full rounded-2xl bg-slate-900/60 border border-white/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value as any)}
                >
                  <option value="intern">Intern</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-400">Model (optional)</label>
                <input
                  className="w-full rounded-2xl bg-slate-900/60 border border-white/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  placeholder="leave blank to auto-pick"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <button
                onClick={onRun}
                disabled={!canReview}
                className="w-full mt-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 disabled:opacity-40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 transition"
              >
                {loading ? "Reviewing…" : "Run Review"}
              </button>
              {error && <div className="text-rose-300 text-xs mt-2">{error}</div>}
            </div>
          </div>

          <details className="pt-2">
            <summary className="cursor-pointer text-sm text-slate-300">Optional: Job Description (improves tailoring)</summary>
            <textarea
              className="mt-2 w-full h-28 rounded-2xl bg-slate-900/60 border border-white/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the JD to tailor keywords, bullets, and summary"
            />
          </details>
        </div>

        {/* Results */}
        {review && (
          <div className="grid gap-6">
            {/* Scores */}
            <div className="grid md:grid-cols-5 gap-4">
              {[
                ["Overall", score.overall],
                ["ATS", score.ats],
                ["Readability", score.readability],
                ["Impact", score.impact],
                ["Keywords", score.keywords],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase text-slate-400">{label}</div>
                  <div className="text-3xl font-black">{value ?? "—"}</div>
                </div>
              ))}
            </div>

            {/* Optimized summary */}
            {review.optimizedSummary && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Optimized Summary</h2>
                <pre className="mt-2 whitespace-pre-wrap text-sm bg-slate-900/60 border border-white/10 rounded-2xl p-3">
                  {review.optimizedSummary}
                </pre>
                <button
                  className="mt-2 rounded-xl px-3 py-2 text-xs font-semibold bg-white/10 border border-white/20 hover:bg-white/15"
                  onClick={() => navigator.clipboard.writeText(review.optimizedSummary)}
                >
                  Copy Summary
                </button>
              </section>
            )}

            {/* Bullet rewrites */}
            {Array.isArray(review.bulletRewrites) && review.bulletRewrites.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Bullet Rewrites</h2>
                <ul className="mt-2 list-disc pl-6 text-sm space-y-1">
                  {review.bulletRewrites.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Keyword gaps */}
            {Array.isArray(review.missingKeywords) && review.missingKeywords.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Missing Keywords</h2>
                <div className="mt-2 text-sm">{review.missingKeywords.join(", ")}</div>
              </section>
            )}

            {/* Strengths / Red Flags */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Strengths</h3>
                <ul className="mt-2 list-disc pl-6 text-sm space-y-1">
                  {(review.strengths || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Red Flags</h3>
                <ul className="mt-2 list-disc pl-6 text-sm space-y-1">
                  {(review.redFlags || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section advice */}
            {review.sectionAdvice && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Section Advice</h2>
                <div className="grid md:grid-cols-3 gap-4 mt-3 text-sm">
                  {Object.entries(review.sectionAdvice).map(([k, arr]: any) => (
                    <div key={k} className="rounded-2xl bg-slate-900/60 border border-white/10 p-3">
                      <div className="text-slate-400 text-xs uppercase">{k}</div>
                      <ul className="mt-1 list-disc pl-5">
                        {(arr || []).map((t: string, i: number) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Action items */}
            {Array.isArray(review.actionItems) && review.actionItems.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold">Action Items</h2>
                <ul className="mt-2 text-sm space-y-2">
                  {review.actionItems.map((a: any, i: number) => (
                    <li key={i} className="rounded-xl bg-slate-900/60 border border-white/10 p-3">
                      <div><span className="text-slate-400">Change:</span> {a.change}</div>
                      <div><span className="text-slate-400">Reason:</span> {a.reason}</div>
                      <div><span className="text-slate-400">Impact:</span> {a.impact}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
