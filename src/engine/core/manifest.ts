import type { Manifest } from '../../types/manifest';

/**
 * Loads manifest.json as a static asset (like loadStoryFiles), for
 * gameplay features such as the CG gallery. Distinct from the editor's
 * manifest.api.ts, which talks to the local dev backend for authoring.
 */
export async function loadManifestFile(): Promise<Manifest> {
  const res = await fetch('data/manifest.json');
  return res.json();
}
