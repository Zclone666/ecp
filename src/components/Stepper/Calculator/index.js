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
  Dropdown,
  TextArea
} from 'semantic-ui-react'

import clarifications from '../../../constants/hardcode'


import Schedule from './Schedule'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'dosages')
@observer
class Calculator extends Component {
  constructor(props){
    super(props)
    this.state = {
      currUnit: null
    }
  }
  handleChangeUnit = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    console.log({ name, value });
    this.setState({ [name]: value })
  }
  handleChange = (e, { name, value }) => {
    let { getToBase, calcValues } = this.props.dosages
    let { dosage: dos, count: cnt } = calcValues
    let { currUnit } = this.state
    let def = (dos.firstUnit && dos.firstUnit.id ) || (dos.unit && dos.unit.id)

    if( !name && !value ){
      let { name, value } = e.target
    }
    //console.log({name, value}, !!value);
    value = value.split(',').join('.')
    if( value === '' || value === 0 || value === '0' || value === '.' || value.split('.')[1] === '' ) {
      if( name == 'patient.weight' ){
        this.props.actions.drugStructure.patient.weight = value
      }else{
        this.props.actions.calculatorForm[name] = value
      }
      return
    }
    //value = parseFloat(eval(value))
    if( name === 'specials' ){
      this.props.actions.scheduleForm.specials = value
      return
    }
    value = parseFloat(value)

    if( name == 'patient.weight' ){
      this.props.actions.drugStructure.patient.weight = value
    }else{
      // this.props.actions.calculatorForm[name] = value
    }
    let weight = this.props.actions.drugStructure.patient.weight
    let {
      dosage,
      count,
      fullDosage,
      weightDosage
    } = this.props.actions.calculatorForm
    switch (name) {
      case 'dosage':
        dosage = getToBase((currUnit || def), value)
        fullDosage = getToBase((currUnit || def), value)*count
        weightDosage = !weight ? 0 :(fullDosage/weight)
        break;
      case 'count':
        count = value
        fullDosage = dosage*value
        weightDosage = !weight ? 0 :(fullDosage/weight)
        break;
      case 'patient.weight':
        fullDosage = dosage*count
        weightDosage = !weight ? 0 :(fullDosage/weight)
        break;
      case 'fullDosage':
        fullDosage = getToBase((currUnit || def), value)
        count = fullDosage/dosage
        break;
      case 'weightDosage':
        weightDosage = getToBase((currUnit || def), value)
        fullDosage = (weightDosage*weight)
        count = fullDosage/dosage
        break;
      default:

    }
    this.props.actions.calculatorForm.dosage = dosage
    this.props.actions.calculatorForm.count = count
    this.props.actions.calculatorForm.fullDosage = fullDosage
    this.props.actions.calculatorForm.weightDosage = weightDosage
    setTimeout(() => {
      this.forceUpdate()
    }, 300)

    //console.log({ name, value });
  }
  // componentDidUpdate(prevProps, prevState){
  //   if(this.props.actions.stepsData.pack.obj){
  //     if(!prevProps.actions.stepsData.pack.obj || (prevProps.actions.stepsData.pack.obj.dosages[0].value_1 !== this.props.actions.stepsData.pack.obj.dosages[0].value_1 )){
  //       this.handleChange(null, {
  //         name: 'dosage',
  //         value: this.props.actions.stepsData.pack.obj.dosages[0].value_1
  //       })
  //     }
  //   }
  // }

  setPreset = (e, {value}) => {
    // console.log(value);
    this.props.actions.scheduleForm.interval = value.tpl
  }

  renderPresets(){
    let { presets } = clarifications
    let { UIText, scheduleForm: { interval } } = this.props.actions
    let arr = []
    interval = interval || []
    _.keys( presets ).forEach(( presetKey, i ) => {
      let preset = presets[presetKey]
      arr.push(
        {
          key: i,
          text: UIText.freq[preset.id],
          value: preset,
          //onClick: () => this.props.actions.scheduleForm.interval = preset.tpl
          //onClick: () => this.props.actions.scheduleForm.interval = _.concat(preset.tpl, interval)
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
        stepsData,
        drugStructure: {
          patient: { weight }
        },
        calculatorForm: {
          baseDosage,
          dosage,
          count,
          fullDosage,
          weightDosage
        },
        scheduleForm: {
          specials
        }
      },
      dosages: { current: { drug, form, methodform, names }, calcValues, getFromBase },
      router: { values }
    } = this.props
    let { currUnit } = this.state

    // console.log({
    //   dosage,
    //   count,
    //   fullDosage,
    //   weightDosage
    // });
    let weights = []
    let { dosage: dos, count: cnt } = calcValues

    _.forEach(dos.units, (weight, key) => {
      if(dos.firstUnit){
        weights.push({
          key,
          value: key,
          text: `${weight.shortname || weight.name}/${dos.secondUnit.shortname || dos.secondUnit.name}`
        })
      }else{
        weights.push({
          key,
          value: key,
          text: weight.shortname || weight.name
        })
      }
    })

    let currUnitObj = dos.units[currUnit]

    // console.log({currUnitObj});

    let secondName = currUnit ? (currUnitObj && (currUnitObj.shortname || currUnitObj.name)) : (dos.firstUnit && (dos.firstUnit.shortname || dos.firstUnit.name) ) || (dos.unit && (dos.unit.shortname || dos.unit.name))
    let def = (dos.firstUnit && dos.firstUnit.id ) || (dos.unit && dos.unit.id)

    // let calculated =
    // console.log({def});
    // let weights = [
    //   { key: 'мг', value: 'мг', text: 'мг' },
    //   { key: 'сг', value: 'сг', text: 'сг' },
    //   { key: 'мкг', value: 'мкг', text: 'мкг' }
    // ]
    // dosage = dosage || (stepsData.pack.obj && stepsData.pack.obj.dosages[0].value_1 || 0)

      // console.log({weights, calcValues, def, dos});
    // console.log({ getFromBase: getFromBase((currUnit || def), baseDosage), dosage, baseDosage });
    return (
      <Segment basic>
        <Form>
          <Form.Group>
            <Form.Field width={4}>
              <label>Дозировка:</label>
              <Input
                size='big'
                name='dosage'
                value={getFromBase((currUnit || def), dosage) || ''}
                label={<Dropdown name='currUnit' onChange={this.handleChangeUnit} options={weights} value={currUnit || def} />}
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
                value={count != null ? count : cnt.value}
                label={{ basic: true, content: (cnt.unit && (cnt.unit.shortname || cnt.unit.name) || '') }}
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
                value={getFromBase((currUnit || def), fullDosage) || ''}
                label={{ basic: true, content: secondName || 'мг' }}
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
              <label>На кг веса</label>
              <Input
                size='big'
                name='weightDosage'
                value={getFromBase((currUnit || def), weightDosage) || ''}
                label={{ basic: true, content: `${secondName || 'мг'}/кг` }}
                labelPosition='right'
                placeholder='0'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>
          <Form.Group>
            <Form.Field width={4}>
              <label>Кратность приема:</label>
              <Dropdown
                selection
                className='input big'
                name={'presets'}
                placeholder={'Выбрать'}
                onChange={this.setPreset}
                options={this.renderPresets()}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Суточная доза:</label>
              <Input
                size='big'
                name='dayDosage'
                value={getFromBase((currUnit || def), fullDosage) || ''}
                label={{ basic: true, content: secondName || 'мг' }}
                labelPosition='right'
                placeholder='500'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>На массу тела</label>
              <Input
                size='big'
                name='dayWeightDosage'
                value={getFromBase((currUnit || def), weightDosage) || ''}
                label={{ basic: true, content: `${secondName || 'мг'}/кг` }}
                labelPosition='right'
                placeholder='0'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>
        </Form>
        <Schedule />
        <Form>
          <Form.Group>
            <Form.Field width={16}>
              <TextArea
                size='big'
                name='specials'
                value={specials || ''}
                placeholder='Особые указания'
                onChange={this.handleChange}
              />
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    )
  }

};
export default Calculator
