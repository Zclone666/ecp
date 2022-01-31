import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../../router/a";
import { List, Icon, Form, Segment, Input, Button, Dropdown, Header, TextArea, Dimmer } from "semantic-ui-react";

import clarifications from "../../../constants/hardcode";
import { withTranslation } from "react-i18next";
import { checkDouble, clearDouble } from "../../../lib/helpers";

import Schedule from "./Schedule";
import Drugs from "./Drugs";

import _ from "lodash";

const Calculator = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages",
  "tools",
  "patients"
)(
  observer(
    class Calculator extends Component {
      constructor(props) {
        super(props);
        this.state = {
          currUnit: null,
        };
      }
      handleChangeUnit = (e, { name, value }) => {
        if (!name && !value) {
          let { name, value } = e.target;
        }
        // console.log({ name, value });
        this.setState({ [name]: value });
        this.props.actions.calculatorForm.dosageUnit = value;
      };

      handleChange = (e, { name, value }) => {
        // console.log({ name, value });
        let { getToBase, calcValues } = this.props.dosages;
        let { dosage: dos, count: cnt } = calcValues;
        let { currUnit } = this.state;
        let def = (dos.firstUnit && dos.firstUnit.id) || (dos.unit && dos.unit.id) || 248;

        if (!name && !value) {
          let { name, value } = e.target;
        }
        let weight = parseFloat(this.props.patients.current.weight);
        //console.log({name, value}, !!value);
        //value = _.map( value, (dos) => dos.split(',').join('.') )
        //if(!_.isArray(value)) value = [value]
        //value = parseFloat(eval(value))
        value = clearDouble(value);
        // console.log(value);
        let double = false;
        if (name === "specials") {
          this.props.actions.drugStructure.specials = value;
          return;
        }
        if (!checkDouble(value)) {
          double = true;
          if (name == "patient.weight") {
            this.props.patients.current.weight = value;
            // weight = parseFloat(value)
          } else {
            // console.log(value);
            this.props.actions.calculatorForm[name] = value;
          }
          return;
        } else if (value != parseFloat(value) && !(value.split(" + ") && value.split(" + ").length > 1)) {
          return;
        }
        //value = parseFloat(value)

        if (name == "patient.weight" && !double) {
          this.props.patients.current.weight = parseFloat(value);
          weight = parseFloat(value);
        } else {
          // this.props.actions.calculatorForm[name] = value
        }

        let { dosage, count, dayCount, dosageUnit, fullDosage, weightDosage, dayDosage, dayWeightDosage } =
          this.props.actions.calculatorForm;

        // console.log({ dosage, count, dayCount, dosageUnit, fullDosage, weightDosage, dayDosage, dayWeightDosage });

        switch (name) {
          case "dosage":
            dosage = [getToBase(currUnit || def, value.split(" + "))];
            fullDosage = [getToBase(currUnit || def, value * count)];
            weightDosage = !weight
              ? [0]
              : _.map(fullDosage, (dos) => {
                  return dos / weight;
                });
            // console.log({ dosage, value, fullDosage });
            break;
          case "count":
            count = parseFloat(value.split(",").join("."));
            fullDosage = _.map(dosage, (dos) => {
              // console.log({value, v1: parseFloat(value.split(',').join('.')),dos});
              return parseFloat(value.split(",").join(".")) * dos;
            });
            // console.log({ dosage, value, fullDosage });
            weightDosage = !weight
              ? [0]
              : _.map(fullDosage, (dos) => {
                  return dos / weight;
                });
            break;
          case "patient.weight":
            //fullDosage = _.map( dosage, (dos) => { return count*dos } )
            weightDosage = !weight
              ? [0]
              : _.map(fullDosage, (dos) => {
                  // console.log({dos,weight, res: dos/weight});
                  return dos / weight;
                });
            break;
          case "fullDosage":
            fullDosage = [];
            fullDosage.push(getToBase(currUnit || def, value.split(" + ")));
            count = fullDosage[0] / dosage;
            // console.log({weight,fullDosage});
            // weightDosage = !weight ? [0] : _.map( fullDosage, (dos) => { return dos/weight } )
            break;
          case "weightDosage":
            weightDosage = getToBase(currUnit || def, value.split(" + "));
            fullDosage = _.map(weightDosage, (dos) => {
              return dos * weight;
            });
            count = fullDosage / dosage;
            break;
          default:
        }

        dayDosage = _.map(fullDosage, (dos) => {
          return dos * dayCount;
        });
        dayWeightDosage = !weight
          ? [0]
          : _.map(weightDosage, (dos) => {
              return dos * dayCount;
            });

        // this.props.actions.calculatorForm.dosage = dosage
        // this.props.actions.calculatorForm.count = count
        // this.props.actions.calculatorForm.fullDosage = fullDosage
        // this.props.actions.calculatorForm.weightDosage = weightDosage
        // this.props.actions.calculatorForm.dayDosage = dayDosage
        // this.props.actions.calculatorForm.dayWeightDosage = dayWeightDosage
        // console.log(2, {count});
        Object.assign(this.props.actions.calculatorForm, {
          dosage,
          count,
          dayCount,
          dosageUnit,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
        });

        setTimeout(() => {
          // console.log({
          //   dosage,
          //   count,
          //   dayCount,
          //   fullDosage,
          //   weightDosage,
          //   dayDosage,
          //   dayWeightDosage
          // });
          this.forceUpdate();
        }, 300);

        //console.log({ name, value });
      };

      setPreset = (e, { value }) => {
        let { getToBase, getFromBase, calcValues } = this.props.dosages;
        let { freq } = this.props.tools.unitsSchedule;
        let preset = { tpl: freq[value] }; //_.find(presets, { 'id': value});
        let { type, dosage, count, dosageUnit, dayCount, fullDosage, weightDosage, dayDosage, dayWeightDosage } =
          this.props.actions.calculatorForm;
        this.props.drugs.current.freq = value;
        this.props.drugs.current.freq_id = preset.tpl[0].id;
        this.props.actions.scheduleForm.interval = preset.tpl;

        let dayInMinutes = 1440;

        let unitCount = getToBase(preset.tpl[0].unit_1, preset.tpl[0].value_1) / dayInMinutes;
        // let unitCount = 1
        // console.log({unitCount});
        if (preset.tpl[0].type == "count") {
          dayCount = unitCount;
          dayDosage = _.map(fullDosage || [0], (dos) => {
            return preset.tpl[0].value_1 * dos;
          });
          dayWeightDosage = _.map(weightDosage || [0], (dos) => {
            return preset.tpl[0].value_1 * dos;
          });
        } else if (preset.tpl[0].type == "every") {
          dayCount = 1 / unitCount;
          dayDosage = _.map(fullDosage || [0], (dos) => {
            return dos / unitCount;
          });
          dayWeightDosage = _.map(weightDosage || [0], (dos) => {
            return dos / unitCount;
          });
        }

        this.props.actions.calculatorForm = {
          type,
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
        };
      };

      renderPresets() {
        // let { presets } = clarifications
        // let { UIText, scheduleForm: { interval } } = this.props.actions
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

      render() {
        let {
          actions: {
            drugStructure: { specials },
            calculatorForm: {
              type,
              dosage,
              count,
              dosageUnit,
              dayCount,
              fullDosage,
              weightDosage,
              dayDosage,
              dayWeightDosage,
            },
          },
          tools: { round, units, unitsSchedule },
          dosages: {
            current: { drug, form, methodform, names },
            calcValues,
            getFromBase,
          },
          router: { values },
          drugs: { current },
          patients: {
            current: { weight },
          },
          isLiquid,
        } = this.props;
        const { t } = this.props.actions;
        let { currUnit } = this.state;
        let freqFirst = _.keys(unitsSchedule.freq)[0];
        let weights = [];
        let { dosage: dos, count: cnt } = calcValues;

        // console.log({ calcValues });

        // console.log({weightDosage});
        // console.log({cnt});
        _.forEach(dos.units, (weight, key) => {
          // console.log({weight, dos});
          if (dos.firstUnit) {
            weights.push({
              key,
              value: key,
              text: `${weight.shortname || weight.name}/${dos.secondUnit.shortname || dos.secondUnit.name}`,
            });
          } else {
            weights.push({
              key,
              value: key,
              text: weight.shortname || weight.name,
            });
          }
        });
        if (weights.length === 0) {
          weights.push({
            key: 248,
            value: 248,
            text: units[248].shortname || units[248].name,
          });
        }

        let currUnitObj = dos.units[currUnit];

        let secondName = currUnit
          ? currUnitObj && (currUnitObj.shortname || currUnitObj.name)
          : (dos.firstUnit && (dos.firstUnit.shortname || dos.firstUnit.name)) ||
            (dos.unit && (dos.unit.shortname || dos.unit.name));
        let def = (dos.firstUnit && dos.firstUnit.id) || (dos.unit && dos.unit.id) || 248;

        let liquid = (values && values.liquid) || null;

        let disableAll = !!isLiquid;
        let disableMulti = type === "multi";

        // console.log({
        //   type,
        //   dosage,
        //   count,
        //   dosageUnit,
        //   dayCount,
        //   fullDosage,
        //   weightDosage,
        //   dayDosage,
        //   dayWeightDosage
        // });
        // console.log({dosage: getFromBase((currUnit || def), dosage).join(' + ')});
        const concetrationNeeded = ["/ml", "/мл"].some((u) =>
          weights
            .map((w) => w.text)
            .join(" ")
            .includes(u)
        );
        if (concetrationNeeded) {
          weights.push({
            key: 99,
            value: 99,
            text: "%",
          });
        }
        //
        // console.log({ currUnit, weights, dosage });
        //
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
                    <label>{concetrationNeeded ? t("concentration") : t("dosage")}:</label>
                    <Input
                      readOnly={concetrationNeeded}
                      disabled={disableAll || disableMulti}
                      size="big"
                      name="dosage"
                      value={getFromBase(currUnit || def, dosage).join(" + ") || ""}
                      label={
                        <Dropdown
                          name="currUnit"
                          onChange={this.handleChangeUnit}
                          options={weights}
                          value={currUnit || def}
                        />
                      }
                      labelPosition="right"
                      // placeholder="500"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("number_dose")}:</label>
                    <Input
                      disabled={disableAll}
                      size="big"
                      name="count"
                      numeric
                      value={count != null ? count : cnt.value}
                      label={{ basic: true, content: (cnt.unit && (cnt.unit.shortname || cnt.unit.name)) || "" }}
                      labelPosition="right"
                      placeholder="3"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("motherwise_dose")}:</label>
                    <Input
                      disabled={disableAll || disableMulti}
                      size="big"
                      name="fullDosage"
                      value={getFromBase(currUnit || def, fullDosage).join(" + ") || ""}
                      label={{ basic: true, content: secondName || t("mg") }}
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("body_mass")}:</label>
                    <Input
                      disabled={disableAll}
                      size="big"
                      name="patient.weight"
                      value={weight || ""}
                      label={{ basic: true, content: t("kg") }}
                      labelPosition="right"
                      placeholder="60.5"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={3}>
                    <label>{t("kg_body_weight")}:</label>
                    <Input
                      disabled={disableAll || disableMulti}
                      size="big"
                      name="weightDosage"
                      value={getFromBase(currUnit || def, weightDosage, 4).join(" + ") || ""}
                      label={{ basic: true, content: `${secondName || t("mg")}/${t("kg")}` }}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                </Form.Group>
                <Form.Group>
                  {!liquid && (
                    <Form.Field width={4}>
                      <label>{t("multiplicity_reception")}:</label>
                      <Dropdown
                        disabled={disableAll}
                        selection
                        // defaultValue={(current && current.freq) || null}
                        value={current?.freq}
                        className="input big"
                        name={"dayCount"}
                        placeholder={t("select")}
                        onChange={this.setPreset}
                        options={this.renderPresets()}
                      />
                    </Form.Field>
                  )}
                  <Form.Field width={6}>
                    <label>{t("daily_dose")}:</label>
                    <Input
                      disabled={disableAll || disableMulti}
                      size="big"
                      name="dayDosage"
                      value={getFromBase(currUnit || def, dayDosage).join(" + ") || ""}
                      label={{ basic: true, content: secondName || t("mg") }}
                      labelPosition="right"
                      placeholder="500"
                      onChange={this.handleChange}
                      readOnly={true}
                    />
                  </Form.Field>
                  <Form.Field width={6}>
                    <label>{t("kg_weight_day")}:</label>
                    <Input
                      disabled={disableAll || disableMulti}
                      size="big"
                      name="dayWeightDosage"
                      value={getFromBase(currUnit || def, dayWeightDosage).join(" + ") || ""}
                      label={{ basic: true, content: `${secondName || t("mg")}/${t("kg")}` }}
                      labelPosition="right"
                      placeholder="0"
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                </Form.Group>
              </Form>
              {!liquid && <Schedule />}
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

export default withTranslation()(Calculator);
