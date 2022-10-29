import React, { Fragment } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

import { List, Feed, Button, Responsive, Icon } from "semantic-ui-react";

import _ from "lodash";

const MiniDrug = inject("actions", "router", "tools", "drugs", "warnings", "dosages", "analogs", "druginfo")(observer(class MiniDrug extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true,
    };
  }
  getLF = async () => {
    let {
      drug,
    } = this.props;
    await this.props.drugs.setCurrent({ key: drug.key, id: drug.id });
    // this.props.drugs.current = { ...drug };
    await this.props.drugs.getDosageParams();

    // this.props.router.push('/concepts/dozes')
  };

  renderRules() {
    let {
      dosages: { getFromBase },
      tools: { names, shortnames, round },
      drug: { freq, freq_id, duration, duration_id, calc, helpers, schedule },
      drug,
      actions: { UIText },
    } = this.props;

    helpers = helpers || {};
    let arr = [];
    let { finishAlternate } = schedule || {};

    // console.log({drug});

    if (calc.fullDosage && helpers.dosage && helpers.dosage.id) {
      let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
      let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];
      arr.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`);
    }

    if (freq_id && UIText.freq[freq_id]) {
      arr.push(UIText.freq[freq_id]);
    } else if (freq) {
      arr.push(freq);
    }
    if (duration_id && UIText.duration[duration_id]) {
      arr.push(UIText.duration[duration_id]);
    } else if (duration) {
      arr.push(duration);
    }
    // if(duration && UIText.duration[duration]) arr.push(UIText.duration[duration])
    if (finishAlternate && UIText.duration[finishAlternate]) arr.push(UIText.duration[finishAlternate]);

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

    let { name, type, dosage, helpers } = drug;
    let drugDosages = dose.get(drug.id) || {};

    let names = drugDosages.names || {};
    let nameshort = drugDosages.nameshort || {};
    // liquid/calc/1/dozes/lf/4
    // console.log({drug});
    let urlArr = ["/liquid/calc", values.liquid, "dozes"];
    helpers = helpers || {};

    if (helpers.way) urlArr.push(helpers.way);
    if (helpers.step) urlArr.push(helpers.step);

    let url = urlArr.join("/");
    // let url = `/liquid/calc/${values.liquid}${(drugDosages.url && drugDosages.url.replace('/concept', '')) || '/dozes'}`
    let className = selectedDrug === drug.key ? "selected" : "";
    className += selectedDrug === drug.key || active || (!selectedDrug && !selectedConflict) ? "" : " unused";

    let resultStyle = { ...(style || {}), ...(!canDrag ? { cursor: "default" } : { cursor: "move" }) };

    let rules = this.renderRules();
    return (
      <List.Item style={resultStyle} className={`nowarnings ${className}`}>
        <List.Content floated="right">
          <Button as={RouterLink} to={url} onClick={this.getLF} icon>
            <Icon className="glowing" name="tint" />
          </Button>
        </List.Content>
        <div className="border" style={{ backgroundColor: "transparent" }} />
        <Responsive as={List.Content} className="ui feed large" fireOnMount minWidth="481">
          <Feed.Event>
            <Feed.Content>
              <Feed.Summary>
                <span className="underlined">
                  <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
                  {/* {name} */}
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

export default MiniDrug;
