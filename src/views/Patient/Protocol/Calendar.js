import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { DatePickerInput } from "rc-datepicker";

import "./Calendar.css";

import moment from "moment";
import ru from "moment/locale/ru";
moment.locale("ru");
class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChange = (value, name) => {
    // let { values } = this.state

    let { onChange } = this.props;

    onChange && onChange(this, { name, value });
  };
  onClear = () => {
    setTimeout(() => {
      this.handleChange("");
    }, 100);
  };
  setTo = (e) => {
    e.preventDefault();
    //console.log('ghch', moment().toDate());
    this.handleChange(moment().toDate().format("LL"));
  };
  render() {
    let { value, maxDate, size, name } = this.props;
    let date = Math.abs(parseInt(value)) > 0 ? moment(parseInt(value) || moment().toDate()).format("DD.MM.YYYY") : "";
    //console.log({value});
    return (
      <DatePickerInput
        onChange={(value) => this.handleChange(value, name)}
        value={date}
        showOnInputClick={true}
        startMode="year"
        format="DD.MM.YYYY"
        returnFormat="DD.MM.YYYY"
        displayFormat="DD.MM.YYYY"
        validationFormat="DD.MM.YYYY"
        onClear={this.onClear}
        className={`ui ${size || 'big'} input`}
        // placeholder="Дата рождения"
        locale="ru"
        maxDate={maxDate}
      />
    );
  }
}
export default Calendar;
