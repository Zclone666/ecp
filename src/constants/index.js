import { SERVER, TYPE } from "./server";
export const LOGIN =
  window.location.href.includes("desktop") ||
  (!window.location.href.includes(["socmedica"]) &&
    !window.location.href.includes(["localhost"]) &&
    !window.location.host.includes("95.84.137.225:9031") &&
    !window.location.host.includes("178.176.38.245:9031"))
    ? "privateKeyOnly"
    : "disabled_privateKeyOnly";
export { SERVER, TYPE };
