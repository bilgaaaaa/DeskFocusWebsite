/**
 * Shows live GitHub stars and release downloads under the hero.
 * The stats row stays hidden if the API is unreachable or the repo is private.
 */
import { log, warn } from "./logger.js";

const REPO_API_URL = "https://api.github.com/repos/bilgaaaaa/deskfocus";

const formatCount = (value) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
};

const sumReleaseDownloads = (releases) =>
  releases.reduce(
    (total, release) => total + release.assets.reduce((sum, asset) => sum + asset.download_count, 0),
    0,
  );

export const initGithubStats = async () => {
  const container = document.querySelector("[data-github-stats]");
  if (!container) return;

  try {
    const [repo, releases] = await Promise.all([
      fetchJson(REPO_API_URL),
      fetchJson(`${REPO_API_URL}/releases?per_page=100`),
    ]);
    const downloads = sumReleaseDownloads(releases);

    // Zero counts read as a dead project, so the row only appears once there is something to show.
    if (repo.stargazers_count === 0 && downloads === 0) {
      log("GitHub stats are zero, keeping them hidden");
      return;
    }

    container.querySelector("[data-github-stars]").textContent = `${formatCount(repo.stargazers_count)} stars`;
    container.querySelector("[data-github-downloads]").textContent = `${formatCount(downloads)} downloads`;
    container.hidden = false;
    log(`GitHub stats loaded: ${repo.stargazers_count} stars, ${downloads} downloads`);
  } catch (error) {
    warn("GitHub stats unavailable, keeping them hidden", error);
  }
};
