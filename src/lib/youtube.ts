/*
|-----------------------------------------
| setting up safe YouTube embed URL helpers
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

/** Converts recognized YouTube URLs to a privacy-friendly embed URL. */
export function getYouTubeEmbedUrl(value: string) {
  const url = value.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    let videoId = "";

    if (host === "youtu.be") videoId = parsed.pathname.split("/").filter(Boolean)[0] || "";
    else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host)) {
      if (parsed.pathname === "/watch") videoId = parsed.searchParams.get("v") || "";
      else if (/^\/(embed|shorts|live)\//.test(parsed.pathname)) videoId = parsed.pathname.split("/")[2] || "";
    }

    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : null;
  } catch {
    return null;
  }
}
