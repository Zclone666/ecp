import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../../router/a";
import { List, Icon, Form, Label, Segment, Input, Button, Dropdown, Header, TextArea, Dimmer } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import clarifications from "../../../constants/hardcode";

import { checkDouble, clearDouble } from "../../../lib/helpers";

import Schedule from "./Schedule";
import Drugs from "./Drugs";

import _ from "lodash";

const LiquidCalculator = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages",
  "tools",
  "patients"
)(
  observer(
    class LiquidCalculator extends Component {
      constructor(props) {
        super(props);
        this.state = {
          currUnit: null,
          currDurationUnit: "75",
        };
      }
      handleChangeUnit = (e, { name, value }) => {
        if (!name && !value) {
          let { name, value } = e.target;
        }
        // console.log({ name, value });
        this.setState({ [name]: value });
        this.props.actions.liquidForm.calc.dosageUnit = value;
      };

      fieldRelations = {
        dosage: {},
        count: {},
        dosageUnit: {},
        dayCount: {},
        fullDosage: {},
        weightDosage: {},
        dayDosage: {},
        dayWeightDosage: {},
        durationCount: {},
        durationUnit: {},
        fullSpeed: {},
        weightSpeed: {},
        tintSpeed: {},
        liquidSpeed: {},
      };

      handleChangeDurationUnit = (e, { name, value }) => {
        this.setState({ currDurationUnit: value });
        this.props.actions.liquidForm.calc.durationUnit = value;
        this.props.drugs.recalcLiquidParams();
      };

      handleChange = (e, { name, value }) => {
        let {
          actions: {
            liquidForm: {
              calc: { dosage, count, dosageUnit, dayCount, durationCount, durationUnit },
            },
          },
          drugs: { recalcLiquidParams },
          dosages: { getToBase, getFromBase },
        } = this.props;

        value = clearDouble(value);
        let double = false;

        if (name === "specials") {
          this.props.actions.liquidForm[name] = value;
          return;
        }

        if (!checkDouble(value)) {
          double = true;
          if (name == "patient.weight") {
            this.props.patients.current.weight = value;
            // weight = parseFloat(value)
          } else {
            this.props.actions.liquidForm.calc[name] = value;
          }
          return;
        } else if (value != parseFloat(value) && !(value.split(" + ") && value.split(" + ").length > 1)) {
          return;
        }

        let tmp = 0;

        if (["count", "dayCount", "durationCount"].includes(name)) {
          this.props.actions.liquidForm.calc[name] = parseFloat(value);
        } else if (name === "patient.weight") {
          this.props.patients.current.weight = parseFloat(value);
        } else if (name === "tintSpeed") {
          tmp = this.props.actions.liquidForm.calc[name] / parseFloat(value);
          this.props.actions.liquidForm.calc[name] = parseFloat(value);
          this.props.actions.liquidForm.calc.durationCount = parseFloat((tmp * durationCount).toFixed(4));
        } else if (name === "liquidSpeed") {
          tmp = this.props.actions.liquidForm.calc[name] / parseFloat(value);
          this.props.actions.liquidForm.calc[name] = parseFloat(value);
          this.props.actions.liquidForm.calc.durationCount = parseFloat((tmp * durationCount).toFixed(4));
        } else if (name === "specials") {
          // this.props.actions.liquidForm[name] = value
        }

        recalcLiquidParams();
      };

      setPreset = (e, { value }) => {
        let { getToBase, getFromBase, calcValues } = this.props.dosages;
        let { dayCount, dayDosage, dayWeightDosage } = this.props.actions.liquidForm.calc;
        let { freq } = this.props.tools.unitsSchedule;
        let preset = { tpl: freq[value] };
        // this.props.drugs.current.freq = value;
        // this.props.drugs.current.freq_id = preset.tpl[0].id;
        this.props.actions.liquidForm.freq = value;
        this.props.actions.liquidForm.freq_id = preset.tpl[0].id;
        this.props.actions.liquidForm.calc.dayCount = preset.tpl[0].multiplicate;
        this.props.actions.liquidForm.schedule.interval = preset.tpl;

        let dayInMinutes = 1440;

        let unitCount = getToBase(preset.tpl[0].unit_1, preset.tpl[0].value_1) / dayInMinutes;

        if (preset.tpl[0].type == "count") {
          dayCount = unitCount;
          // dayDosage = _.map( (fullDosage || [0]), (dos) => { return preset.tpl[0].value_1 * dos } )
          // dayWeightDosage = _.map( (weightDosage || [0]), (dos) => { return preset.tpl[0].value_1 * dos } )
        } else if (preset.tpl[0].type == "every") {
          dayCount = 1 / unitCount;
          // dayDosage = _.map( (fullDosage || [0]), (dos) => { return dos/unitCount } )
          // dayWeightDosage = _.map( (weightDosage || [0]), (dos) => { return dos/unitCount } )
        }

        this.props.actions.liquidForm.calc.dayCount = dayCount;
        // this.props.actions.liquidForm.calc.dayDosage = dayDosage
        // this.props.actions.liquidForm.calc.dayWeightDosage = dayWeightDosage

        this.props.drugs.recalcLiquidParams();
      };

      renderPresets() {
        let { freq } = this.props.tools.unitsSchedule;
        let arr = [];
        // interval = interval || []
        _.keys(freq).forEach((freqKey, i) => {
          let freqItem = freq[freqKey];
          arr.push({
            key: freqKey,
            text: freqKey,
            value: freqKey,
            // onClick: () => this.props.actions.scheduleForm.interval = preset.tpl
            //onClick: () => this.props.actions.scheduleForm.interval = _.concat(preset.tpl, interval)
          });
        });
        return arr;
      }

      get timeUnits() {
        let {
          tools: { units, unitarrs },
          actions: {
            liquidForm: {
              calc: { durationUnit },
            },
          },
        } = this.props;
        let { currDurationUnit } = this.state;
        let timeUnits = [];
        _.forEach(unitarrs[75], (unitkey, key) => {
          let unit = units[unitkey];
          if (unit.type === "simple" || unit.type === "base") {
            timeUnits.push({
              key: unitkey,
              value: unitkey,
              text: unit.shortname || unit.name,
            });
          }
        });
        let currTimeUnitName =
          units[durationUnit || currDurationUnit].shortname || units[durationUnit || currDurationUnit].name;
        return { timeUnits, currTimeUnitName };
      }

      get weightUnits() {
        let {
          tools: { units, unitarrs },
          actions: {
            liquidForm: {
              calc: { dosageUnit },
            },
          },
          drugs: { calcLiquid },
        } = this.props;
        let { liqUnit } = calcLiquid;
        let { currUnit } = this.state;
        let weightUnits = [];
        _.forEach(unitarrs[42], (unitkey, key) => {
          let unit = units[unitkey];
          if (unit.type === "simple" || unit.type === "base") {
            weightUnits.push({
              key: unitkey,
              value: unitkey,
              text: `${unit.shortname || unit.name}/${
                (liqUnit && (units[liqUnit].shortname || units[liqUnit].name)) || ""
              }`,
            });
          }
        });
        let currWeightUnitName =
          dosageUnit || currUnit ? units[dosageUnit || currUnit].shortname || units[dosageUnit || currUnit].name : "";
        return { weightUnits, currWeightUnitName };
      }

      get valueUnits() {}

      render() {
        let {
          patients: { current: weight },
          actions: {
            liquidForm: {
              name, // Название ДВ или ТН
              group, // группа раствора (0 - нет раствора, больше 0 - раствор)
              specials,
              freq,
              duration,
              calc: {
                dosage,
                count,
                dosageUnit,
                dayCount,
                fullDosage,
                weightDosage,
                dayDosage,
                dayWeightDosage,
                durationCount,
                durationUnit,
                fullSpeed,
                weightSpeed,
                tintSpeed,
                liquidSpeed,
              },
              schedule: {
                dateStart,
                dateFinish,
                finishAlternate,
                clarifications, //уточнения
                interval,
                once,
                week,
                calendar,
              },
            },
          },
          drugs: { calcLiquid },
          tools: { round, units, unitarrs },
          dosages: { getFromBase },
          router: { values },
          isLiquid,
        } = this.props;
        const { t } = this.props.actions;
        let { timeUnits, currTimeUnitName } = this.timeUnits;
        let { weightUnits, currWeightUnitName } = this.weightUnits;
        let { currUnit, currDurationUnit } = this.state;

        let {
          ready,
          liqUnit,
          weights: cWeights,
          counts: cCounts,
          weight: cWeight,
          count: calcCount,
          unit,
        } = calcLiquid;

        let liquid = (values && values.liquid) || null;

        let def = unit || "248";

        let disableAll = !ready;
        let disableMulti = true;
        // console.log(currUnit, def, fullDosage);
        // console.log(getFromBase(currUnit || def, fullDosage).join(" + "));
        return (
          <Segment basic>
            {isLiquid && (
              <div className="liquiddrugs" style={{ marginBottom: "15px" }}>
                <Header>{t("components_solution")}</Header>
                <Drugs liquid={liquid} />
              </div>
            )}
            <Dimmer.Dimmable as={"div"} dimmed={disableAll}>
              <Form>
                <Form.Group>
                  <Form.Field width={4}>
                    <label>{t("dosage")}:</label>
                    <Input
                      size="big"
                      name="dosage"
                      value={getFromBase(currUnit || unit, dosage).join(" + ") || ""}
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>
                        <Dropdown
                          name="currUnit"
                          onChange={this.handleChangeUnit}
                          options={weightUnits}
                          value={currUnit || unit}
                        />
                      </Label>
                    </Input>
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("number_dose")}:</label>
                    <Input
                      disabled={disableAll}
                      size="big"
                      name="count"
                      numeric
                      value={liqUnit && count != null ? getFromBase(liqUnit, count) : 0}
                      label={{
                        basic: true,
                        content: (liqUnit && (units[liqUnit].shortname || units[liqUnit].name)) || "",
                      }}
                      labelPosition="right"
                      placeholder="3"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("motherwise_dose")}:</label>
                    <Input
                      size="big"
                      name="fullDosage"
                      value={getFromBase(currUnit || def, fullDosage).join(" + ") || ""}
                      label={{ basic: true, content: currWeightUnitName || t("mg") }}
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>{currWeightUnitName || t("mg")}</Label>
                    </Input>
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("body_mass")}:</label>
                    <Input
                      disabled={disableAll}
                      size="big"
                      name="patient.weight"
                      value={weight?.weight || ""}
                      label={{ basic: true, content: t("kg") }}
                      labelPosition="right"
                      placeholder="60.5"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("kg_body_weight")}:</label>
                    <Input
                      size="big"
                      name="weightDosage"
                      value={getFromBase(currUnit || def, weightDosage, 4).join(" + ") || ""}
                      label={{ basic: true, content: `${currWeightUnitName || t("mg")}/${t("kg")}` }}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>{`${currWeightUnitName || t("mg")}/${t("kg")}`}</Label>
                    </Input>
                  </Form.Field>
                </Form.Group>
                <Form.Group>
                  <Form.Field width={4}>
                    <label>{t("multiplicity_reception")}:</label>
                    <Dropdown
                      disabled={disableAll}
                      selection
                      // defaultValue={freq || null}
                      value={freq || null}
                      className="input big"
                      name={"dayCount"}
                      placeholder={t("select")}
                      onChange={this.setPreset}
                      options={this.renderPresets()}
                    />
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("daily_dose")}:</label>
                    <Input
                      size="big"
                      name="dayDosage"
                      value={getFromBase(currUnit || def, dayDosage).join(" + ") || ""}
                      label={{ basic: true, content: currWeightUnitName || t("mg") }}
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>{currWeightUnitName || t("mg")}</Label>
                    </Input>
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("kg_weight_day")}:</label>
                    <Input
                      size="big"
                      name="dayWeightDosage"
                      value={getFromBase(currUnit || def, dayWeightDosage).join(" + ") || ""}
                      label={{ basic: true, content: `${currWeightUnitName || t("mg")}/${t("kg")}/${t("sut")}` }}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>{`${currWeightUnitName || t("mg")}/${t("kg")}`}</Label>
                    </Input>
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("duration_administration")}:</label>
                    <Input
                      disabled={disableAll}
                      size="big"
                      name="durationCount"
                      value={durationCount || 0}
                      label={
                        <Dropdown
                          name="durationUnit"
                          onChange={this.handleChangeDurationUnit}
                          options={timeUnits}
                          value={durationUnit || currDurationUnit}
                        />
                      }
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                </Form.Group>
                <Form.Group>
                  <Form.Field width={4}>
                    <label>{t("speed_administration")}:</label>
                    <Input
                      size="big"
                      name="fullSpeed"
                      value={getFromBase(currUnit || def, fullSpeed).join(" + ") || ""}
                      label={{ basic: true, content: `${currWeightUnitName || t("mg")}/${currTimeUnitName}` }}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>{`${currWeightUnitName || t("mg")}/${currTimeUnitName}`}</Label>
                    </Input>
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("speed_introduction_by_kg")}:</label>
                    <Input
                      size="big"
                      name="weightSpeed"
                      value={getFromBase(currUnit || def, weightSpeed).join(" + ") || ""}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    >
                      <input readonly="readonly" className="readonly" />
                      <Label basic>{`${currWeightUnitName || t("mg")}/${t("kg")}/${currTimeUnitName}`}</Label>
                    </Input>
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("speed_in_drops")}:</label>
                    <Input
                      size="big"
                      name="tintSpeed"
                      value={tintSpeed || ""}
                      label={{ basic: true, content: `${t("cap")}/${currTimeUnitName}` }}
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("speed_in_ml")}:</label>
                    <Input
                      size="big"
                      name="liquidSpeed"
                      value={liquidSpeed || ""}
                      label={{ basic: true, content: `${t("ml")}/${currTimeUnitName}` }}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                </Form.Group>
              </Form>
              {!disableAll && <Schedule />}
              <Form>
                <Form.Group>
                  <Form.Field width={16}>
                    <TextArea
                      size="big"
                      name="specials"
                      value={specials || ""}
                      placeholder={t("special_instructions")}
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                </Form.Group>
              </Form>
              <Dimmer inverted active={disableAll}>
                <Header as="h2" icon color="grey">
                  <Icon name="external square alternate" />
                  {t("first_specify_dosage_components_solution")}
                </Header>
              </Dimmer>
            </Dimmer.Dimmable>
          </Segment>
        );
      }
    }
  )
);

export default withTranslation()(LiquidCalculator);
