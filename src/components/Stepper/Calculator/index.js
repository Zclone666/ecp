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
  Header,
  TextArea
} from 'semantic-ui-react'

import clarifications from '../../../constants/hardcode'


import Schedule from './Schedule'
import Drugs from './Drugs'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'dosages', 'tools')
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
    // console.log({ name, value });
    this.setState({ [name]: value })
    this.props.actions.calculatorForm.dosageUnit = value
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
    //value = _.map( value, (dos) => dos.split(',').join('.') )
    //if(!_.isArray(value)) value = [value]
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
      this.props.actions.drugStructure.specials = value
      return
    }
    //value = parseFloat(value)

    if( name == 'patient.weight' ){
      this.props.actions.drugStructure.patient.weight = value
    }else{
      // this.props.actions.calculatorForm[name] = value
    }
    let weight = this.props.actions.drugStructure.patient.weight

    let {
      dosage,
      count,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
    } = this.props.actions.calculatorForm

    switch (name) {
      case 'dosage':
        dosage = getToBase((currUnit || def), value.split(' + '))
        fullDosage = getToBase((currUnit || def), value*count)
        weightDosage = !weight ? [0] : _.map( fullDosage, (dos) => { return dos/weight } )

        break;
      case 'count':
        count = value
        fullDosage = _.map( dosage, (dos) => { return parseFloat(value.split(',').join('.'))*dos } )
        weightDosage = !weight ? [0] : _.map( fullDosage, (dos) => { return dos/weight } )
        break;
      case 'patient.weight':
        fullDosage = _.map( dosage, (dos) => { return count*dos } )
        weightDosage = !weight ? [0] : _.map( fullDosage, (dos) => { return dos/weight } )
        break;
      case 'fullDosage':
        fullDosage = getToBase((currUnit || def), value.split(' + '))
        count = fullDosage/dosage
        break;
      case 'weightDosage':
        weightDosage = getToBase((currUnit || def), value)
        fullDosage = (weightDosage*weight)
        count = fullDosage/dosage
        break;
      default:

    }

    dayDosage = _.map( fullDosage, (dos) => { return dos*dayCount } )
    dayWeightDosage = !weight ? [0] : _.map( weightDosage, (dos) => { return dos*dayCount } )

    this.props.actions.calculatorForm.dosage = dosage
    this.props.actions.calculatorForm.count = count
    this.props.actions.calculatorForm.fullDosage = fullDosage
    this.props.actions.calculatorForm.weightDosage = weightDosage
    this.props.actions.calculatorForm.dayDosage = dayDosage
    this.props.actions.calculatorForm.dayWeightDosage = dayWeightDosage
    setTimeout(() => {
      this.forceUpdate()
    }, 300)

    //console.log({ name, value });
  }

  setPreset = (e, {value}) => {
    let { presets } = clarifications
    let preset = _.find(presets, { 'id': value});
    let {
      type,
      dosage,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
    } = this.props.actions.calculatorForm
    this.props.drugs.current.freq = preset.id
    this.props.actions.scheduleForm.interval = preset.tpl
    // console.log({value});

    dayCount = preset.tpl[0].multiplicate
    dayDosage = _.map( (fullDosage || [1]), (dos) => { return preset.tpl[0].multiplicate * dos } )
    dayWeightDosage = _.map( (weightDosage || [1]), (dos) => { return preset.tpl[0].multiplicate * dos } )

    this.props.actions.calculatorForm = {
      type,
      dosage,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
    }

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
          value: preset.id,
          // onClick: () => this.props.actions.scheduleForm.interval = preset.tpl
          //onClick: () => this.props.actions.scheduleForm.interval = _.concat(preset.tpl, interval)
        }
      )
    })
    return arr
  }

  render(){
    let {
      actions: {
        drugStructure: {
          patient: { weight },
          specials
        },
        calculatorForm: {
          type,
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage
        },
      },
      tools: { round },
      dosages: { current: { drug, form, methodform, names }, calcValues, getFromBase },
      router: { values },
      drugs: { current },
      isLiquid
    } = this.props
    let { currUnit } = this.state

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

    let secondName = currUnit ? (currUnitObj && (currUnitObj.shortname || currUnitObj.name)) : (dos.firstUnit && (dos.firstUnit.shortname || dos.firstUnit.name) ) || (dos.unit && (dos.unit.shortname || dos.unit.name))
    let def = (dos.firstUnit && dos.firstUnit.id ) || (dos.unit && dos.unit.id)

    let liquid = values && values.liquid || null

    let disableAll = !!isLiquid
    let disableMulti = type === 'multi'

    return (
      <Segment basic>
        {isLiquid && <div className='liquiddrugs' style={{ marginBottom: '15px'}}>
          <Header>Составляющие раствора</Header>
          <Drugs liquid={liquid} />
        </div>}
        <Form>
          <Form.Group>
            <Form.Field width={4}>
              <label>Дозировка:</label>
              <Input
                disabled={disableAll || disableMulti}
                size='big'
                name='dosage'
                value={getFromBase((currUnit || def), dosage).join(' + ') || ''}
                label={<Dropdown name='currUnit' onChange={this.handleChangeUnit} options={weights} value={currUnit || def} />}
                labelPosition='right'
                placeholder='500'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Кол-во доз:</label>
              <Input
                disabled={disableAll}
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
                disabled={disableAll || disableMulti}
                size='big'
                name='fullDosage'
                value={getFromBase((currUnit || def), fullDosage).join(' + ') || ''}
                label={{ basic: true, content: secondName || 'мг' }}
                labelPosition='right'
                placeholder='500'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>На массу тела:</label>
              <Input
                disabled={disableAll}
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
              <label>На кг веса:</label>
              <Input
                disabled={disableAll || disableMulti}
                size='big'
                name='weightDosage'
                value={getFromBase((currUnit || def), weightDosage).join(' + ') || ''}
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
                disabled={disableAll}
                selection
                defaultValue={(current && current.freq) || 'CrjuCSzHZJ4I6PSMAXzTpw=='}
                className='input big'
                name={'dayCount'}
                placeholder={'Выбрать'}
                onChange={this.setPreset}
                options={this.renderPresets()}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>Суточная доза:</label>
              <Input
                disabled={disableAll || disableMulti}
                size='big'
                name='dayDosage'
                value={getFromBase((currUnit || def), dayDosage).join(' + ') || ''}
                label={{ basic: true, content: secondName || 'мг' }}
                labelPosition='right'
                placeholder='500'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={3}>
              <label>На массу тела:</label>
              <Input
                disabled={disableAll || disableMulti}
                size='big'
                name='dayWeightDosage'
                value={getFromBase((currUnit || def), dayWeightDosage).join(' + ') || ''}
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
