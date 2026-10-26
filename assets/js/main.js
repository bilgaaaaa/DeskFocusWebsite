/** Entry point: wires up every interactive part of the DeskFocus website. */
import { initWidget } from "./widget.js";
import { initEffects } from "./effects.js";
import { initGithubStats } from "./github-stats.js";

const initClock = () => {
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
  setInterval(render, 30_000);
};

initClock();
initWidget();
initEffects();
initGithubStats();
