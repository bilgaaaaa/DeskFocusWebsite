/** Entry point for legal pages: they only need the shared footer year, not the landing page effects. */
import { initClock } from "./clock.js";
import { log } from "./logger.js";

initClock();
log("Legal page ready");
