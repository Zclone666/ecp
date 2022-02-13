import { SERVER, TYPE } from "./server";
export const LOGIN =
  window.location.href.includes("desktop") ||
  (!window.location.href.includes(["socmedica"]) &&
    !window.location.href.includes(["localhost"]) &&
    !window.location.host.includes("http://84.23.32.38:9031/"))
    ? "privateKeyOnly"
    : "disabled_privateKeyOnly";
export { SERVER, TYPE };
