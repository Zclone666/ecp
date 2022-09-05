import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import RouterLink from "../../../router/a";
import { List, Icon, Form, Segment, Input, Button, Dropdown, Responsive } from "semantic-ui-react";

import { DatePickerInput } from "rc-datepicker";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import Week from "./Week";
import Interval from "./Interval";
import Calendar from "./Calendar";

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
        this.dateFinish = React.createRef();
      }
      handleChange = (e, { name, value }) => {
        if (!name && !value) {
          let { name, value } = e.target;
        }
        // console.log({ name, value });
        const { t } = this.props.actions;
        if (name === "dateStart" || name === "dateFinish") {
          // let dateReg = /^[0-9]{1,2}(\.[0-9]{0,2}(\.[0-9]{0,4})?)?$/gi;
          // if (!dateReg.test(value)) return;
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
            value = moment(parseInt(moment(value, "x").add(1, "d").format("x")) - 1, "x");
          }
          if (moment(value).format("x") !== "Invalid date")
            this.props.actions.scheduleForm[name] = moment(value).format("x");
          if (name === "dateFinish") this.props.actions.scheduleForm.finishAlternate = null;
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
                this.props.actions.scheduleForm.finishAlternate == value ? null : value;
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
              dateFinish,
              finishAlternate,
              clarifications, //уточнения
              interval,
              once,
              week,
              calendar,
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
          scheduleForm: { interval },
        } = this.props.actions;
        let arr = [];
        interval = interval || [];
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
          scheduleForm: { interval },
        } = this.props.actions;
        let arr = [];
        interval = interval || [];
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
            selectedDrug,
            selectedConflict,
            activeDrugs,
            activeConflicts,
            stepsData,
            UIText,
            scheduleForm: {
              dateStart,
              dateFinish,
              finishAlternate,
              clarifications, //уточнения
              interval,
              once,
              week,
              format,
              calendar,
            },
          },
          dosages: {
            current: { drug, form, methodform, names },
          },
          router: { values },
        } = this.props;
        let { t } = this.props.actions;
        let { timeFromStart } = this.state;
        // console.log({dateStart});
        //
        // console.log({dateStart, dateFinish});
        dateStart = (dateStart && moment(dateStart, "x").format("DD.MM.YYYY")) || "";
        dateFinish = (dateFinish && moment(dateFinish, "x").format("DD.MM.YYYY")) || "";
        //
        // console.log({dateStart, dateFinish});
        // let dateFinish = 0
        let sex = "male";
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
                  <DatePickerInput
                    onChange={(value) => this.handleChange(null, { value, name: "dateStart" })}
                    name="dateStart"
                    value={dateStart}
                    showOnInputClick={true}
                    startMode="day"
                    format="DD.MM.YYYY"
                    returnFormat="DD.MM.YYYY"
                    displayFormat="DD.MM.YYYY"
                    validationFormat="DD.MM.YYYY"
                    onClear={this.onClear}
                    className="ui fluid big input "
                    placeholder="__.__.____"
                    locale={active_language}
                  />
                </Form.Field>
                <Form.Field width={7}>
                  <label>{t("end_reception")}:</label>
                  <Input action>
                    <DatePickerInput
                      ref={this.dateFinish}
                      onChange={(value) => this.handleChange(null, { value, name: "dateFinish" })}
                      name="dateFinish"
                      value={dateFinish}
                      showOnInputClick={true}
                      startMode="day"
                      minDate={moment(dateStart, "DD.MM.YYYY")}
                      format="DD.MM.YYYY"
                      returnFormat="DD.MM.YYYY"
                      displayFormat="DD.MM.YYYY"
                      validationFormat="DD.MM.YYYY"
                      onClear={this.onClear}
                      className="ui fluid big input "
                      placeholder="__.__.____"
                      locale={active_language}
                    />
                    <Dropdown
                      onClick={() => {
                        this.dateFinish.current.hide();
                      }}
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
                    onClick={() => {
                      this.dateFinish.current.hide();
                    }}
                    disabled={!dateStart || dateStart.length < 1}
                    className={`big fluid button${finishAlternate ? " primary" : ""}`}
                    primary={finishAlternate !== null}
                    name={"finishAlternate"}
                    text={(finishAlternate && UIText.duration[finishAlternate]) || t("choose")}
                    options={this.renderAlterDurations()}
                  />
                  {false && (
                    <Responsive as={Button.Group} fluid size="big" minWidth={481}>
                      <Button
                        primary={finishAlternate === "lQ9LkaNuaG/IgjrmfEhzOQ=="}
                        onClick={this.handleChange}
                        name="finishAlternate"
                        value="lQ9LkaNuaG/IgjrmfEhzOQ=="
                      >
                        {t("before_canceling")}
                      </Button>
                    </Responsive>
                  )}
                  {false && (
                    <Responsive as={Button.Group} fluid maxWidth={480}>
                      <Button
                        primary={finishAlternate === "lQ9LkaNuaG/IgjrmfEhzOQ=="}
                        onClick={this.handleChange}
                        name="finishAlternate"
                        value="lQ9LkaNuaG/IgjrmfEhzOQ=="
                      >
                        {t("before_canceling")}
                      </Button>
                    </Responsive>
                  )}
                </Form.Field>
              </Form.Group>

              {false && (
                <Form.Group>
                  <Form.Field className="fluid">
                    <label>{t("terms_accepted")}</label>
                    <Responsive as={Button.Group} fluid widths={3} minWidth={481}>
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
                    </Responsive>
                    <Responsive as={Button.Group} fluid widths={2} maxWidth={480}>
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
                    </Responsive>
                    <Responsive as={Button.Group} fluid widths={1} maxWidth={480}>
                      <Button primary={format === "week"} onClick={this.handleChange} name="format" value="week">
                        {t("by_day_week")}
                      </Button>
                    </Responsive>
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
