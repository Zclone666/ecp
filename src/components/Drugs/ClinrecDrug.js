import React, { Fragment } from "react";
import { inject, observer } from "mobx-react";

import { List, Feed, Responsive } from "semantic-ui-react";

import _ from "lodash";

const ClinrecDrug = inject("actions", "router", "tools", "drugs", "warnings", "dosages", "analogs", "druginfo")(observer(class ClinrecDrug extends React.Component {
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
      drug: { freq, duration, calc, helpers },
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
      dosages: { dosage: dose },
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
    let urlArr = ["/liquid/calc", values.liquid, "dozes"];

    if (helpers.way) urlArr.push(helpers.way);
    if (helpers.step) urlArr.push(helpers.step);

    // let url = `/liquid/calc/${values.liquid}${(drugDosages.url && drugDosages.url.replace('/concept', '')) || '/dozes'}`
    let className = selectedDrug === drug.key ? "selected" : "";
    className += selectedDrug === drug.key || active || (!selectedDrug && !selectedConflict) ? "" : " unused";

    let resultStyle = { ...(style || {}), ...(!canDrag ? { cursor: "default" } : { cursor: "move" }) };

    let rules = this.renderRules();
    return (
      <List.Item style={resultStyle} className={`nowarnings ${className}`}>
        <div className="border" style={{ backgroundColor: "transparent" }} />
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
                <br />
                {!rules.empty && (
                  <Feed.Meta>
                    {nameshort[dosage.method] || names[dosage.method] || ""}, &nbsp;
                    {rules.text}
                  </Feed.Meta>
                )}
              </Feed.Content>
            </Feed.Event>
          </List.Content>
        </Responsive>
      </List.Item>
    );
  }
}));

export default ClinrecDrug;
