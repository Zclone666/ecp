import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import "core-js/features/string/repeat";
import "raf/polyfill";
import "fast-text-encoding/text";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import "matchmedia-polyfill";
import "matchmedia-polyfill/matchMedia.addListener";

import "./i18n";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
