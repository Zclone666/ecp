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
ref_years = [ 'год', 'года', 'лет' ]

@inject('db', 'actions', 'router')
@observer
class Interval extends Component {
  constructor(props){
    super(props)
    this.state = {
      concepts: []
    }
  }
  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    console.log({ name, value });
  }
  handleAddConcept = (e, { name, value }) => {
    // console.log({ name, value });
    if(!value) return
    let { concepts } = this.state
    let concept = {
      'every': { type: 'every', x: null, timesx: null },
      'period': { type: 'period', x: null, timesx: null },
      'period_in': { type: 'period_in', x: null, y: null, timesx: null, timesy: null },
      'in': { type: 'in', x: null, timesx: null },
      'count': { type: 'count', x: null, timesx: null },
      'count_every': { type: 'count_every', x: null, y: null, timesx: null, timesy: null },
      'time': { type: 'time', time: null }
    }[value]
    concepts.push(concept)
    // console.log('concepts', concepts);
    this.setState({ concepts })
  }
  removeConcept = (i) => {
    let { concepts } = this.state
    concepts.splice(i, 100)
    this.setState({ concepts })
  }
  renderTimes(num){
    return(
      <Dropdown
        name={'times'}
        selection
        onChange={this.handleChange}
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
  renderNums(x){
    return(
      <Dropdown
        name={'x'}
        selection
        onChange={this.handleChange}
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
  renderEvery(i){
    return(
      <Form.Field inline>
        <label> каждые </label>
        {this.renderNums(20)}
        {this.renderTimes(5)}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderPeriod(i){
    return(
      <Form.Field inline>
        {this.renderNums(20)}
        {this.renderTimes(5)}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderPeriodIn(i){
    return(
      <Form.Field inline>
        {this.renderNums(20)}
        {this.renderTimes(5)}
        <label> через </label>
        {this.renderNums(20)}
        {this.renderTimes(5)}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderCount(i){
    return(
      <Form.Field inline>
        {this.renderNums(20)}
        <label> раз в </label>
        {this.renderTimes(1)}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderCountEvery(i){
    return(
      <Form.Field inline>
        {this.renderNums(20)}
        <label> раз в </label>
        {this.renderTimes(1)}
        <label> с перерывами </label>
        {this.renderNums(20)}
        {this.renderTimes(5)}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderIn(i){
    return(
      <Form.Field inline>
        <label>через</label>
        {this.renderNums(20)}
        {this.renderTimes(5)}
        <Button icon onClick={() => this.removeConcept(i)}><Icon name='delete' /></Button>
      </Form.Field>
    )
  }
  renderTime(i){
    return(
      <Form.Field inline>
        <Dropdown
          name={'time'}
          selection
          placeholder={'время'}
          onChange={this.handleChange}
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
    let { concepts } = this.state
    return concepts.map(( concept, i ) => {
      return(
        <Label key={'concept'+i}>
          {{
            'every': this.renderEvery(i),
            'period': this.renderPeriod(i),
            'period_in': this.renderPeriodIn(i),
            'in': this.renderIn(i),
            'count': this.renderCount(i),
            'count_every': this.renderCountEvery(i),
            'time': this.renderTime(i),
          }[concept.type]}
        </Label>
      )
    })

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
          <Form.Field className='fluid'>
            <label>Выберите интервал:</label>
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
