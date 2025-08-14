// app/api/review/route.ts
import { NextResponse } from "next/server";

const PROVIDER = (process.env.LLM_PROVIDER || "OPENROUTER").toUpperCase();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeText, targetRole, jobDescription, seniority, model } = body;

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json({ error: "Resume text too short." }, { status: 400 });
    }

    // System + user prompts -> ask the model to return strict JSON
    const sys = `You are a resume reviewer. Return JSON with keys:
- scores: { overall, ats, readability, impact, keywords } (0-100)
- optimizedSummary: string
- bulletRewrites: string[]
- missingKeywords: string[]
- strengths: string[]
- redFlags: string[]
- sectionAdvice: { Summary: string[], Experience: string[], Skills: string[], Education: string[] }
- actionItems: { change: string, reason: string, impact: string }[]`;

    const user = `Resume (trimmed):
${resumeText.slice(0, 8000)}

---
Target role: ${targetRole || "Unknown"}
Seniority: ${seniority || "mid"}
Job description (optional): ${jobDescription?.slice(0, 4000) || "N/A"}

Return strictly valid JSON only, no extra text.`;

    if (PROVIDER !== "OPENROUTER") {
      return NextResponse.json({ error: "Only OPENROUTER enabled." }, { status: 400 });
    }

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY!}`,
        // These two headers are recommended but optional:
        "HTTP-Referer": "https://your-domain.vercel.app",
        "X-Title": "AI Resume Reviewer",
      },
      body: JSON.stringify({
        model: model || process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0.2,
      }),
    });

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || "{}";
    // Some models may wrap JSON in backticks or prose; sanitize before parsing.
    const cleaned = stripToJson(text);
    return NextResponse.json(JSON.parse(cleaned));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// Extract the first {...} block and remove ``` fences if present
function stripToJson(s: string) {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  const slice = start >= 0 && end >= start ? s.slice(start, end + 1) : "{}";
  return slice.replace(/```(?:json)?/g, "").trim();
}
