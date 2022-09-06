import React from "react";
import Main from "../views/Main"; //
import Login from "../views/Login";
import Signup from "../views/Signup";
import Confirm from "../views/Confirm";
import Getconfirm from "../views/Getconfirm";
import NewPass from "../views/NewPass";
import ResetPass from "../views/ResetPass";
import Manual from "../views/Manual";
import LicenseAgreement from "../views/LicenseAgreement";
import ClinrecStartPage from "../views/Clinrecs/ClinrecStartPage";
import ClinrecStartPageNew from "../views/Clinrecs/ClinrecStartPageNew";

export default {
  "/": { section: "main", name: "main", render: <Main /> },
  "/concept": { section: "main", name: "main", render: <Main /> },
  "/concept/:page": { section: "main", name: "concept", render: <Main /> },
  "/concept/:page": { section: "main", name: "concept", render: <Main /> },
  "/concept/:page/:step": { section: "main", name: "concept", render: <Main /> },
  "/concept/:page/:step/:id1": { section: "main", name: "concept", render: <Main /> },
  "/concept/:page/:step/:id1/:id2": { section: "main", name: "concept", render: <Main /> },
  "/concept/:page/:step/:id1/:id2/id3": { section: "main", name: "concept", render: <Main /> },

  "/liquid/:page": { section: "main", name: "liquid", render: <Main /> },
  "/liquid/:page/:liquid": { section: "main", name: "liquid", render: <Main /> },
  "/liquid/:page/:liquid/dozes": { section: "main", name: "liquid", render: <Main /> },
  "/liquid/:page/:liquid/dozes/": { section: "main", name: "liquid", render: <Main /> },
  "/liquid/:page/:liquid/dozes": { section: "main", name: "liquid", render: <Main /> },
  "/liquid/:page/:liquid/dozes/:step": { section: "main", name: "liquid", render: <Main /> },

  "/warning/:page": { section: "main", name: "warning", render: <Main /> },

  "/recipe/:page": { section: "main", name: "recipe", render: <Main /> },

  "/prescript/:page": { section: "main", name: "prescript", render: <Main /> },

  "/profile/": { section: "main", name: "profile", render: <Main /> },
  "/profile/:page": { section: "main", name: "profile", render: <Main /> },
  "/settings/:page": { section: "main", name: "settings", render: <Main /> },

  "/patient/:page": { section: "main", name: "patient", render: <Main /> },
  "/patient/:page/:id": { section: "main", name: "patient", render: <Main /> },

  "/clinics/:page": { section: "main", name: "clinics", render: <Main /> },
  "/clinics/:page/:id": { section: "main", name: "clinics", render: <Main /> },

  "/analog/:page": { section: "main", name: "analog", render: <Main /> },

  "/druginfo/:page": { section: "main", name: "druginfo", render: <Main /> },

  "/fgreplace/:page/:drug": { section: "main", name: "fgreplace", render: <Main /> },

  "/crstartpage/:page": { section: "main", name: "crstartpage", render: <Main /> },
  "/clinrec/:page": { section: "main", name: "clinrec", render: <Main /> },
  "/clinrec/:page/:step": { section: "main", name: "clinrec", render: <Main /> },

  "/login": { section: "auth", name: "auth", render: <Login /> },
  "/signup": { section: "auth", name: "auth", render: <Signup /> },
  "/confirm": { section: "auth", name: "auth", render: <Confirm /> },
  "/getconfirm": { section: "auth", name: "auth", render: <Getconfirm /> },
  "/confirm/:code/:email/:service": { section: "auth", name: "auth", render: <Confirm /> },

  "/resetpass": { section: "auth", name: "auth", render: <ResetPass /> },
  "/newpass/:code/:email/:service": { section: "auth", name: "auth", render: <NewPass /> },
  "/newpass": { section: "auth", name: "auth", render: <NewPass /> },

  "/protocol/:protocol": { section: "main", name: "protocol", render: <Main /> },
  "/resultchecking/:protocol": { section: "main", name: "resultchecking", render: <Main /> },
  "/mispatient/:miskey": { section: "main", name: "mis", render: <Main /> },
  "/mispatient/:miskey/disabled": { section: "main", name: "mis", disabled: true, render: <Main /> },

  "/license-agreement": { section: "info", name: "license", render: <LicenseAgreement /> },
  "/manual": { section: "info", name: "manual", render: <Manual /> },
};
