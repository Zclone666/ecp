import React from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a';

import {
  Menu,
  List,
  Feed,
  Button,
  Responsive,
  Icon,
  Popup,
  Input,
  TextArea,
  Form
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'dosages', 'tools')
@observer
class RecipeDrug extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      edit: false,
      text: null,
      from: 'dosage'
    }
  }

  handleChange = (e) => {
    let { value } = e.target
    this.setState({ from: 'text' }, () => {
      this.setState({ text: value })

    })
  }
  undo = () => {
    this.setState({ from: 'dosage', text: null })
  }

  getLF = () => {
    let { drug } = this.props
    this.props.dosages.get(drug)
    //this.props.db.GetDuration(drug)
    this.props.drugs.current = { ...drug }
    // this.props.router.push('/concepts/dozes')
  }
  unselectDrug = () => {
    let { drug } = this.props
    this.props.drugs.unselectDrug(drug)
  }

  edit = () => {
    let {
      drugs: { drug }, //drugs, drugsDosages, currDrug, setDosageParams
      drug: current,
    } = this.props
    this.setState({ edit: !this.state.edit })
    let currDrug = drug.get(current.key)
    drug.set(current.key, _.extend(currDrug, {text: this.state.text}))
  }

  getMNN = () => {
    let {
      drug: {
        fpid,
        group,
        id,
        key,
        level,
        main,
        name,
        namesearch,
        type
      }
    } = this.props
    // console.log(drug);
    this.props.drugs.MNNfromTN({
      fpid,
      group,
      id,
      key,
      level,
      main,
      name,
      namesearch,
      type
    })
  }

  renderRules(){
    let {
      dosages: { getFromBase },
      tools: { names, shortnames, round },
      drug: {
        freq,
        duration,
        calc,
        dosage,
        helpers
      },
      drug,
      actions: { UIText }
    } = this.props

    let arr = []

    // console.log({drug});

    if(calc.fullDosage && helpers.dosage && helpers.dosage.id ){
      let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage)
      let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit]
      arr.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(' + ')} ${dosageName}`)
    }

    if(freq && UIText.freq[freq]) arr.push(UIText.freq[freq])
    if(duration && UIText.duration[duration]) arr.push(UIText.duration[duration])

    return {
      empty: arr.length < 1,
      text: arr.join(', ')
    }
  }

  get inputValue(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      // drugs: { current }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage: dose },
      // db: { selectedRows, warnings, warnGroups, drugsDosages, warnIcons },
      drug,
      active
    } = this.props

    let { edit, text, from } = this.state

    // let selectedWarnings = warnIcons[selectedDrug]
    let { key, name, level, tn, type, dosage, schedule, helpers } = drug
    let drugDosages = dose.get(key) || {}

    let names = drugDosages.names || {}

    let descArr = []
    let rules = this.renderRules()

    if(dosage.form) descArr.push(names[dosage.form])
    if(helpers.dosage && helpers.dosage.short) descArr.push(helpers.dosage.short)
    if(helpers.pack && helpers.pack.short) descArr.push(helpers.pack.short)
    if(dosage.method) descArr.push(names[dosage.method])
    if(schedule && schedule.specials) descArr.push(schedule.specials)
    if(!rules.empty){ descArr.push(rules.text) }

    // if(dosage.form && names[dosage.form]) descArr.push(names[dosage.form])
    // if(dosage.method && names[dosage.method]) descArr.push(names[dosage.method])
    // if(dosage.pack.dosage) descArr.push(dosage.pack.dosage)
    // if(dosage.pack.pack) descArr.push(dosage.pack.pack)

    let inputValue = from === 'dosage' ? descArr.join(', ') : text
    return inputValue
  }

  componentDidUpdate(prevProps, prevState){
    let {
      drugs: { drug }, //drugs, drugsDosages, currDrug, setDosageParams
      drug: current,
    } = this.props
    let { inputValue } = this

    if(inputValue == this.state.text || this.state.edit) return
    this.setState({ text: inputValue }, () => {
      let currDrug = drug.get(current.key)
      drug.set(current.key, _.extend(currDrug, {text: this.state.text}))
    })

  }

  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      dosages: { dosage: dose },
      drug,
      active
    } = this.props

    let { edit, text, from } = this.state

    // let selectedWarnings = warnIcons[selectedDrug]
    let { key, name, level, tn, type, dosage, schedule, helpers } = drug
    let drugDosages = dose.get(key) || {}

    let names = drugDosages.names || {}

    // let descArr = []
    // let rules = this.renderRules()
    //
    // if(dosage.form) descArr.push(names[dosage.form])
    // if(helpers.dosage && helpers.dosage.short) descArr.push(helpers.dosage.short)
    // if(helpers.pack && helpers.pack.short) descArr.push(helpers.pack.short)
    // if(dosage.method) descArr.push(names[dosage.method])
    // if(schedule && schedule.specials) descArr.push(schedule.specials)
    // if(!rules.empty){ descArr.push(rules.text) }

    // if(dosage.form && names[dosage.form]) descArr.push(names[dosage.form])
    // if(dosage.method && names[dosage.method]) descArr.push(names[dosage.method])
    // if(dosage.pack.dosage) descArr.push(dosage.pack.dosage)
    // if(dosage.pack.pack) descArr.push(dosage.pack.pack)

    let { inputValue } = this
    return(
      <List.Item>
        <List.Content floated='right'>
          <Button.Group color='blue'>
            <Button title='отменить изменения предписания' icon onClick={this.undo} icon disabled={from === 'dosage'}>
              <Icon name='undo' />
            </Button>
            <Button icon onClick={this.edit}>
              <Icon name={edit ? 'check' : 'edit'} />
            </Button>
            <Button icon>
              <Icon name='delete' onClick={this.unselectDrug} />
            </Button>
          </Button.Group>
        </List.Content>

        <List.Content>
          <List.Content>
            <List.Header>
              <span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}{' '}
              {!helpers.mnn && <label><span className='link' onClick={this.getMNN}>Заменить на МНН</span></label>}
            </List.Header>
            <List.Description>
              {!edit &&
                inputValue
              }
            </List.Description>
          </List.Content>
        </List.Content>
        {edit &&
          <Form fluid>
            <TextArea
              fluid
              name='text'
              value={inputValue || ''}
              placeholder='Особые указания'
              onChange={this.handleChange}
            />
            {/*<Input value={inputValue} size='small' fluid onChange={this.handleChange}>
              <input />
              <Button onClick={this.undo} icon disabled={from === 'dosage'}><Icon name='undo' /></Button>
            </Input>*/}
          </Form>
        }
      </List.Item>

    )
  }

};
export default RecipeDrug
