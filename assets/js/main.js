/** Entry point: wires up every interactive part of the DeskFocus website. */
import { initClock } from "./clock.js";
import { initWidget } from "./widget.js";
import { initEffects } from "./effects.js";
import { initGithubStats } from "./github-stats.js";

initClock();
initWidget();
initEffects();
initGithubStats();
