import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

import RouterLink from "../../../router/a";
import { List, Icon, Form, Segment, Input, Button, Dropdown, Responsive } from "semantic-ui-react";

import { DatePickerInput } from "rc-datepicker";

import _ from "lodash";

import Week from "./Week";
import Interval from "./Interval";
import Calendar from "./Calendar";

import clarifications from "../../../constants/hardcode";

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[val % 100 > 4 && val % 100 < 20 ? 2 : cases[val % 10 < 5 ? val % 10 : 5]];
}

const ref_days = ["день", "дня", "дней"];

@inject("db", "actions", "router", "drugs", "dosages")
@observer
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
    // console.log('HERE');
    // console.log({ name, value });
    if (name === "dateStart" || name === "dateFinish") {
      // console.log({value: value});
      value = moment(moment(value).format("DD.MM.YYYY"), "DD.MM.YYYY").format("x");
      if (name === "dateFinish") value = moment(parseInt(moment(value, "x").add(1, "d").format("x")) - 1, "x");
      // console.log({value: moment(value).format('x')});
      this.setState({ timeFromStart: null });
      if (moment(value).format("x") !== "Invalid date")
        this.props.actions.scheduleForm[name] = moment(value).format("x");
      if (name === "dateFinish") this.props.actions.scheduleForm.finishAlternate = null;
      if (name === "dateStart" && this.props.actions.scheduleForm.dateFinish < moment(value).format("x")) {
        this.props.actions.scheduleForm.dateFinish = null;
        this.props.actions.scheduleForm.finishAlternate = null;
      }
      let duration_num = moment(this.props.actions.scheduleForm.dateFinish, "x").diff(
        moment(this.props.actions.scheduleForm.dateStart, "x"),
        "days"
      );
      duration_num = duration_num == 0 ? 1 : duration_num;
      this.props.drugs.current.duration = duration_num + " " + declension(ref_days, duration_num);
      this.props.drugs.current.duration_id = null;
      // console.log(moment(this.props.actions.scheduleForm.dateFinish, 'x').from(moment(this.props.actions.scheduleForm.dateStart, 'x'), true));
      // console.log({ value: moment(value).format('x') } );
    } else {
      switch (name) {
        case "finishAlternate":
          this.props.actions.scheduleForm.finishAlternate = this.props.actions.scheduleForm.finishAlternate
            ? null
            : value;
          this.setState({ timeFromStart: null });
          this.props.drugs.current.duration = null;
          this.props.drugs.current.duration_id = null;
          this.props.actions.scheduleForm.dateFinish = null;
          break;
        // case 'finishAlternate':
        //
        //   break;
        // case 'finishAlternate':
        //
        //   break;
        // case 'finishAlternate':
        //
        //   break;
        // case 'finishAlternate':
        //
        //   break;
        default:
          this.props.actions.scheduleForm[name] = value;
      }
      //this.props.actions.scheduleForm[name] = value
    }

    // this.setState({ [name]: value })
    // console.log({ name, value });
  };
  setTomorrow = () => {
    // let tomorrow =  moment(moment().format('DD.MM.YYYY'), 'DD.MM.YYYY').add(1, 'd')
    // console.log({tomorrow: moment(tomorrow).format('DD.MM.YYYY')});
    this.handleChange(null, {
      name: "dateStart",
      value: moment(moment().format("DD.MM.YYYY"), "DD.MM.YYYY").add(1, "d"),
    });
  };
  setDate = (tpl, id) => {
    let { UIText } = this.props.actions;
    let { dateStart } = this.props.actions.scheduleForm;
    this.setState({ timeFromStart: UIText.duration[id] });
    this.props.drugs.current.duration = UIText.duration[id];
    this.props.drugs.current.duration_id = id;
    this.props.actions.scheduleForm.dateFinish = moment(dateStart, "x").add(tpl.x, tpl.timesx).add(-1, "d").format("x");
    this.props.actions.scheduleForm.finishAlternate = null;
  };
  componentDidMount() {
    let {
      actions: {
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
    } = this.props;

    this.props.actions.scheduleForm.dateStart =
      dateStart || moment(moment().format("DD.MM.YYYY"), "DD.MM.YYYY").format("x");
    // console.log(this.props.actions.scheduleForm.dateStart);
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
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData,
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
                Начало приема (
                <span className="link" onClick={this.setTomorrow}>
                  завтра
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
                locale="ru"
              />
            </Form.Field>
            <Form.Field width={7}>
              <label>Окончание приема:</label>
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
                  locale="ru"
                />
                <Dropdown
                  onClick={() => {
                    this.dateFinish.current.hide();
                  }}
                  disabled={!dateStart || dateStart.length < 1}
                  className="button"
                  name={"durations"}
                  text={timeFromStart || "Выбрать"}
                  options={this.renderDurations()}
                />
              </Input>
            </Form.Field>
            <Form.Field width={5}>
              <label>Или</label>
              <Responsive as={Button.Group} fluid size="big" minWidth={481}>
                <Button
                  primary={finishAlternate === "lQ9LkaNuaG/IgjrmfEhzOQ=="}
                  onClick={this.handleChange}
                  name="finishAlternate"
                  value="lQ9LkaNuaG/IgjrmfEhzOQ=="
                >
                  До отмены
                </Button>
                {/*<Button primary={sex === 'female'} onClick={this.handleChange} name='sex' value='female'>До улучшения</Button>*/}
              </Responsive>
              <Responsive as={Button.Group} fluid maxWidth={480}>
                <Button
                  primary={finishAlternate === "lQ9LkaNuaG/IgjrmfEhzOQ=="}
                  onClick={this.handleChange}
                  name="finishAlternate"
                  value="lQ9LkaNuaG/IgjrmfEhzOQ=="
                >
                  До отмены
                </Button>
                {/*<Button primary={sex === 'female'} onClick={this.handleChange} name='sex' value='female'>До улучшения</Button>*/}
              </Responsive>
            </Form.Field>
          </Form.Group>

          {false && (
            <Form.Group>
              <Form.Field className="fluid">
                <label>Условия приема</label>
                <Responsive as={Button.Group} fluid widths={3} minWidth={481}>
                  <Button primary={format === "interval"} onClick={this.handleChange} name="format" value="interval">
                    По расписанию
                  </Button>
                  <Button primary={format === "once"} onClick={this.handleChange} name="format" value="once">
                    Однократно
                  </Button>
                  <Button primary={format === "week"} onClick={this.handleChange} name="format" value="week">
                    По дням недели
                  </Button>
                  {/*<Button primary={format === 'calendar'} onClick={this.handleChange} name='format' value='calendar'>По календарю</Button>*/}
                </Responsive>
                <Responsive as={Button.Group} fluid widths={2} maxWidth={480}>
                  <Button primary={format === "interval"} onClick={this.handleChange} name="format" value="interval">
                    По расписанию
                  </Button>
                  <Button primary={format === "once"} onClick={this.handleChange} name="format" value="once">
                    Однократно
                  </Button>
                </Responsive>
                <Responsive as={Button.Group} fluid widths={1} maxWidth={480}>
                  <Button primary={format === "week"} onClick={this.handleChange} name="format" value="week">
                    По дням недели
                  </Button>
                  {/*<Button primary={format === 'calendar'} onClick={this.handleChange} name='format' value='calendar'>По календарю</Button>*/}
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
          {/*<Form.Group>
            <Form.Field className='fluid'>
              <label>Дополнительно</label>
              <Responsive as={Button.Group} fluid widths={4} minWidth={480}>
                <Button primary={sex === 'male'} onClick={this.handleChange} name='sex' value='male'>Перед едой</Button>
                <Button primary={sex === 'female'} onClick={this.handleChange} name='sex' value='female'>После еды</Button>
                <Button primary={sex === 'male'} onClick={this.handleChange} name='sex' value='male'>Во время еды</Button>
                <Button primary={sex === 'female'} onClick={this.handleChange} name='sex' value='female'>Перед сном</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid widths={2} maxWidth={480}>
                <Button primary={sex === 'male'} onClick={this.handleChange} name='sex' value='male'>Перед едой</Button>
                <Button primary={sex === 'female'} onClick={this.handleChange} name='sex' value='female'>После еды</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid widths={2} maxWidth={480}>
                <Button primary={sex === 'male'} onClick={this.handleChange} name='sex' value='male'>Во время еды</Button>
                <Button primary={sex === 'female'} onClick={this.handleChange} name='sex' value='female'>Перед сном</Button>
              </Responsive>
            </Form.Field>
          </Form.Group>*/}
        </Form>
      </Segment>
    );
  }
}
export default Schedule;
