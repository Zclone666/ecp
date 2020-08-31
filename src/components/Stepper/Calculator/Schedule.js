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

import Week from './Week';
import Interval from './Interval';
import Calendar from './Calendar';

@inject('db', 'actions', 'router')
@observer
class Schedule extends Component {
  constructor(props){
    super(props)
    this.state = {
      dosage: 0,
      count: 0,
      fullDosage: 0,
      weight: 0,
      weightDosage: 0,
      format: 'interval'
    }
  }
  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    this.setState({ [name]: value })
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
      weightDosage,
      format
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
      <Segment>
        <Form>
          <Form.Group widths={3}>
            <Form.Field>
              <label>Начало периода приема:</label>
              <DatePickerInput
                onChange={(e, { value }) => this.handleChange(e, { value, name: 'dateStart' })}
                name='dateStart'
                showOnInputClick={true}
                startMode='year'
                format='DD.MM.YYYY HH:mm'
                returnFormat='DD.MM.YYYY HH:mm'
                displayFormat='DD.MM.YYYY HH:mm'
                validationFormat='DD.MM.YYYY HH:mm'
                onClear={this.onClear}
                className='ui fluid big input '
                placeholder='__.__.____'
                locale='ru'
              />
            </Form.Field>
            <Form.Field>
              <label>Окончание периода приема:</label>
              <DatePickerInput
                onChange={(e, { value }) => this.handleChange(e, { value, name: 'dateFinish' })}
                name='dateFinish'
                showOnInputClick={true}
                startMode='year'
                format='DD.MM.YYYY HH:mm'
                returnFormat='DD.MM.YYYY HH:mm'
                displayFormat='DD.MM.YYYY HH:mm'
                validationFormat='DD.MM.YYYY HH:mm'
                onClear={this.onClear}
                className='ui fluid big input '
                placeholder='__.__.____'
                locale='ru'
              />
            </Form.Field>
            <Form.Field>
              <label>Или</label>
              <Button.Group fluid size='big'>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>До отмены</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>До улучшения</Button>
              </Button.Group>
            </Form.Field>

          </Form.Group>

          <Form.Group>
            <Form.Field className='fluid'>
              <label>Условия приема</label>
              <Responsive as={Button.Group} fluid widths={4} minWidth={480}>
                <Button primary={format === 'interval'} onClick={this.handleChange} name='format' value='interval'>По интервалу</Button>
                <Button primary={format === 'once'} onClick={this.handleChange} name='format' value='once'>1 раз</Button>
                <Button primary={format === 'week'} onClick={this.handleChange} name='format' value='week'>По дням недели</Button>
                <Button primary={format === 'calendar'} onClick={this.handleChange} name='format' value='calendar'>По календарю</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid widths={2} maxWidth={480}>
                <Button primary={format === 'interval'} onClick={this.handleChange} name='format' value='interval'>По интервалу</Button>
                <Button primary={format === 'once'} onClick={this.handleChange} name='format' value='once'>1 раз</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid widths={2} maxWidth={480}>
                <Button primary={format === 'week'} onClick={this.handleChange} name='format' value='week'>По дням недели</Button>
                <Button primary={format === 'calendar'} onClick={this.handleChange} name='format' value='calendar'>По календарю</Button>
              </Responsive>
            </Form.Field>
          </Form.Group>
          {{
            'once': <div/>,
            'week': <Week />,
            'interval': <Interval />,
            //'calendar': <Calendar />
          }[format]}
          <Form.Group>
            <Form.Field className='fluid'>
              <label>Дополнительно</label>
              <Responsive as={Button.Group} fluid size='big' widths={4} minWidth={480}>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>Перед едой</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>После еды</Button>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>Во время еды</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>Перед сном</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid size='big' widths={2} maxWidth={480}>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>Перед едой</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>После еды</Button>
              </Responsive>
              <Responsive as={Button.Group} fluid size='big' widths={2} maxWidth={480}>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>Во время еды</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>Перед сном</Button>
              </Responsive>
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    )
  }

};
export default Schedule
