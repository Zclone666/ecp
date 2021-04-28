import { SERVER, TYPE } from "./server";
export const LOGIN = window.location.href.includes("desktop") ? "privateKeyOnly" : "disabled_privateKeyOnly";
export { SERVER, TYPE };
