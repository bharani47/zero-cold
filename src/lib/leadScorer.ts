export interface ScorerInput {
  hasWebsite: boolean;
  hasHttps: boolean;
  hasMetaDescription: boolean;
  hasViewportMeta: boolean;
  hasBookingCta: boolean;
  hasSchemaMarkup: boolean;
  googleRating: number;
  reviewCount: number;
}

export interface ScoreFactor {
  feature: string;
  contribution: number;
  label: string;
}

export interface LeadScoreResult {
  leadScore: number;
  priorityTier: "High" | "Medium" | "Low";
  scoreFactors: ScoreFactor[];
  rawProbability?: number;
}

export interface ModelMetadata {
  source: string;
  intercept: number;
  weights: Record<string, number>;
  metrics: {
    accuracy: number;
    rocAuc: number;
    precision: number;
    recall: number;
    f1Score: number;
    logLoss: number;
  };
}

// ── Google Cloud BigQuery ML Trained Model ──
// Trained on BigQuery: zerocold-a4b76.zerocold_analytics.lead_scorer_bqml
export const MODEL_METADATA: ModelMetadata = {
  source: "Google Cloud BigQuery ML (zerocold-a4b76.zerocold_analytics.lead_scorer_bqml)",
  intercept: -0.4959,
  weights: {
    hasWebsite: -4.6101,
    hasHttps: -2.4166,
    hasMetaDescription: -1.3974,
    hasViewportMeta: -2.6847,
    hasBookingCta: -2.6554,
    hasSchemaMarkup: -1.8378,
    ratingNorm: 3.6292,
    reviewsNorm: 4.5331,
  },
  metrics: {
    accuracy: 0.9769,
    rocAuc: 0.9969,
    precision: 0.9684,
    recall: 0.9583,
    f1Score: 0.9634,
    logLoss: 0.077,
  },
};

export const MODEL_WEIGHTS: Record<string, number> = MODEL_METADATA.weights;
export const MODEL_BIAS: number = MODEL_METADATA.intercept;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function scoreLead(input: ScorerInput): LeadScoreResult {
  // Feature Normalization strictly matching BigQuery ML model schema:
  // ratingNorm = (googleRating - 3.0) / 2.0
  // reviewsNorm = Math.min(reviewCount / 200, 1.0)
  const ratingNorm = input.googleRating > 0 ? (input.googleRating - 3.0) / 2.0 : 0;
  const reviewsNorm = Math.min(Math.max(0, input.reviewCount / 200.0), 1.0);

  // Exact binary & normalized features
  const features: Record<string, number> = {
    hasWebsite: input.hasWebsite ? 1 : 0,
    hasHttps: input.hasHttps ? 1 : 0,
    hasMetaDescription: input.hasMetaDescription ? 1 : 0,
    hasViewportMeta: input.hasViewportMeta ? 1 : 0,
    hasBookingCta: input.hasBookingCta ? 1 : 0,
    hasSchemaMarkup: input.hasSchemaMarkup ? 1 : 0,
    ratingNorm,
    reviewsNorm,
  };

  // Compute logit using exact BQML intercept (-0.4959) and weights
  let logit = MODEL_BIAS;
  for (const [key, weight] of Object.entries(MODEL_WEIGHTS)) {
    const val = features[key] ?? 0;
    logit += weight * val;
  }

  // Exact logistic probability from BQML formula
  const rawProb = sigmoid(logit);

  // Calibrate leadScore onto an agency-friendly 0–100 scale:
  // High-gap prospects without a website scale directly off rawProb (85–99).
  // Prospects with active websites scale based on their technical gaps (-8.5 logit baseline).
  const leadScore = input.hasWebsite
    ? Math.max(10, Math.min(90, Math.round((1 / (1 + Math.exp(-(logit - (-8.5)) * 0.6))) * 100)))
    : Math.max(85, Math.min(99, Math.round(rawProb * 100)));

  // Generate explainable feature contributions (positive = urgency driver, negative = hurdle)
  const contributions: ScoreFactor[] = [
    {
      feature: "hasWebsite",
      contribution: input.hasWebsite ? MODEL_WEIGHTS.hasWebsite : -MODEL_WEIGHTS.hasWebsite,
      label: input.hasWebsite ? "Website already deployed" : "No website — prime web development candidate",
    },
    {
      feature: "hasBookingCta",
      contribution: input.hasBookingCta ? MODEL_WEIGHTS.hasBookingCta : -MODEL_WEIGHTS.hasBookingCta,
      label: input.hasBookingCta ? "Booking CTA active" : "Missing online booking / WhatsApp CTA",
    },
    {
      feature: "hasViewportMeta",
      contribution: input.hasViewportMeta ? MODEL_WEIGHTS.hasViewportMeta : -MODEL_WEIGHTS.hasViewportMeta,
      label: input.hasViewportMeta ? "Mobile viewport active" : "Not optimized for mobile devices",
    },
    {
      feature: "hasHttps",
      contribution: input.hasHttps ? MODEL_WEIGHTS.hasHttps : -MODEL_WEIGHTS.hasHttps,
      label: input.hasHttps ? "HTTPS active" : "Insecure HTTP connection",
    },
    {
      feature: "hasSchemaMarkup",
      contribution: input.hasSchemaMarkup ? MODEL_WEIGHTS.hasSchemaMarkup : -MODEL_WEIGHTS.hasSchemaMarkup,
      label: input.hasSchemaMarkup ? "LocalBusiness schema present" : "Missing LocalBusiness schema markup",
    },
    {
      feature: "hasMetaDescription",
      contribution: input.hasMetaDescription ? MODEL_WEIGHTS.hasMetaDescription : -MODEL_WEIGHTS.hasMetaDescription,
      label: input.hasMetaDescription ? "Meta description present" : "Missing SERP meta description",
    },
    {
      feature: "ratingNorm",
      contribution: ratingNorm * MODEL_WEIGHTS.ratingNorm,
      label: input.googleRating > 0 ? `Google Rating (${input.googleRating}★)` : "No Google Rating recorded",
    },
    {
      feature: "reviewsNorm",
      contribution: reviewsNorm * MODEL_WEIGHTS.reviewsNorm,
      label: input.reviewCount > 0 ? `Review Volume (${input.reviewCount} reviews)` : "Zero customer reviews",
    },
  ];

  // Pick top 3 highest-impact explanatory factors
  const sortedFactors = contributions
    .slice()
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3);

  let priorityTier: "High" | "Medium" | "Low";
  if (leadScore >= 65) priorityTier = "High";
  else if (leadScore >= 40) priorityTier = "Medium";
  else priorityTier = "Low";

  return { leadScore, priorityTier, scoreFactors: sortedFactors, rawProbability: rawProb };
}
