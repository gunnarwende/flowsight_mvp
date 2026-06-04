/**
 * Bunny Stream embed helpers for the proof page (/p/[token]).
 *
 * The proof videos live in a Bunny Stream library; we embed them via Bunny's
 * iframe player, which is adaptive and supports mobile-landscape fullscreen
 * (the key UX decision: 1440×900 desktop-format takes are unreadable inline on
 * a phone but readable in fullscreen-landscape — see project_email_phase_kickoff).
 */

/** Adaptive iframe embed URL for a Bunny Stream video. */
export function bunnyEmbedUrl(
  libraryId: string,
  guid: string,
  opts: { autoplay?: boolean; preload?: boolean } = {}
): string {
  const params = new URLSearchParams({
    autoplay: opts.autoplay ? "true" : "false",
    preload: opts.preload ? "true" : "false",
    responsive: "true",
  });
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}?${params}`;
}

/** Poster/thumbnail URL served from the pull-zone CDN host. */
export function bunnyThumbnailUrl(cdnHostname: string, guid: string): string {
  return `https://${cdnHostname}/${guid}/thumbnail.jpg`;
}
