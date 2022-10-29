import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import { Form, Segment, Input, Button, Dropdown } from "semantic-ui-react";

import { withTranslation } from "react-i18next";
import _ from "lodash";

import DatePicker from "../../DatePicker";

import Week from "./Week";
import Interval from "./Interval";

import clarifications from "../../../constants/hardcode";



function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[val % 100 > 4 && val % 100 < 20 ? 2 : cases[val % 10 < 5 ? val % 10 : 5]];
}

const ref_days = ["day", "a_day", "days"];

const Schedule = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages"
)(
  observer(
    class Schedule extends Component {
      constructor(props) {
        super(props);
        this.state = {
          timeFromStart: null,
        };
      }

      handleChange = (e, { name, value }) => {
        if (!name && !value) {
          name = e.target.name;
          value = e.target.value;
        }
        console.log({ name, value });

        const { t } = this.props.actions;
        if (name === "dateStart" || name === "dateFinish") {

          if (name === "dateStart" && value === "Invalid date") {
            value = null;
            this.props.actions.scheduleForm.dateStart = null;
            this.props.actions.scheduleForm.dateFinish = null;
            this.props.actions.scheduleForm.finishAlternate = null;
          }
          if (name === "dateFinish" && value === "Invalid date") {
            value = null;
            this.props.actions.scheduleForm.dateFinish = null;
            this.props.actions.scheduleForm.finishAlternate = null;
          }
          if (name === "dateFinish" && value !== "Invalid date") {
            // value = moment(parseInt(moment(value, "x").add(1, "d").format("x")) - 1, "x");
            value = moment(parseInt(moment(value, "x").format("x")), "x");
          }
          if (moment(value).format("x") !== "Invalid date") {
            this.props.actions.scheduleForm[name] = moment(value).format("x");
          }
          if (name === "dateFinish") {
            this.props.actions.scheduleForm.finishAlternate = null;
          }
          if (name === "dateStart" && this.props.actions.scheduleForm.dateFinish < moment(value).format("x")) {
            this.props.actions.scheduleForm.dateFinish = null;
            this.props.actions.scheduleForm.finishAlternate = null;
          }
          let duration_num = null;
          if (this.props.actions.scheduleForm.dateStart && this.props.actions.scheduleForm.dateFinish) {
            duration_num = moment(this.props.actions.scheduleForm.dateFinish, "x").diff(
              moment(this.props.actions.scheduleForm.dateStart, "x"),
              "days"
            );
          }

          duration_num = duration_num === 0 ? 1 : duration_num;
          this.props.drugs.current.duration = duration_num
            ? duration_num + " " + t(declension(ref_days, duration_num))
            : null;
          this.setState({ timeFromStart: this.props.drugs.current.duration });
          this.props.drugs.current.duration_id = null;
        } else {
          switch (name) {
            case "finishAlternate":
              this.props.actions.scheduleForm.finishAlternate =
                this.props.actions.scheduleForm.finishAlternate === value ? null : value;
              this.setState({ timeFromStart: null });
              this.props.drugs.current.duration = null;
              this.props.drugs.current.duration_id = null;
              this.props.actions.scheduleForm.dateFinish = null;
              break;

            default:
              this.props.actions.scheduleForm[name] = value;
          }
          //this.props.actions.scheduleForm[name] = value
        }
      };
      setTomorrow = () => {
        let tomorrow = moment().add(1, "d").toDate();

        this.handleChange(null, {
          name: "dateStart",
          value: tomorrow,
        });
      };
      setDate = (tpl, id) => {
        let { UIText } = this.props.actions;
        let { dateStart } = this.props.actions.scheduleForm;
        this.setState({ timeFromStart: UIText.duration[id] });
        this.props.drugs.current.duration = UIText.duration[id];
        this.props.drugs.current.duration_id = id;
        this.props.actions.scheduleForm.dateFinish = moment(dateStart, "x")
          .add(tpl.x, tpl.timesx)
          .add(-1, "d")
          .format("x");
        this.props.actions.scheduleForm.finishAlternate = null;
      };
      componentDidMount() {
        let {
          actions: {
            UIText,
            scheduleForm: {
              dateStart,
            },
          },
          drugs: { current },
        } = this.props;

        setTimeout(() => {
          let { duration, duration_id } = current;
          //

          if ((duration_id && duration_id.length) || (duration && duration.length)) {
            // console.log({ duration, duration_id });
            this.setState({ timeFromStart: duration || UIText.duration[duration_id] });
          }
        }, 300);
        this.props.actions.scheduleForm.dateStart =
          dateStart || moment(moment().format("DD.MM.YYYY"), "DD.MM.YYYY").format("x");
        // console.log(this.props.actions.scheduleForm.dateStart);
      }

      renderAlterDurations() {
        let { durationsAlt } = clarifications;
        let {
          UIText,
        } = this.props.actions;
        let arr = [];
        _.keys(durationsAlt).forEach((durationKey, i) => {
          let duration = durationsAlt[durationKey];

          arr.push({
            key: i,
            text: UIText.duration[duration.id],
            value: durationKey,
            onClick: () => this.handleChange(null, { name: "finishAlternate", value: duration.id }),
          });
        });
        return arr;
      }

      renderDurations() {
        let { durations } = clarifications;
        let {
          UIText,
        } = this.props.actions;
        let arr = [];
        _.keys(durations).forEach((durationKey, i) => {
          let duration = durations[durationKey];

          arr.push({
            key: i,
            text: UIText.duration[duration.id],
            value: durationKey,
            onClick: () => this.setDate(duration.tpl[0], duration.id),
          });
        });
        return arr;
      }

      render() {
        let {
          actions: {
            active_language,
            UIText,
            scheduleForm: {
              dateStart,
              dateFinish,
              finishAlternate,
              format,
            },
          },
        } = this.props;
        let { t } = this.props.actions;
        let { timeFromStart } = this.state;

        dateStart = (dateStart && moment(dateStart, "x").toDate()) || "";
        dateFinish = (dateFinish && moment(dateFinish, "x").toDate()) || "";

        return (
          <Segment>
            <Form>
              <Form.Group>
                <Form.Field width={4}>
                  <label>
                    {t("home_accepts")} (
                    <span className="link" onClick={this.setTomorrow}>
                      {t("tomorrow")}
                    </span>
                    ):
                  </label>
                  <DatePicker
                    locale={active_language}
                    selected={dateStart}
                    onChange={(value) => this.handleChange(null, { value, name: "dateStart" })}
                  />
                </Form.Field>
                <Form.Field width={7}>
                  <label>{t("end_reception")}:</label>
                  <Input action>
                    <DatePicker
                      locale={active_language}
                      selected={dateFinish}
                      minDate={dateStart}
                      onChange={(value) => this.handleChange(null, { value, name: "dateFinish" })}
                    />
                    <Dropdown
                      scrolling
                      disabled={!dateStart || dateStart.length < 1}
                      className="button"
                      name={"durations"}
                      text={timeFromStart || t("select")}
                      options={this.renderDurations()}
                    />
                  </Input>
                </Form.Field>
                <Form.Field width={5}>
                  <label>{t("or")}</label>
                  <Dropdown
                    disabled={!dateStart || dateStart.length < 1}
                    className={`big fluid button${finishAlternate ? " primary" : ""}`}
                    // primary={finishAlternate !== null}
                    name={"finishAlternate"}
                    text={(finishAlternate && UIText.duration[finishAlternate]) || t("choose")}
                    options={this.renderAlterDurations()}
                  />
                  {false && (
                    <Segment basic as={Button.Group} fluid size="big" minWidth={481}>
                      <Button
                        primary={finishAlternate === "lQ9LkaNuaG/IgjrmfEhzOQ=="}
                        onClick={this.handleChange}
                        name="finishAlternate"
                        value="lQ9LkaNuaG/IgjrmfEhzOQ=="
                      >
                        {t("before_canceling")}
                      </Button>
                    </Segment>
                  )}
                  {false && (
                    <Segment basic as={Button.Group} fluid maxWidth={480}>
                      <Button
                        primary={finishAlternate === "lQ9LkaNuaG/IgjrmfEhzOQ=="}
                        onClick={this.handleChange}
                        name="finishAlternate"
                        value="lQ9LkaNuaG/IgjrmfEhzOQ=="
                      >
                        {t("before_canceling")}
                      </Button>
                    </Segment>
                  )}
                </Form.Field>
              </Form.Group>

              {false && (
                <Form.Group>
                  <Form.Field className="fluid">
                    <label>{t("terms_accepted")}</label>
                    <Segment basic as={Button.Group} fluid widths={3} minWidth={481}>
                      <Button
                        primary={format === "interval"}
                        onClick={this.handleChange}
                        name="format"
                        value="interval"
                      >
                        {t("select")}
                      </Button>
                      <Button primary={format === "once"} onClick={this.handleChange} name="format" value="once">
                        {t("single")}
                      </Button>
                      <Button primary={format === "week"} onClick={this.handleChange} name="format" value="week">
                        {t("by_day_week")}
                      </Button>
                    </Segment>
                    <Segment basic as={Button.Group} fluid widths={2} maxWidth={480}>
                      <Button
                        primary={format === "interval"}
                        onClick={this.handleChange}
                        name="format"
                        value="interval"
                      >
                        {t("single")}
                      </Button>
                      <Button primary={format === "once"} onClick={this.handleChange} name="format" value="once">
                        {t("single")}
                      </Button>
                    </Segment>
                    <Segment basic as={Button.Group} fluid widths={1} maxWidth={480}>
                      <Button primary={format === "week"} onClick={this.handleChange} name="format" value="week">
                        {t("by_day_week")}
                      </Button>
                    </Segment>
                  </Form.Field>
                </Form.Group>
              )}
              {
                {
                  once: <div />,
                  week: <Week />,
                  interval: <Interval />,
                  //'calendar': <Calendar />
                }[format]
              }
            </Form>
          </Segment>
        );
      }
    }
  )
);

export default withTranslation()(Schedule);
