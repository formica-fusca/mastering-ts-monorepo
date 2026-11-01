/**
 * Per-playground overrides for the in-browser embed. Keyed by "<kind>:<slug>".
 * Everything is embeddable by default in the editor view. Use `view: 'preview'`
 * for folders that serve HTTP, and `embeddable: false` with a note for folders
 * found NOT to run inside StackBlitz WebContainers.
 */
export interface EmbedOverride {
  embeddable?: false
  note?: string
  view?: 'editor' | 'preview' | 'both'
}

export const embedOverrides: Record<string, EmbedOverride> = {
  'demo:1.1-browser-module-history': { view: 'both' },
}
