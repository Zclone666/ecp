import React, { Fragment } from "react";
import { inject, observer } from "mobx-react";

import { useDrag } from "react-dnd";

import RouterLink from "../../router/a";

import { Menu, List, Feed, Button, Responsive, Icon, Popup, Dropdown } from "semantic-ui-react";

import _ from "lodash";

const ChangeFGDrug = inject(
  "actions",
  "router",
  "tools",
  "drugs",
  "warnings",
  "dosages",
  "analogs",
  "druginfo"
)(
  observer(
    class ChangeFGDrug extends React.Component {
      constructor(props) {
        super(props);

        this.state = {
          open: true,
        };
      }

      renderRules() {
        let {
          dosages: { getFromBase },
          tools: { names, shortnames, round },
          drug: { freq, duration, calc, dosage, helpers },
          drug,
          actions: { UIText },
        } = this.props;

        let arr = [];

        // console.log({drug});

        if (calc.fullDosage && helpers.dosage && helpers.dosage.id) {
          let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
          let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];
          arr.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`);
        }

        if (freq && UIText.freq[freq]) arr.push(UIText.freq[freq]);
        if (duration && UIText.duration[duration]) arr.push(UIText.duration[duration]);

        return {
          empty: arr.length < 1,
          text: arr.join(", "),
        };
      }

      render() {
        let {
          actions: { selectedDrug, selectedConflict },
          router: { values },
          drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
          dosages: { dosage: dose },
          warnings: { infoFg, warningFg, groupsFg, iconsFg: warnIcons }, //warnings, warnGroups, warnIcons
          drug,
          active,
          style,
          canDrag,
        } = this.props;

        let { key, name, type, dosage, helpers } = drug;

        let drugDosages = dose.get(key) || {};

        let names = drugDosages.names || {};
        let nameshort = drugDosages.nameshort || {};
        // liquid/calc/1/dozes/lf/4
        // console.log({drug});

        let currWarning = active;

        let urlArr = ["/liquid/calc", values.liquid, "dozes"];

        if (helpers.way) urlArr.push(helpers.way);
        if (helpers.step) urlArr.push(helpers.step);

        let url = urlArr.join("/");
        // let url = `/liquid/calc/${values.liquid}${(drugDosages.url && drugDosages.url.replace('/concept', '')) || '/dozes'}`
        let className = selectedDrug === drug.key ? "selected" : "";
        className += selectedDrug === drug.key || active || (!selectedDrug && !selectedConflict) ? "" : " unused";

        let resultStyle = { ...(style || {}), ...(!canDrag ? { cursor: "default" } : { cursor: "move" }) };

        let rules = this.renderRules();

        // console.log({ infoFg, currWarning });
        return (
          <List.Item style={resultStyle} className={`nowarnings ${className}`}>
            <div className="border" style={{ backgroundColor: currWarning && currWarning.color }} />
            <Responsive as={List.Content} className="ui feed large" fireOnMount minWidth="481">
              <Feed.Event>
                <Feed.Content>
                  <Feed.Summary>
                    <span className="underlined">
                      {/* {name} */}
                      <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
                    </span>
                    {type === "TN" && (
                      <span>
                        <sup>TM</sup>
                      </span>
                    )}
                    <Feed.Date>
                      {dosage.form && (nameshort[dosage.form] || names[dosage.form])}{" "}
                      {helpers.dosage && (helpers.dosage.small || helpers.dosage.full) && ", "}
                      {(helpers.dosage && (helpers.dosage.small || helpers.dosage.full)) || ""}
                    </Feed.Date>
                  </Feed.Summary>
                  <Feed.Meta>
                    {nameshort[dosage.method] || names[dosage.method] || ""}
                    {!rules.empty && ", "}
                    {rules.text}
                  </Feed.Meta>
                  {infoFg.description && infoFg.description[currWarning.id] && (
                    <Feed.Meta>
                      {infoFg.description[currWarning.id].map((item) => {
                        return <div dangerouslySetInnerHTML={{ __html: infoFg.names[item] }} />;
                      })}
                    </Feed.Meta>
                  )}
                </Feed.Content>
              </Feed.Event>
            </Responsive>
            <Responsive as={Fragment} maxWidth="480">
              <List.Content className="ui feed large">
                <Feed.Event>
                  <Feed.Content>
                    <Feed.Summary>
                      <span className="underlined">
                        {/* {name} */}
                        <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
                      </span>
                      {type === "TN" && (
                        <span>
                          <sup>TM</sup>
                        </span>
                      )}
                    </Feed.Summary>
                    <Feed.Meta>
                      {dosage.form && (nameshort[dosage.form] || names[dosage.form])}{" "}
                      {helpers.dosage && (helpers.dosage.small || helpers.dosage.full) && ", "}
                      {(helpers.dosage && (helpers.dosage.small || helpers.dosage.full)) || ""}
                      {(nameshort[dosage.method] || names[dosage.method]) && ", "}
                      {rules.empty && (nameshort[dosage.method] || names[dosage.method] || "")}
                    </Feed.Meta>

                    {!rules.empty && (
                      <Feed.Meta>
                        <br />
                        {nameshort[dosage.method] || names[dosage.method] || ""}, &nbsp;
                        {rules.text}
                      </Feed.Meta>
                    )}
                    {infoFg.description && infoFg.description[currWarning.id] && (
                      <Feed.Meta>
                        <br />
                        {infoFg.description[currWarning.id].map((item) => {
                          return <div dangerouslySetInnerHTML={{ __html: infoFg.names[item] }} />;
                        })}
                      </Feed.Meta>
                    )}
                  </Feed.Content>
                </Feed.Event>
              </List.Content>
            </Responsive>
          </List.Item>
        );
      }
    }
  )
);

export default ChangeFGDrug;
