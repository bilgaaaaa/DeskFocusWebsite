/** Fills the footer year and the preview menu bar clock, shared by every page. */
import { log } from "./logger.js";

const CLOCK_REFRESH_MS = 30_000;

export const initClock = () => {
  const yearElement = document.querySelector("[data-current-year]");
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());

  const timeElement = document.querySelector("[data-current-time]");
  if (!timeElement) return;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const render = () => {
    timeElement.textContent = formatter.format(new Date()).replace(",", "");
  };
  render();
  setInterval(render, CLOCK_REFRESH_MS);
  log("Menu bar clock ready");
};
