/**
 * Per-playground overrides for the in-page playground. Keyed by "<kind>:<slug>".
 * Everything runs in the container by default; use `embeddable: false` with a note
 * for a folder found NOT to run inside a WebContainer.
 */
export interface EmbedOverride {
  embeddable?: false
  note?: string
}

export const embedOverrides: Record<string, EmbedOverride> = {}
