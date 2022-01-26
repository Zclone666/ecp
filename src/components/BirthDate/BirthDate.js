import React, { Component } from "react";
import { Form, Icon, Button } from "semantic-ui-react";
import { inject, observer } from 'mobx-react';
import AutoComplete from "./AutoComplete";
import Calendar from "./Calendar";
import { withTranslation } from "react-i18next";
import moment from "moment";

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  console.log(forms, val, val % 100 > 4 && val % 100 < 20 ? 2 : cases[val % 10 < 5 ? val % 10 : 5]);
  return forms[val % 100 > 4 && val % 100 < 20 ? 2 : cases[val % 10 < 5 ? val % 10 : 5]];
}

const ref_days = ["day", "a_day", "days"],
  ref_weeks = ["week_time", "weeks", "week_min"],
  ref_months = ["month", "a_month", "months"],
  ref_years = ["year", "of_the_year", "years"];

const BirthDate = inject(
  "actions",
)(
  observer(
class BirthDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      birth: "",
      date: "",
    };
  }
  handleChangeBirth = (e, { value }) => {
    let { onChange, name } = this.props;
    const { t } = this.props.actions;
    let year = 0,
      month = 0,
      week = 0,
      day = 0,
      birthyear = 0;

    let str = (value && value.name) || value;
    let resArr = str.split(", ");
    if (resArr.length < 2) resArr = str.split(" ");
    resArr.forEach((val, i) => {
      if (ref_years.includes(val)) year = parseInt(resArr[i - 1]);
      if (ref_months.includes(val)) month = parseInt(resArr[i - 1]);
      if (ref_weeks.includes(val)) week = parseInt(resArr[i - 1]);
      if (ref_days.includes(val)) day = parseInt(resArr[i - 1]);
      if (val == t("birth") || val == t("birth_min")) birthyear = parseInt(resArr[i - 2]);
      if (val == t("year_birth_min")) birthyear = parseInt(resArr[i - 1]);
    });
    // console.log({ year, month, week, day });
    // console.log(moment().format('DD.MM.YYYY'));
    let date = moment().add({ years: -year, months: -month, weeks: -week, days: -day }).format("x");
    if (birthyear > 0) date = moment().set("year", birthyear).format("x");
    //let date = moment().year(-year).month(-month).week(-week).day(-day).format('X')
    // console.log('birth', date, birthyear);
    onChange && onChange(null, { name, value: parseInt(date) });
    this.setState({ date, birth: value });
  };
  handleChangeDate = (e, { value }) => {
    // console.log({ value });
    let { onChange, name } = this.props;
    const { t } = this.props.actions;
    let years = moment().diff(moment(moment(value).toDate()), "years");
    let months = moment()
      .add({ years: -years })
      .diff(moment(moment(value).toDate()), "months");
    let weeks = moment()
      .add({ years: -years, months: -months })
      .diff(moment(moment(value).toDate()), "weeks");
    let days = moment()
      .add({ years: -years, months: -months, weeks: -weeks })
      .diff(moment(moment(value).toDate()), "days");
// console.log(ref_years,t(ref_years));
    let arr = [];
    if (years > 0) arr.push(years, t(declension(ref_years, years)));
    if (months > 0) arr.push(months, t(declension(ref_months, months)));
    if (weeks > 0) arr.push(weeks, t(declension(ref_weeks, weeks)));
    if (days > 0) arr.push(days, t(declension(ref_days, days)));

    onChange && onChange(null, { name, value: parseInt(moment(value).format("x")) });
    this.setState({ birth: arr.join(" "), date: moment(value).format("x") });
  };
  componentDidMount() {
    let { value } = this.props;
    //console.log({ value });
    if (!value) return;
    this.handleChangeDate(null, { value: moment(value, "x").toDate() });
  }
  componentDidUpdate(prevProps, prevState) {
    let { value } = this.props;
    // console.log(value, this.state.date, parseInt(value), parseInt(this.state.date));
    if (!value && !!this.state.date) {
      this.setState({ birth: "", date: "" });
    }
    if (!value || parseInt(value) === parseInt(this.state.date)) return;

    this.handleChangeDate(null, { value: moment(value, "x").toDate() });
  }
  render() {
    let { birth, date } = this.state;
    let {t} = this.props;
    return (
      <Form.Field width={16}>
        <label>{t("age_date_birth")}</label>
        <div className="birthdate">
          <AutoComplete value={birth} onChange={this.handleChangeBirth} />
          <Button basic icon="arrows alternate horizontal" />
          <Calendar value={date} onChange={this.handleChangeDate} maxDate={new Date()} />
        </div>
      </Form.Field>
    );
  }
}))
export default withTranslation()(BirthDate);
