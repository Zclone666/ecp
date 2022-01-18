import React, { Fragment } from "react";
import { inject, observer } from "mobx-react";

import { useDrag } from "react-dnd";

import RouterLink from "../../router/a";

import { Menu, List, Feed, Button, Responsive, Icon, Popup, Dropdown, Visibility } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import moment from "moment";

const Drug = inject(
  "db",
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
    class Drug extends React.Component {
      constructor(props) {
        super(props);

        this.state = {
          open: true,
        };
      }
      getLF = async () => {
        let {
          drugs: { current }, //drugs, drugsDosages, currDrug, setDosageParams
          dosages: { dosage },
          warnings: { warning, groups }, //warnings, warnGroups
          router: { location },
          drug,
        } = this.props;
        await this.props.drugs.setCurrent({ key: drug.key, id: drug.id });
        // this.props.drugs.current = { ...drug };
        await this.props.drugs.getDosageParams();
        // await this.props.dosages.get(drug);
        //this.props.db.GetDuration(drug)

        // this.props.router.push('/concepts/dozes')
      };
      getAnalog = async () => {
        let { drug } = this.props;
        await this.props.analogs.get(drug);
      };

      getInfo = async () => {
        let { drug } = this.props;
        await this.props.druginfo.get(drug);
      };

      unselectDrug = () => {
        let { drug: drugObj } = this.props;
        let drug = this.props.drugs.drug.get(drugObj.key);
        this.props.drugs.unselectDrug(drug);
      };
      selectDrug = (e, drugId) => {
        e.preventDefault();
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, misLinkLogin: misDisabled },
          drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
          dosages: { dosage },
          warnings: { warning, groups: warnGroups }, //warnings, warnGroups
        } = this.props;
        let selectedWarnings = warning[drugId];
        let groups = [];
        let drugs = [];
        for (let key in selectedWarnings) {
          groups = _.unionWith(groups, [selectedWarnings[key].group], (a, b) => a === b);
          drugs = _.unionWith(drugs, [key], (a, b) => a === b);
        }
        // console.log({ groups, drugs });
        if (this.props.actions.selectedDrug === drugId) {
          this.props.actions.selectedDrug = null;
          this.props.actions.selectedConflict = null;
          this.props.actions.activeConflicts = [];
          this.props.actions.activeDrugs = [];
        } else {
          this.props.actions.selectedDrug = drugId;
          this.props.actions.selectedConflict = null;
          this.props.actions.activeConflicts = groups;
          this.props.actions.activeDrugs = drugs;
        }
        //return false
      };

      renderRules() {
        let {
          dosages: { getFromBase },
          tools: { names, shortnames, round },
          drug: { freq, freq_id, duration, duration_id, calc, dosage, helpers, schedule },
          drug,
          actions: { UIText },
        } = this.props;
        helpers = helpers || {};
        let { finishAlternate } = schedule || {};

        let arr = [];

        if (calc && calc.fullDosage && helpers.dosage && helpers.dosage.id) {
          let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
          let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];
          arr.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`);
        }

        // if(freq) arr.push(freq)

        // if(duration) arr.push(duration)
        // if(freq && UIText.freq[freq]) arr.push(UIText.freq[freq])
        // console.log({ UIText });
        if (freq_id && UIText && UIText.freq && UIText.freq[freq_id]) {
          arr.push(UIText.freq[freq_id]);
        } else if (freq) {
          arr.push(freq);
        }
        if (duration_id && UIText.duration[duration_id]) {
          arr.push(UIText.duration[duration_id]);
        } else if (duration) {
          arr.push(duration);
        }
        if (finishAlternate && UIText.duration[finishAlternate]) arr.push(UIText.duration[finishAlternate]);

        return {
          empty: arr.length < 1,
          text: arr.join(", "),
        };
      }

      render() {
        let {
          actions: {
            selectedDrug,
            selectedConflict,
            activeDrugs,
            activeConflicts,
            disabled,
            topview_disabled,
            misLinkLogin: misDisabled,
          },
          drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
          dosages: { dosage: dose },
          warnings: { warning, groups, icons: warnIcons }, //warnings, warnGroups, warnIcons
          drug: ldrug,
          active,
          style,
          minus,
          onRemove,
          canDrag,
        } = this.props;

        const { t } = this.props.actions;
        // console.log({ drugs: Array.from(this.props.drugs.drug.values()) });
        let drug = this.props.drugs.drug.get(ldrug.key) || {};
        let selectedWarnings = warnIcons[selectedDrug];
        const drugWarnings = _.orderBy(
          Array.from(warning.values()),
          ["step", "value", "trust"],
          ["desc", "desc", "desc"]
        );
        const arrowColor = drugWarnings?.length > 0 ? drugWarnings[0].color : false;
        // console.log({ drug });
        let { key, name, level, tn, type, dosage, helpers, specials, date } = drug;
        const dateOfPrescription = date ? moment(date, "x").format("DD.MM.YYYY") : "";
        let drugDosages = dose.get(drug.id) || {};
        let hasWarnings = warning.size > 0;
        let names = drugDosages.names || {};
        let nameshort = drugDosages.nameshort || {};
        dosage = dosage || {};
        helpers = helpers || {};

        let dosReady = !!drugDosages.names;

        let urlArr = ["/concept/dozes"];
        // console.log({drug});
        if (helpers.way) urlArr.push(helpers.way);
        if (helpers.step) urlArr.push(helpers.step);

        let url = urlArr.join("/");

        let currWarning = active;
        let hasWarning = warnIcons[drug.key] && !_.isEmpty(warnIcons[drug.key]);
        let maxItem = warnIcons[drug.key];

        let className = selectedDrug === drug.key ? "selected" : "";
        className += selectedDrug === drug.key || active || (!selectedDrug && !selectedConflict) ? "" : " unused";
        className += drug.proto && !drug.edit ? "" : " noproto"; // edited or new drugs

        let hasBorder = selectedDrug === drug.key && maxItem;

        let resultStyle = { ...(style || {}), ...(!canDrag ? { cursor: "default" } : { cursor: "move" }) };

        let rules = this.renderRules();

        // console.log({ dosage, nameshort, names, helpers });

        const dosageForm =
          dosage.form && (nameshort[dosage.form] || names[dosage.form])
            ? nameshort[dosage.form] || names[dosage.form]
            : "";
        const helpersDosage =
          helpers.dosage && (helpers.dosage.small || helpers.dosage.full)
            ? helpers.dosage.small || helpers.dosage.full
            : "";
        const dosageMethod =
          dosage.method && (nameshort[dosage.method] || names[dosage.method])
            ? nameshort[dosage.method] || names[dosage.method]
            : "";

        // console.log({ dosage, nameshort, names, helpers, rules });
        // console.log({ dosageForm, helpersDosage, dosageMethod });

        return (
          <List.Item style={resultStyle} className={`${!hasWarnings ? "nowarnings " : ""}${className}`}>
            <List.Content floated="right">
              <div style={{ float: "left", marginRight: "8px" }}>{dateOfPrescription}</div>
              <Responsive fireOnMount as={Button.Group} minWidth={misDisabled ? "1" : "481"}>
                {!disabled && dosReady && (
                  <Popup
                    content={t("dosage")}
                    trigger={
                      <Button disabled={drug.group !== 0} as={RouterLink} to={url} onClick={this.getLF} icon>
                        <Icon name="tint" />
                      </Button>
                    }
                  />
                )}
                {!disabled && !dosReady && (
                  <Button disabled icon style={{ visibility: "hidden" }}>
                    <Icon loading name="circle notch" />
                  </Button>
                )}

                {!disabled && (
                  <Popup
                    content={t("analogues")}
                    trigger={
                      <Button
                        disabled={drug.group !== 0}
                        icon
                        as={RouterLink}
                        to={`/analog/${drug.key}`}
                        onClick={this.getAnalog}
                      >
                        <Icon name="font" />
                      </Button>
                    }
                  />
                )}
                {!disabled && (
                  <Popup
                    content={t("delete")}
                    trigger={
                      <Button icon onClick={this.unselectDrug}>
                        <Icon name="delete" />
                      </Button>
                    }
                  />
                )}
                {!disabled && minus && (
                  <Popup
                    content={t("remove_from_solution")}
                    trigger={
                      <Button icon onClick={onRemove}>
                        <Icon name="minus" />
                      </Button>
                    }
                  />
                )}
              </Responsive>
              {!disabled && minus && (
                <Responsive fireOnMount as={Button.Group} maxWidth={misDisabled ? "0" : "480"}>
                  <Popup
                    content={t("remove_from_solution")}
                    trigger={
                      <Button icon onClick={onRemove}>
                        <Icon name="minus" />
                      </Button>
                    }
                  />
                </Responsive>
              )}
            </List.Content>
            <div className="border" style={{ backgroundColor: (hasBorder && maxItem.color) || "transparent" }} />
            <div className="arrowholder">
              {/* {console.log("curr warning: ", currWarning, arrowColor, Array.from(warning.values()), selectedWarnings)} */}
              {currWarning && currWarning.color ? (
                <RouterLink
                  to={"/warning/" + drug.key}
                  className="left floated content arrowBg"
                  style={{ backgroundColor: arrowColor ? arrowColor : currWarning.color }}
                >
                  <List.Icon
                    name="arrow alternate circle right"
                    style={{ color: "#FFF" }}
                    size="large"
                    onClick={() => {}}
                  />
                </RouterLink>
              ) : (
                <RouterLink to={"/warning/" + drug.key} className="left floated content arrowBg none">
                  <List.Icon name="arrow alternate circle right" style={{ color: "#FFF" }} size="large" />
                </RouterLink>
              )}
            </div>
            {hasWarnings &&
              (hasWarning ? (
                <List.Icon
                  name="warning circle"
                  style={{ color: maxItem.color }}
                  size="large"
                  onClick={(e) => this.selectDrug(e, drug.key)}
                />
              ) : (
                <List.Icon name="warning circle" size="large" style={{ color: "transparent", textShadow: "unset" }} />
              ))}
            <Responsive as={List.Content} className="ui feed large" fireOnMount minWidth={misDisabled ? "1" : "481"}>
              <Feed.Event>
                <Feed.Content>
                  <Feed.Summary>
                    <RouterLink to={`/druginfo/${drug.key}`} onClick={this.getInfo} className="underlined">
                      <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
                    </RouterLink>
                    {type === "TN" && (
                      <span>
                        <sup>TM</sup>
                      </span>
                    )}
                    {specials && <Popup content={specials} trigger={<Icon name="file alternate" />} />}
                    <Feed.Date className={!dosReady ? "gradient" : ""}>
                      {dosageForm}
                      {helpersDosage && `${dosageForm && ", "}${helpersDosage}`}
                      {/* {dosage.form && (nameshort[dosage.form] || names[dosage.form])}{" "}
                  {helpers.dosage && (helpers.dosage.small || helpers.dosage.full) && ", "}
                  {(helpers.dosage && (helpers.dosage.small || helpers.dosage.full)) || ""} */}
                    </Feed.Date>
                  </Feed.Summary>
                  <Feed.Meta className={!dosReady ? "gradient" : ""}>
                    {dosageMethod}
                    {!rules.empty && dosageMethod ? ", " : ""}
                    {rules.text}
                  </Feed.Meta>
                </Feed.Content>
              </Feed.Event>
            </Responsive>
            <Responsive as={Fragment} maxWidth={misDisabled ? "0" : "480"}>
              <List.Content
                className="ui feed large"
                as={Dropdown}
                floating
                fluid
                icon={null}
                trigger={
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
                        {specials && <Popup content={specials} trigger={<Icon name="file alternate" />} />}
                      </Feed.Summary>

                      <Feed.Meta>
                        {dosageForm && dosageForm.trim()}
                        {helpersDosage && `${dosageForm && ", "}${helpersDosage.trim()}`}
                        {dosageMethod && `${(dosageForm || helpersDosage) && ", "}${dosageMethod}`}
                        {/* {helpers.dosage && (helpers.dosage.small || helpers.dosage.full) && ", "}
                    {(helpers.dosage && (helpers.dosage.small || helpers.dosage.full)) || ""}
                    {(nameshort[dosage.method] || names[dosage.method]) && ", "}
                    {rules.empty && (nameshort[dosage.method] || names[dosage.method] || "")} */}
                      </Feed.Meta>
                      <br />
                      {!rules.empty && (
                        <Feed.Meta>
                          {dosageMethod}
                          {!rules.empty && dosageMethod ? ", " : ""}
                          {rules.text}
                        </Feed.Meta>
                      )}
                    </Feed.Content>
                  </Feed.Event>
                }
              >
                {!disabled && (
                  <Dropdown.Menu>
                    {dosReady && (
                      <Dropdown.Item
                        disabled={drug.group !== 0}
                        icon="tint"
                        as={RouterLink}
                        to={url}
                        onClick={this.getLF}
                        text={t("dosage")}
                      />
                    )}
                    {!dosReady && (
                      <Dropdown.Item disabled icon={<Icon loading name="circle notch" />} text={t("dosage")} />
                    )}

                    <Dropdown.Item
                      disabled={drug.group !== 0}
                      icon="font"
                      as={RouterLink}
                      to={`/analog/${drug.key}`}
                      onClick={this.getAnalog}
                      text={t("analogues")}
                    />
                    <Dropdown.Item
                      icon="ellipsis horizontal"
                      as={RouterLink}
                      to={`/druginfo/${drug.key}`}
                      text={t("more")}
                      onClick={this.getInfo}
                    />
                    <Dropdown.Item icon="delete" onClick={this.unselectDrug} text={t("remove_from_list")} />
                  </Dropdown.Menu>
                )}
              </List.Content>
            </Responsive>
            {!disabled && canDrag && !topview_disabled && (
              <div className="draghandler">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}
          </List.Item>
        );
      }
    }
  )
);

export default withTranslation()(Drug);
