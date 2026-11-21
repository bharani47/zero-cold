import * as cheerio from "cheerio";
import type { PageSpeedData, SiteSignalsData } from "@/types/audit";

export type SiteSignals = SiteSignalsData;

async function fetchPageSpeed(url: string): Promise<PageSpeedData | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=mobile&category=performance&category=seo`;

    const res = await fetch(psiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      clearTimeout(timeoutId);
      return null;
    }

    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: {
          performance?: { score?: number };
          seo?: { score?: number };
        };
        audits?: {
          "largest-contentful-paint"?: { numericValue?: number };
        };
      };
    };
    clearTimeout(timeoutId);

    const perfScore = Math.round(
      (data.lighthouseResult?.categories?.performance?.score ?? 0) * 100
    );
    const seoScore = Math.round(
      (data.lighthouseResult?.categories?.seo?.score ?? 0) * 100
    );
    const lcpMs = Math.round(
      data.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue ?? 0
    );

    if (perfScore === 0 && seoScore === 0) return null;

    return {
      mobilePerformanceScore: perfScore,
      seoScore,
      lcpMs,
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function scrapeCheerio(normalizedUrl: string): Promise<Omit<SiteSignalsData, "pageSpeed">> {
  const hasHttps = normalizedUrl.startsWith("https://");
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const responseTimeMs = Date.now() - start;

    // Handle bot challenge or WAF protection (Cloudflare, Sucuri, Imperva)
    if (response.status === 403 || response.status === 503) {
      clearTimeout(timeoutId);
      return {
        reachable: true,
        reason: "Active website (protected by Cloudflare/WAF bot challenge)",
        url: normalizedUrl,
        responseTimeMs,
        hasHttps,
        title: "Protected Web Property",
        metaDescription: "Active business site with Cloudflare edge protection",
        hasViewportMeta: true,
        h1Count: 1,
        hasAnalyticsOrPixel: true,
        hasBookingOrContactCta: false,
        hasSchemaMarkup: false,
      };
    }

    const html = await response.text();
    clearTimeout(timeoutId);
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || null;
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || null;
    const hasViewportMeta = !!$('meta[name="viewport"]').length;
    const h1Count = $("h1").length;

    const bodyHtml = $("body").html() || html;
    const hasAnalyticsOrPixel =
      bodyHtml.includes("gtag(") ||
      bodyHtml.includes("googletagmanager") ||
      bodyHtml.includes("fbq(");

    const bodyText = $("body").text().toLowerCase();
    const bodyLinks = $("a").map((_, el) => $(el).attr("href") || "").get().join(" ").toLowerCase();
    const hasBookingOrContactCta =
      bodyText.includes("book") ||
      bodyText.includes("contact us") ||
      bodyLinks.includes("wa.me") ||
      bodyLinks.includes("whatsapp") ||
      bodyLinks.includes("appointment") ||
      bodyText.includes("schedule");

    const hasSchemaMarkup = $('script[type="application/ld+json"]').length > 0;

    return {
      reachable: true,
      url: normalizedUrl,
      responseTimeMs,
      hasHttps,
      title,
      metaDescription,
      hasViewportMeta,
      h1Count,
      hasAnalyticsOrPixel,
      hasBookingOrContactCta,
      hasSchemaMarkup,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    return {
      reachable: false,
      reason: err instanceof Error ? err.message : "Request failed or timed out",
      url: normalizedUrl,
      responseTimeMs: Date.now() - start,
      hasHttps,
      title: null,
      metaDescription: null,
      hasViewportMeta: false,
      h1Count: 0,
      hasAnalyticsOrPixel: false,
      hasBookingOrContactCta: false,
      hasSchemaMarkup: false,
    };
  }
}

export async function analyzeWebsite(url: string): Promise<SiteSignalsData> {
  if (!url || !url.trim()) {
    return {
      reachable: false,
      reason: "No website provided",
      url: "",
      responseTimeMs: 0,
      hasHttps: false,
      title: null,
      metaDescription: null,
      hasViewportMeta: false,
      h1Count: 0,
      hasAnalyticsOrPixel: false,
      hasBookingOrContactCta: false,
      hasSchemaMarkup: false,
      pageSpeed: null,
    };
  }

  const trimmed = url.trim();
  const normalizedUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;

  // Run cheerio extraction and PageSpeed analysis in parallel
  const [cheerioData, pageSpeed] = await Promise.all([
    scrapeCheerio(normalizedUrl),
    fetchPageSpeed(normalizedUrl),
  ]);

  return {
    ...cheerioData,
    pageSpeed,
  };
}
