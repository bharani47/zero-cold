export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { analyzeWebsite } from "@/lib/siteAnalyzer";
import { scoreLead } from "@/lib/leadScorer";
import type { AuditRequest } from "@/types/audit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

const FLASH_MODELS = [
  process.env.GEMINI_FLASH_MODEL,
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
].filter(Boolean) as string[];

const PRO_MODELS = [
  process.env.GEMINI_PRO_MODEL,
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-2.5-flash-lite",
].filter((m): m is string => Boolean(m) && m !== "gemini-flash-latest");

// Simple in-memory IP rate limiter: max 20 requests per IP per hour
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 20, windowMs = 3600000): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callGeminiWithFailover(
  candidates: string[],
  contents: string,
  schemaConfig: Record<string, unknown>
): Promise<{ text: string; modelUsed: string }> {
  let lastErr: unknown = null;

  for (const model of candidates) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents,
          config: schemaConfig as unknown as undefined,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${model} timed out after 22s`)), 22000)
        ),
      ]);

      const text = response.text ? cleanJsonText(response.text) : "";
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: unknown) {
      console.warn(`Gemini call failed for ${model}:`, err instanceof Error ? err.message : err);
      lastErr = err;
      // Brief jittered pause before trying next candidate if high-demand/rate-limited
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  throw lastErr || new Error("All candidate Gemini models failed");
}

async function runAnalyst(
  businessName: string,
  niche: string,
  city: string,
  siteSignals: Record<string, unknown>,
  mlScore: number
): Promise<{ result: unknown; latencyMs: number; model: string }> {
  const t = Date.now();
  const prompt = `You are a senior digital marketing analyst evaluating local businesses in ${city}.

Business: ${businessName} (${niche}, ${city})
ML Lead Score: ${mlScore}/100

Digital Footprint Signals & Core Web Vitals:
${JSON.stringify(siteSignals, null, 2)}

Audit this business's digital footprint against top local competitors in ${city}. 
Return a strict JSON analysis with verified digital gaps, local competitor benchmark, and recommended angle.`;

  const { text, modelUsed } = await callGeminiWithFailover(
    FLASH_MODELS,
    prompt,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          digitalGapScore: { type: Type.INTEGER },
          verifiedGaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                finding: { type: Type.STRING },
                exactEvidence: { type: Type.STRING },
                businessImpact: { type: Type.STRING },
              },
              required: ["category", "finding", "exactEvidence", "businessImpact"],
            },
          },
          competitorBenchmark: { type: Type.STRING },
          recommendedAngle: { type: Type.STRING },
        },
        required: ["digitalGapScore", "verifiedGaps", "competitorBenchmark", "recommendedAngle"],
      },
    }
  );

  return { result: JSON.parse(text), latencyMs: Date.now() - t, model: modelUsed };
}

async function runWriter(
  businessName: string,
  niche: string,
  city: string,
  analystOutput: unknown,
  senderOffer: string
): Promise<{ result: unknown; latencyMs: number; model: string }> {
  const t = Date.now();
  const prompt = `You are an elite B2B cold outreach copywriter for digital agencies.

Target: ${businessName} (${niche}, located in ${city})
Sender's Service Offer: ${senderOffer}

Analyst Verified Findings & Competitor Insight:
${JSON.stringify(analystOutput, null, 2)}

Generate a synchronized 3-touch outreach pack:
1. initialEmail: Cold outreach email (subject + body, strictly under 100 words), anchored to ONE verified gap and local competitor benchmark in ${city}.
2. followUpEmail: 48-hour follow-up email (subject + body, strictly under 70 words) offering a competitor benchmark video breakdown or quick audit.
3. whatsappOrLinkedinDm: Conversational, friendly DM opener (strictly under 45 words) suitable for WhatsApp or LinkedIn messaging.

BANNED CLICHÉS: "I hope this finds you well", "synergy", "elevate your brand", "game-changer", "leverage", "touch base", "reach out"

Return strict JSON adhering to schema.`;

  const { text, modelUsed } = await callGeminiWithFailover(
    PRO_MODELS,
    prompt,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          initialEmail: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["subject", "body"],
          },
          followUpEmail: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["subject", "body"],
          },
          whatsappOrLinkedinDm: { type: Type.STRING },
        },
        required: ["initialEmail", "followUpEmail", "whatsappOrLinkedinDm"],
      },
    }
  );

  const parsed = JSON.parse(text);
  // Attach backward-compatibility top-level subject/body
  parsed.subject = parsed.initialEmail?.subject ?? "";
  parsed.body = parsed.initialEmail?.body ?? "";

  return { result: parsed, latencyMs: Date.now() - t, model: modelUsed };
}

async function runCritic(
  writerDraft: unknown,
  analystOutput: unknown,
  siteSignals: Record<string, unknown>
): Promise<{ result: unknown; latencyMs: number; model: string }> {
  const t = Date.now();
  const prompt = `You are a strict B2B communication auditor verifying outbound outreach claims.

Analyst Verified Gaps:
${JSON.stringify(analystOutput, null, 2)}

Raw Site Signals:
${JSON.stringify(siteSignals, null, 2)}

Writer's Draft Messages:
${JSON.stringify(writerDraft, null, 2)}

Critically audit the outreach:
(a) Verify every claim against raw site signals and analyst findings. Detect and eliminate any hallucinated claims.
(b) Check word counts (initialEmail < 100 words, followUpEmail < 70 words, whatsappOrLinkedinDm < 45 words).
(c) Ensure tone is concise, professional, and free of sales buzzwords.

If ANY check fails, produce revised versions in finalEmail, followUpEmail, and whatsappOrLinkedinDm.
If all pass, preserve the original versions.

Return strict JSON adhering to schema.`;

  const { text, modelUsed } = await callGeminiWithFailover(
    FLASH_MODELS,
    prompt,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN },
          groundednessScore: { type: Type.INTEGER },
          critiqueNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          claimsVerified: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                supportedByEvidence: { type: Type.BOOLEAN },
              },
              required: ["claim", "supportedByEvidence"],
            },
          },
          finalEmail: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["subject", "body"],
          },
          followUpEmail: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["subject", "body"],
          },
          whatsappOrLinkedinDm: { type: Type.STRING },
        },
        required: [
          "passed",
          "groundednessScore",
          "critiqueNotes",
          "claimsVerified",
          "finalEmail",
          "followUpEmail",
          "whatsappOrLinkedinDm",
        ],
      },
    }
  );

  return { result: JSON.parse(text), latencyMs: Date.now() - t, model: modelUsed };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 20 audits per IP per hour." },
        { status: 429 }
      );
    }

    const body: AuditRequest | null = await req.json().catch(() => null);
    if (!body || !body.businessName?.trim()) {
      return NextResponse.json(
        { error: "Business name is required to run an audit." },
        { status: 400 }
      );
    }
    const {
      businessName,
      niche = "Local Business",
      city = "Chennai",
      websiteUrl = "",
      googleRating = 0,
      reviewCount = 0,
      senderOffer = "web redesign, local SEO & conversion automation",
    } = body;

    // Step 1: Signal Extraction + PageSpeed (in parallel)
    const t1 = Date.now();
    const siteSignals = await analyzeWebsite(websiteUrl || "");
    const extractorMs = Date.now() - t1;

    // Step 2: ML Scoring
    const t2 = Date.now();
    const mlResult = scoreLead({
      hasWebsite: !!websiteUrl,
      hasHttps: siteSignals.hasHttps,
      hasMetaDescription: !!siteSignals.metaDescription,
      hasViewportMeta: siteSignals.hasViewportMeta,
      hasBookingCta: siteSignals.hasBookingOrContactCta,
      hasSchemaMarkup: siteSignals.hasSchemaMarkup,
      googleRating,
      reviewCount,
    });
    const scorerMs = Date.now() - t2;

    // Step 3: Analyst Agent (Gemini Flash with Failover)
    const { result: analystResult, latencyMs: analystMs, model: analystModel } = await runAnalyst(
      businessName,
      niche,
      city,
      siteSignals as unknown as Record<string, unknown>,
      mlResult.leadScore
    );

    // Step 4: Writer Agent (Gemini Pro/Flash with Failover)
    const { result: writerResult, latencyMs: writerMs, model: writerModel } = await runWriter(
      businessName,
      niche,
      city,
      analystResult,
      senderOffer
    );

    // Step 5: Critic Agent (Gemini Flash with Failover)
    const { result: criticResult, latencyMs: criticMs, model: criticModel } = await runCritic(
      writerResult,
      analystResult,
      siteSignals as unknown as Record<string, unknown>
    );

    return NextResponse.json({
      businessName,
      niche,
      city,
      websiteUrl,
      siteSignals,
      mlScore: mlResult,
      analystOutput: analystResult,
      writerDraft: writerResult,
      criticAudit: criticResult,
      pipeline: [
        { step: "Signal Extractor", model: "cheerio + PSI", latencyMs: extractorMs },
        { step: "ML Lead Scorer", model: "BigQuery ML (BQML)", latencyMs: scorerMs },
        { step: "Analyst Agent", model: analystModel, latencyMs: analystMs },
        { step: "Writer Agent", model: writerModel, latencyMs: writerMs },
        { step: "Critic Agent", model: criticModel, latencyMs: criticMs },
      ],
    });
  } catch (err: unknown) {
    console.error("Audit API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
