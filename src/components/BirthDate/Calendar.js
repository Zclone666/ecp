import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { DatePickerInput } from "rc-datepicker";
import { withTranslation } from "react-i18next";
import { inject, observer } from 'mobx-react';
import "./Calendar.css";

import moment from "moment";
import ru from "moment/locale/ru";
moment.locale("ru");
moment().utc(0);
const Calendar = inject(
  "actions",
)(
  observer(
class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChange = (value, name) => {
    // let { values } = this.state

    let { onChange } = this.props;
    // console.log({ name, value, zone: moment().zone() });

    onChange && onChange(this, { name, value: moment(value).utc(180) });
  };
  onClear = () => {
    setTimeout(() => {
      this.handleChange("");
    }, 100);
  };
  setTo = (e) => {
    e.preventDefault();
    //console.log('ghch', moment().toDate());
    this.handleChange(moment().toDate().format("x"));
  };
  render() {
    let { value, minDate, maxDate, size, name } = this.props;
    const { t } = this.props.actions;
    let date = Math.abs(parseInt(value)) > 0 ? moment(parseInt(value) || moment().toDate()).format("DD.MM.YYYY") : "";
    //console.log({value});
    return (
      <DatePickerInput
        onChange={(value) => this.handleChange(value, name)}
        value={date}
        showOnInputClick={true}
        utc={0}
        startMode="year"
        format="DD.MM.YYYY"
        returnFormat="DD.MM.YYYY"
        displayFormat="DD.MM.YYYY"
        validationFormat="DD.MM.YYYY"
        onClear={this.onClear}
        className={`ui fluid ${size || "big"} input`}
       // placeholder={t("date_birth")}
        locale="ru"
        minDate={minDate}
        maxDate={maxDate}
      />
    );
  }
}))
export default withTranslation()(Calendar);
