export const productLimits = Object.freeze({
  maxUploadBytes: 10 * 1024 * 1024,
  maxImageWidth: 12000,
  maxImageHeight: 12000,
  maxClosetItems: 50,
  maxLookGenerationsPerMonth: 20,
  maxAiAnalysesPerMonth: 10
})

export const planLimitDefaults = Object.freeze({
  free: {
    maxClosetItems: 50,
    maxLookGenerationsPerMonth: 20,
    maxAiAnalysesPerMonth: 10,
    maxInspirationAnalysesPerMonth: 3
  }
})
