import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import {
  Icon,
  Form,
  Button,
  Dropdown,
  Label,
} from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import clarifications from "../../../constants/hardcode";

import _ from "lodash";

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[val % 100 > 4 && val % 100 < 20 ? 2 : cases[val % 10 < 5 ? val % 10 : 5]];
}

const ref_minutes = ["minute", "minutes", "minut"],
  ref_hours = ["hour", "o_clock", "hours"],
  ref_days = ["day", "a_day", "days"],
  ref_weeks = ["week_time", "weeks", "week_min"],
  ref_months = ["month", "a_month", "months"],
  ref_times = ["once", "times", "once"];

const Interval = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages"
)(
  observer(
    class Interval extends Component {
      constructor(props) {
        super(props);
        this.state = {
          concepts: [],
        };
      }
      handleChange = (e, { name, type, value, index }) => {
        if (!name && !value) {
          name = e.target.name;
          value = e.target.value;
        }
        let { interval } = this.props.actions.scheduleForm;

        interval[index][name] = value;
        this.props.actions.scheduleForm.interval = interval;
      };
      handleAddConcept = (e, { name, value }) => { };
      removeConcept = (i) => {
        // this.setState({ concepts })
      };
      renderTimes({ num, name, index, type, currvalue }) {
        const { t } = this.props.actions;
        return (
          <Dropdown
            name={name}
            selection
            value={currvalue}
            onChange={(e, { name, value }) => this.handleChange(e, { name, type, value, index })}
            placeholder={t("measurements")}
            options={[
              {
                key: "minutes",
                text: t(declension(ref_minutes, num)),
                value: "minutes",
              },
              {
                key: "hours",
                text: t(declension(ref_hours, num)),
                value: "hours",
              },
              {
                key: "days",
                text: t(declension(ref_days, num)),
                value: "days",
              },
              {
                key: "weeks",
                text: t(declension(ref_weeks, num)),
                value: "weeks",
              },
              {
                key: "months",
                text: t(declension(ref_months, num)),
                value: "months",
              },
            ]}
          />
        );
      }
      renderNums({ x, name, index, type, currvalue }) {
        // let type, sort
        return (
          <Dropdown
            name={name}
            value={currvalue}
            selection
            onChange={(e, { name, value }) => this.handleChange(e, { name, type, value, index })}
            placeholder={"X"}
            options={_.map(Array(x), (item, i) => {
              return {
                key: i + 1,
                text: i + 1,
                value: i + 1,
              };
            })}
          />
        );
      }
      renderEvery(i, concept) {
        let { type, x, timesx } = concept;
        const { t } = this.props.actions;
        return (
          <Form.Field inline>
            <label> {t("everyone")} </label>
            {this.renderNums({ x: 60, name: "x", index: i, type, currvalue: x })}
            {this.renderTimes({ num: x || 0, name: "timesx", index: i, type, currvalue: timesx })}
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderPeriod(i, concept) {
        let { type, x, timesx } = concept;
        return (
          <Form.Field inline>
            {this.renderNums({ x: 24, name: "x", index: i, type, currvalue: x })}
            {this.renderTimes({ num: x || 0, name: "timesx", index: i, type, currvalue: timesx })}
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderPeriodIn(i, concept) {
        let { type, x, y, timesx, timesy } = concept;
        const { t } = this.props.actions;
        return (
          <Form.Field inline>
            {this.renderNums({ x: 24, name: "x", index: i, type, currvalue: x })}
            {this.renderTimes({ num: x || 0, name: "timesx", index: i, type, currvalue: timesx })}
            <label> {t("across")} </label>
            {this.renderNums({ x: 24, name: "y", index: i, type, currvalue: y })}
            {this.renderTimes({ num: y || 0, name: "timesy", index: i, type, currvalue: timesy })}
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderCount(i, concept) {
        let { type, x, timesx } = concept;
        const { t } = this.props.actions;
        return (
          <Form.Field inline>
            {this.renderNums({ x: 24, name: "x", index: i, type, currvalue: x })}
            <label>
              {" "}
              {declension(ref_times, x || 0)} {t("in")}{" "}
            </label>
            {this.renderTimes({ num: 1, name: "timesx", index: i, type, currvalue: timesx })}
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderCountEvery(i, concept) {
        let { type, x, y, timesx, timesy } = concept;
        const { t } = this.props.actions;
        return (
          <Form.Field inline>
            {this.renderNums({ x: 24, name: "x", index: i, type, currvalue: x })}
            <label>
              {" "}
              {declension(ref_times, x || 0)} {t("in")}{" "}
            </label>
            {this.renderTimes({ num: 1, name: "timesx", index: i, type, currvalue: timesx })}
            <label> {t("with_breaks")} </label>
            {this.renderNums({ x: 24, name: "y", index: i, type, currvalue: y })}
            {this.renderTimes({ num: y || 0, name: "timesy", index: i, type, currvalue: timesy })}
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderIn(i, concept) {
        let { type, x, timesx } = concept;
        const { t } = this.props.actions;
        return (
          <Form.Field inline>
            <label>{t("across")}</label>
            {this.renderNums({ x: 24, name: "x", index: i, type, currvalue: x })}
            {this.renderTimes({ num: x || 0, name: "timesx", index: i, type, currvalue: timesx })}
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderTime(i, concept) {
        let { type, time } = concept;
        const { t } = this.props.actions;
        return (
          <Form.Field inline>
            <Dropdown
              name={"time"}
              selection
              value={time}
              placeholder={t("time")}
              onChange={(e, { name, value }) => this.handleChange(e, { name, type, value, index: i })}
              options={_.map(Array(48), (item, i) => {
                return {
                  key: i + 1,
                  text: i === 0 || !(i % 2) ? parseInt(i / 2) + ".00" : parseInt(i / 2) + ".30",
                  value: i === 0 || !(i % 2) ? parseInt(i / 2) + ".00" : parseInt(i / 2) + ".30",
                };
              })}
            />
            <Button icon onClick={() => this.removeConcept(i)}>
              <Icon name="delete" />
            </Button>
          </Form.Field>
        );
      }
      renderConcepts() {
        let { interval } = this.props.actions.scheduleForm;
        if (!interval) interval = [];
        return interval.map((concept, i) => {
          return (
            <Label key={"concept" + i}>
              {
                {
                  every: this.renderEvery(i, concept),
                  period: this.renderPeriod(i, concept),
                  period_in: this.renderPeriodIn(i, concept),
                  in: this.renderIn(i, concept),
                  count: this.renderCount(i, concept),
                  count_every: this.renderCountEvery(i, concept),
                  time: this.renderTime(i, concept),
                }[concept.type]
              }
            </Label>
          );
        });
      }

      renderPresets() {
        let { presets } = clarifications;
        let {
          UIText,
          // scheduleForm: { interval },
        } = this.props.actions;
        let arr = [];
        // interval = interval || [];
        _.keys(presets).forEach((presetKey, i) => {
          let preset = presets[presetKey];
          arr.push({
            key: i,
            text: UIText.freq[preset.id],
            value: presetKey,
            onClick: () => (this.props.actions.scheduleForm.interval = preset.tpl),
            //onClick: () => this.props.actions.scheduleForm.interval = _.concat(preset.tpl, interval)
          });
        });
        return arr;
      }

      render() {
        // let {
        //   actions: {
        //     selectedDrug,
        //     selectedConflict,
        //     activeDrugs,
        //     activeConflicts,
        //     stepsData,
        //     scheduleForm: { interval },
        //   },
        //   dosages: {
        //     current: { drug, form, methodform, names },
        //   },
        //   router: { values },
        // } = this.props;

        const { t } = this.props.actions;

        // let concept_types = [
        //   {
        //     key: 1,
        //     text: t("repeat"),
        //     value: "every",
        //     description: t("every_x_days"),
        //     onClick: this.handleAddConcept,
        //   },
        //   {
        //     key: 2,
        //     text: t("period"),
        //     value: "period",
        //     description: t("x_days"),
        //     onClick: this.handleAddConcept,
        //   },
        //   {
        //     key: 4,
        //     text: t("gap"),
        //     value: "in",
        //     description: t("through_x_days"),
        //     onClick: this.handleAddConcept,
        //   },
        //   {
        //     key: 5,
        //     text: t("quantity"),
        //     value: "count",
        //     description: t("x_every_day"),
        //     onClick: this.handleAddConcept,
        //   },
        //   {
        //     key: 7,
        //     text: t("time_receipt"),
        //     value: "time",
        //     description: "(7:30)",
        //     onClick: this.handleAddConcept,
        //   },
        // ];
        return (
          <>
            <Form.Group>
              <Form.Field inline className="fluid">
                <label>{t("multiplicity_reception")}:</label>
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field className="fluid">
                <label>{t("or_create_own")}:</label>
              </Form.Field>
            </Form.Group>
            <div className="concept_container">{this.renderConcepts()}</div>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Interval);
