import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import Slider from "react-slick";
import RouterLink from "../../router/a";

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
        drug: [
          { name: "type", text: ["mode_application", "dosage_form"] },
          { name: "dosage", text: ["dosage"] },
        ],
        liquid: [
          { name: "type", text: ["mode_application", "dosage_form"] },
          { name: "dosage", text: ["dosage"] },
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
        let way = "drug";

        let drugsDosage = dosage.get(current.id);
        // console.log({ drugsDosage });
        let { names, nameshort } = drugsDosage;
        // console.log(stepsData);
        let currStep = parseInt(values.step || 0);

        return (
          <>
            <Step.Group attached="top" fluid unstackable ordered size="tiny">
              {this.steps[way] &&
                this.steps[way].map((step, i) => {
                  let url = !values.liquid ? `/concept/dozes` : `/liquid/calc/${values.liquid}/dozes`;
                  let chosedName = "";
                  if (i > 0 && i <= currStep) {
                    url += `/${i}`;
                    // console.log(step.name);
                    chosedName = nameshort[stepsData[step.name]] || names[stepsData[step.name]];
                    if (step.name === "lf") chosedName = nameshort[stepsData.form] || names[stepsData.form];
                  } else if (i !== 0) {
                    url = "";
                  }

                  if (step.name === "dosage" && currStep > i) {
                    let arr2 = [];
                    if (stepsData.helpers.dosage)
                      arr2.push(stepsData.helpers.dosage.short || stepsData.helpers.dosage.full);
                    if (stepsData.helpers.pack && (stepsData.helpers.pack.short || stepsData.helpers.pack.full))
                      arr2.push(stepsData.helpers.pack.short || stepsData.helpers.pack.full);
                    chosedName = chosedName = arr2.join(", ");
                  }

                  if (step.name === "type") {
                    let arr1 = [];
                    if (current.dosage?.method_name) {
                      arr1.push(current.dosage?.method_name);
                    } else if (stepsData.form) {
                      arr1.push(nameshort[stepsData.method] || names[stepsData.method]);
                    }
                    if (current.dosage?.form_name) {
                      arr1.push(current.dosage?.form_name);
                    } else if (stepsData.form) {
                      arr1.push(nameshort[stepsData.form] || names[stepsData.form]);
                    }

                    chosedName = arr1.join(", ");
                  }

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
                          <Step.Title>{step.text.map((item) => t(item)).join(", ")}</Step.Title>
                          <Step.Description>{chosedName}</Step.Description>
                        </Step.Content>
                      )}
                    </Step>
                  );
                })}
            </Step.Group>
            <div
              dangerouslySetInnerHTML={{
                __html: `${current.name} ${current.type === "TN" ? "<span><sup>TM</sup></span>" : ""}`,
              }}
              style={{ padding: 5, textAlign: "center", background: "#eee" }}
            ></div>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Steps);
