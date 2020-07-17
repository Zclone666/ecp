import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment'

import RouterLink from '../../../router/a'
import {
  List,
  Icon,
  Form,
  Segment,
  Input,
  Button,
  Dropdown,
  Responsive
} from 'semantic-ui-react'

import { DatePickerInput } from 'rc-datepicker';

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Once extends Component {
  constructor(props){
    super(props)
    this.state = {
      dosage: 0,
      count: 0,
      fullDosage: 0,
      weight: 0,
      weightDosage: 0
    }
  }
  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    console.log({ name, value });
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      db: { drugDosage: { drug, form, methodform, names } },
      router: { values }
    } = this.props

    let {
      dosage,
      count,
      fullDosage,
      weight,
      weightDosage
    } = this.state

    let weights = [
      { key: 'мг', value: 'мг', text: 'мг' },
      { key: 'сг', value: 'сг', text: 'сг' },
      { key: 'мкг', value: 'мкг', text: 'мкг' }
    ]
    let dateStart = moment().format('DD.MM.YYYY HH:mm')
    let dateFinish = 0
    let sex = 'male'
    return (
      <Form.Group>
        <Form.Field className='fluid'>
          <label>Или</label>
          <Responsive as={Button.Group} fluid size='big' widths={4} minWidth={480}>
            <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>1 раз</Button>
            <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По дням недели</Button>
            <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>По интервалу</Button>
            <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По календарю</Button>
          </Responsive>
          <Responsive as={Button.Group} fluid size='big' widths={2} maxWidth={480}>
            <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>1 раз</Button>
            <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По дням недели</Button>
          </Responsive>
          <Responsive as={Button.Group} fluid size='big' widths={2} maxWidth={480}>
            <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>По интервалу</Button>
            <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>По календарю</Button>
          </Responsive>
        </Form.Field>
      </Form.Group>
    )
  }

};
export default Once
