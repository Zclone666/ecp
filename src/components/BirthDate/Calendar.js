import React, { Component } from 'react';
import { Form } from 'semantic-ui-react'
import { DatePickerInput } from 'rc-datepicker';

import moment from 'moment'
import ru from 'moment/locale/ru'
moment.locale('ru')
class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  handleChange = (value) => {
    // let { values } = this.state

    let { onChange } = this.props

    onChange && onChange(this, { value })
  }
  onClear = () => {
    setTimeout(() => {
      this.handleChange('')
    }, 100)
  }
  setTo = (e) => {
    e.preventDefault()
    //console.log('ghch', moment().toDate());
    this.handleChange(moment().toDate().format('x'))
  }
  render(){
    let { value } = this.props
    let date = Math.abs(parseInt(value)) > 0 ? moment(parseInt(value) || moment().toDate()).format("DD.MM.YYYY") : ''
    //console.log({value});
    return (
      <DatePickerInput
        onChange={this.handleChange}
        value={date}
        showOnInputClick={true}
        startMode='year'
        format='DD.MM.YYYY'
        returnFormat='DD.MM.YYYY'
        displayFormat='DD.MM.YYYY'
        validationFormat='DD.MM.YYYY'
        onClear={this.onClear}
        className='ui fluid big input '
        placeholder='Дата рождения'
        locale='ru'
      />
    )
  }


};
export default Calendar
