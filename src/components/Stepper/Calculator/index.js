import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../../router/a'
import {
  List,
  Icon,
  Form,
  Segment,
  Input,
  Button,
  Dropdown
} from 'semantic-ui-react'

import Schedule from './Schedule'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'warnings')
@observer
class Calculator extends Component {
  constructor(props){
    super(props)
    this.state = {

      weightDosage: 0
    }
  }
  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    value = parseFloat(value)
    let {
      dosage,
      count,
      fullDosage,
      weightDosage
    } = this.props.actions.calculatorForm
    let weight = this.props.actions.drugStructure.patient.weight
    if( name == 'patient.weight' ){
      this.props.actions.drugStructure.patient.weight = value
    }else{
      this.props.actions.calculatorForm[name] = value
    }
    switch (name) {
      case 'dosage':
        this.props.actions.calculatorForm.fullDosage = value*count
        this.props.actions.calculatorForm.weightDosage = fullDosage/weight
        break;
      case 'count':
        this.props.actions.calculatorForm.fullDosage = dosage*value
        this.props.actions.calculatorForm.weightDosage = fullDosage/weight
        break;
      case 'patient.weight':
        this.props.actions.calculatorForm.fullDosage = dosage*count
        this.props.actions.calculatorForm.weightDosage = fullDosage/weight
        break;
      case 'fullDosage':
        this.props.actions.calculatorForm.count = fullDosage/count
        break;
      case 'weightDosage':
        this.props.actions.calculatorForm.fullDosage = weightDosage*weight
        break;
      default:

    }
    //console.log({ name, value });
  }
  componentDidUpdate(prevProps, prevState){
    if(this.props.actions.stepsData.pack.obj){
      if(!prevProps.actions.stepsData.pack.obj || (prevProps.actions.stepsData.pack.obj.dosages[0].value_1 !== this.props.actions.stepsData.pack.obj.dosages[0].value_1 )){
        this.handleChange(null, {
          name: 'dosage',
          value: this.props.actions.stepsData.pack.obj.dosages[0].value_1
        })
      }
    }
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData,
        drugStructure: {
          patient: { weight }
        },
        calculatorForm: {
          dosage,
          count,
          fullDosage,
          weightDosage
        }
      },
      db: { drugDosage: { drug, form, methodform, names } },
      router: { values }
    } = this.props



    let weights = [
      { key: 'мг', value: 'мг', text: 'мг' },
      { key: 'сг', value: 'сг', text: 'сг' },
      { key: 'мкг', value: 'мкг', text: 'мкг' }
    ]
    // dosage = dosage || (stepsData.pack.obj && stepsData.pack.obj.dosages[0].value_1 || 0)

     console.log(stepsData.pack.obj);
    return (
      <Segment basic>
        <Form>
          <Form.Group>
            <Form.Field width={4}>
              <label>Дозировка:</label>
              <Input
                size='big'
                name='dosage'
                value={dosage || ''}
                label={<Dropdown defaultValue='мг' options={weights} />}
                labelPosition='right'
                placeholder='500'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Кол-во доз:</label>
              <Input
                size='big'
                name='count'
                numeric
                value={count || ''}
                label={{ basic: true, content: 'шт' }}
                labelPosition='right'
                placeholder='3'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Разовая доза:</label>
              <Input
                size='big'
                name='fullDosage'
                value={fullDosage || ''}
                label={{ basic: true, content: 'мг' }}
                labelPosition='right'
                placeholder='500'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>На массу тела</label>
              <Input
                size='big'
                name='patient.weight'
                value={weight || ''}
                label={{ basic: true, content: 'кг' }}
                labelPosition='right'
                placeholder='60.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>&nbsp;</label>
              <Input
                size='big'
                name='weightDosage'
                value={weightDosage || ''}
                label={{ basic: true, content: ' мг/кг' }}
                labelPosition='right'
                placeholder='0'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>

        </Form>
        <Schedule />
      </Segment>
    )
  }

};
export default Calculator
