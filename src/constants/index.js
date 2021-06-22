import { SERVER, TYPE } from "./server";
export const LOGIN =
  window.location.href.includes("desktop") ||
  (!window.location.href.includes(["socmedica"]) && !window.location.href.includes(["localhost"]))
    ? "privateKeyOnly"
    : "disabled_privateKeyOnly";
export { SERVER, TYPE };
