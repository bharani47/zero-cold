export interface PipelineStep {
  step: string;
  model: string;
  latencyMs: number;
}

export interface VerifiedGap {
  category: string;
  finding: string;
  exactEvidence: string;
  businessImpact: string;
}

export interface ClaimVerification {
  claim: string;
  supportedByEvidence: boolean;
}

export interface PageSpeedData {
  mobilePerformanceScore: number;
  seoScore: number;
  lcpMs: number;
}

export interface SiteSignalsData {
  reachable: boolean;
  reason?: string;
  url: string;
  responseTimeMs: number;
  hasHttps: boolean;
  title: string | null;
  metaDescription: string | null;
  hasViewportMeta: boolean;
  h1Count: number;
  hasAnalyticsOrPixel: boolean;
  hasBookingOrContactCta: boolean;
  hasSchemaMarkup: boolean;
  pageSpeed?: PageSpeedData | null;
}

export interface MLScoreData {
  leadScore: number;
  priorityTier: "High" | "Medium" | "Low";
  scoreFactors: Array<{
    feature: string;
    contribution: number;
    label: string;
  }>;
}

export interface AnalystOutput {
  digitalGapScore: number;
  verifiedGaps: VerifiedGap[];
  competitorBenchmark: string;
  recommendedAngle: string;
}

export interface OutreachMessage {
  subject: string;
  body: string;
}

export interface WriterDraft {
  initialEmail: OutreachMessage;
  followUpEmail: OutreachMessage;
  whatsappOrLinkedinDm: string;
  // Optional backward compatibility
  subject?: string;
  body?: string;
}

export interface CriticAudit {
  passed: boolean;
  groundednessScore: number;
  critiqueNotes: string[];
  claimsVerified: ClaimVerification[];
  finalEmail: OutreachMessage;
  followUpEmail?: OutreachMessage;
  whatsappOrLinkedinDm?: string;
}

export interface AuditRequest {
  businessName: string;
  niche: string;
  city: string;
  websiteUrl?: string;
  googleRating?: number;
  reviewCount?: number;
  senderOffer?: string;
}

export interface AuditResult {
  businessName: string;
  niche: string;
  city: string;
  websiteUrl: string;
  siteSignals: SiteSignalsData;
  mlScore: MLScoreData;
  analystOutput: AnalystOutput;
  writerDraft: WriterDraft;
  criticAudit: CriticAudit;
  pipeline: PipelineStep[];
}
