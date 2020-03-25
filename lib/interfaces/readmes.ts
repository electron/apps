export interface IReadmesOutput {
  readonly readmeCleaned?: string | null
  readonly readmeOriginal: unknown | null
  readonly readmeFetchedAt: Date
}
