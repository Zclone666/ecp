import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import Slider from "react-slick";
import RouterLink from "../../router/a";

import WayChoice from "./WayChoice";
import LF from "./LF";
import DozeTypes from "./DozeTypes";
import Methods from "./Methods";
import Calculator from "./Calculator";

import { Transition, Accordion, Icon, Step, Responsive } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const Steps = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "warnings",
  "dosages"
)(
  observer(
    class Steps extends Component {
      constructor(props) {
        super(props);
        this.state = {
          // viewType: 'pc'
        };
      }
      steps = {
        lf: [
          { name: "type", text: "form_input" },
          { name: "lf", text: "dosage_form" },
          { name: "dosage", text: "dosage" },
          { name: "method", text: "mode_application" },
        ],
        methods: [
          { name: "type", text: "form_input" },
          { name: "method", text: "mode_application" },
          { name: "lf", text: "dosage_form" },
          { name: "dosage", text: "dosage" },
        ],
        "": [
          { name: "type", text: "form_input" },
          { name: "lf", text: "dosage_form" },
          { name: "dosage", text: "dosage" },
          { name: "method", text: "mode_application" },
        ],
      };
      render() {
        let {
          actions: { stepsData },
          drugs: { current }, //drugs, currDrug, setDosageParams
          dosages: { dosage }, //drugsDosages
          router: { values },
          viewType,
        } = this.props;
        const { t } = this.props.actions;
        let way = values.way || "lf";

        let drugsDosage = dosage.get(current.id);
        // console.log({ drugsDosage });
        let { names, nameshort } = drugsDosage;
        // console.log(stepsData);
        let currStep = parseInt(values.step || 0);

        return (
          <Step.Group attached="top" fluid unstackable ordered size="tiny">
            {this.steps[way] &&
              this.steps[way].map((step, i) => {
                let url = !values.liquid ? `/concept/dozes/${way}` : `/liquid/calc/${values.liquid}/dozes/${way}`;
                let chosedName = "";
                if (i > 0 && i <= currStep) {
                  url += `/${i}`;
                  // console.log(step.name);
                  chosedName = nameshort[stepsData[step.name]] || names[stepsData[step.name]];
                  if (step.name === "lf") chosedName = nameshort[stepsData.form] || names[stepsData.form];
                } else if (i !== 0) {
                  url = "";
                } else {
                  chosedName = {
                    lf: t("dosage_form"),
                    methods: t("mode_application"),
                    "": "",
                  }[way];
                }
                // console.log({step, stepsData});
                if (step.name === "dosage" && currStep > i) {
                  // console.log({step, stepsData});
                  chosedName =
                    (stepsData.helpers.dosage && (stepsData.helpers.dosage.short || stepsData.helpers.dosage.full)) +
                    ", " +
                    (stepsData.helpers.pack && (stepsData.helpers.pack.short || stepsData.helpers.pack.full));
                }
                // console.log({ step, chosedName, stepsData, names });
                return (
                  <Step
                    completed={currStep > i}
                    key={"st" + i}
                    active={currStep == i}
                    as={i <= currStep ? RouterLink : Step}
                    to={url}
                  >
                    {(currStep == i || viewType == "pc") && (
                      <Step.Content>
                        <Step.Title>{t(step.text)}</Step.Title>
                        <Step.Description>{chosedName}</Step.Description>
                      </Step.Content>
                    )}
                  </Step>
                );
              })}
          </Step.Group>
        );
      }
    }
  )
);

export default withTranslation()(Steps);
