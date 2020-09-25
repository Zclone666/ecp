import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment'

import {
  List,
  Icon,
  Form,
  Segment,
  Input,
  Button,
  Dropdown,
  Responsive,
  Checkbox,
  Grid,
  Label
} from 'semantic-ui-react'

import clarifications from '../../../constants/hardcode'

import Day from './Day';

import _ from 'lodash';

function declension(forms, val) {
  const cases = [ 2, 0, 1, 1, 1, 2 ];
  return forms[(val % 100 > 4 && val % 100 < 20) ? 2 : cases[(val % 10 < 5) ? val % 10 : 5]];
}

const ref_minutes = [ 'минуту', 'минуты', 'минут' ],
ref_hours = [ 'час', 'часа', 'часов' ],
ref_days = [ 'день', 'дня', 'дней' ],
ref_weeks = [ 'неделю', 'недели', 'недель' ],
ref_months = [ 'месяц', 'месяца', 'месяцев' ],
ref_years = [ 'год', 'года', 'лет' ],
ref_times = [ 'раз', 'раза', 'раз' ]

@inject('db', 'actions', 'router', 'drugs', 'dosages')
@observer
class Interval extends Component {
  constructor(props){
    super(props)
    this.state = {
      concepts: []
    }
  }
  handleChange = (e, { name, type, value, index }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    let { interval } = this.props.actions.scheduleForm

    interval[index][name] = value
    this.props.actions.scheduleForm.interval = interval

  }
  handleAddConcept = (e, { name, value }) => {
    // console.log({ name, value });
    if(!value) return
    let { interval } = this.props.actions.scheduleForm
    if(!interval) interval = []
    let concept = {
      'every': { type: 'every', x: null, timesx: null },
      'period': { type: 'period', x: null, timesx: null },
      'period_in': { type: 'period_in', x: null, y: null, timesx: null, timesy: null },
      'in': { type: 'in', x: null, timesx: null },
      'count': { type: 'count', x: null, timesx: null },
      'count_every': { type: 'count_every', x: null, y: null, timesx: null, timesy: null },
      'time': { type: 'time', time: null }
    }[value]
    interval.push(concept)
    this.props.actions.scheduleForm.interval = interval
    // console.log('concepts', concepts);
    // this.setState({ concepts })
  }
  removeConcept = (i) => {
    // let { interval } = this.state
    this.props.actions.scheduleForm.interval.splice(i, 100)
    // this.setState({ concepts })
  }
  renderTimes({num, name, index, type, currvalue}){
    return(
      <Dropdown
        name={name}
        selection
        value={currvalue}
        onChange={(e, { name, value }) => this.handleChange(e, { name, type, value, index })}
        placeholder={'ед. измерения'}
        options={[
          {
            key: 'minutes',
            text: declension(ref_minutes, num),
            value: 'minutes'
          },
          {
            key: 'hours',
            text: declension(ref_hours, num),
            value: 'hours'
          },
          {
            key: 'days',
            text: declension(ref_days, num),
            value: 'days'
          },
          {
            key: 'weeks',
            text: declension(ref_weeks, num),
            value: 'weeks'
          },
          {
            key: 'months',
            text: declension(ref_months, num),
            value: 'months'
          }
        ]}
      />
    )
  }
  renderNums({x, name, index, type, currvalue}){
    // let type, sort
    return(
      <Dropdown
        name={name}
        value={currvalue}
        selection
        onChange={(e, { name, value }) => this.handleChange(e, { name, type, value, index })}
        placeholder={'X'}
        options={_.map(Array(x), (item, i) => {
          return {
            key: i+1,
            text: i+1,
            value: i+1
          }
        })}
      />
    )
  }
  renderEvery(i, concept){
    let { type, x, timesx } = concept
    return(
      <Form.Field inline>
        <label> каждые </label>
        {this.renderNums({x: 60, name: 'x', index: i, type, currvalue: x})}
        {this.renderTimes({num: x || 0, name: 'timesx', index: i, type, currvalue: timesx})}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderPeriod(i, concept){
    let { type, x, timesx } = concept
    return(
      <Form.Field inline>
        {this.renderNums({x: 24, name: 'x', index: i, type, currvalue: x})}
        {this.renderTimes({num: x || 0, name: 'timesx', index: i, type, currvalue: timesx})}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderPeriodIn(i, concept){
    let { type, x, y, timesx, timesy } = concept
    return(
      <Form.Field inline>
        {this.renderNums({x: 24, name: 'x', index: i, type, currvalue: x})}
        {this.renderTimes({num: x || 0, name: 'timesx', index: i, type, currvalue: timesx})}
        <label> через </label>
        {this.renderNums({x: 24, name: 'y', index: i, type, currvalue: y})}
        {this.renderTimes({num: y || 0, name: 'timesy', index: i, type, currvalue: timesy})}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderCount(i, concept){
    let { type, x, timesx } = concept
    return(
      <Form.Field inline>
        {this.renderNums({x: 24, name: 'x', index: i, type, currvalue: x})}
        <label> {declension(ref_times, x || 0)} в </label>
        {this.renderTimes({num: 1, name: 'timesx', index: i, type, currvalue: timesx})}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderCountEvery(i, concept){
    let { type, x, y, timesx, timesy } = concept
    return(
      <Form.Field inline>
        {this.renderNums({x: 24, name: 'x', index: i, type, currvalue: x})}
        <label> {declension(ref_times, x || 0)} в </label>
        {this.renderTimes({num: 1, name: 'timesx', index: i, type, currvalue: timesx})}
        <label> с перерывами </label>
        {this.renderNums({x: 24, name: 'y', index: i, type, currvalue: y})}
        {this.renderTimes({num: y || 0, name: 'timesy', index: i, type, currvalue: timesy})}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderIn(i, concept){
    let { type, x, timesx } = concept
    return(
      <Form.Field inline>
        <label>через</label>
        {this.renderNums({x: 24, name: 'x', index: i, type, currvalue: x})}
        {this.renderTimes({num: x || 0, name: 'timesx', index: i, type, currvalue: timesx})}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderTime(i, concept){
    let { type, time } = concept
    return(
      <Form.Field inline>
        <Dropdown
          name={'time'}
          selection
          value={time}
          placeholder={'время'}
          onChange={(e, { name, value }) => this.handleChange(e, { name, type, value, index: i })}
          options={_.map(Array(48), (item, i) => {
            return {
              key: i+1,
              text: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30',
              value: (i === 0 || !(i%2)) ? parseInt(i/2) + '.00' : parseInt(i/2) + '.30'
            }
          })}
        />
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderConcepts(){
    let { interval } = this.props.actions.scheduleForm
    if(!interval) interval = []
    return interval.map(( concept, i ) => {
      return(
        <Label key={'concept'+i}>
          {{
            'every': this.renderEvery(i, concept),
            'period': this.renderPeriod(i, concept),
            'period_in': this.renderPeriodIn(i, concept),
            'in': this.renderIn(i, concept),
            'count': this.renderCount(i, concept),
            'count_every': this.renderCountEvery(i, concept),
            'time': this.renderTime(i, concept),
          }[concept.type]}
        </Label>
      )
    })

  }

  renderPresets(){
    console.log({clarifications});
    let { presets } = clarifications.clarifications
    let { UIText } = this.props.actions
    let arr = []
    _.keys( presets ).forEach(( presetKey, i ) => {
      let preset = presets[presetKey]
      arr.push(
        {
          key: i,
          text: UIText.freq[preset.id],
          value: presetKey,
          onClick: () => this.props.actions.scheduleForm.interval = preset.tpl
        }
      )
    })
    return arr
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
      dosages: { current: { drug, form, methodform, names } },
      router: { values }
    } = this.props

    let concept_types = [
      {
        key: 1,
        text: 'Повтор',
        value: 'every',
        description: '(каждые Х дней)',
        onClick: this.handleAddConcept
      },
      {
        key: 2,
        text: 'Период',
        value: 'period',
        description: '(Х дней)',
        onClick: this.handleAddConcept
      },
      {
        key: 3,
        text: 'Период + промежуток',
        value: 'period_in',
        description: '(Х дней через Y дней)',
        onClick: this.handleAddConcept
      },
      {
        key: 4,
        text: 'Промежуток',
        value: 'in',
        description: '(через Х дней)',
        onClick: this.handleAddConcept
      },
      {
        key: 5,
        text: 'Количество',
        value: 'count',
        description: '(Х раз в день)',
        onClick: this.handleAddConcept
      },
      {
        key: 6,
        text: 'Количество с перерывом',
        value: 'count_every',
        description: '(Х раз в день с перерывом в 3 часа)',
        onClick: this.handleAddConcept
      },
      {
        key: 7,
        text: 'Время приема',
        value: 'time',
        description: '(7:30)',
        onClick: this.handleAddConcept
      }
    ]
    return (
      <>
        <Form.Group>
          <Form.Field inline className='fluid'>
            <label>Выберите шаблон:</label>
            <Dropdown
              inline
              name={'presets'}
              text={'Выбрать'}
              options={this.renderPresets()}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field className='fluid'>
            <label>Или создайте свой:</label>
          </Form.Field>
        </Form.Group>
        <div className='concept_container'>
          {this.renderConcepts()}
          <Label>
            <Form.Field>
              <Dropdown
                className='primary button'
                name={'concept'}
                text={'Добавить'}
                options={concept_types}
              />
            </Form.Field>
          </Label>
        </div>
      </>
    )
  }

};
export default Interval
