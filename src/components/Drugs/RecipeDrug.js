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
  Input
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'warnings')
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
    this.props.db.getLF(drug)
    //this.props.db.GetDuration(drug)
    this.props.db.currDrug = { ...drug }
    // this.props.router.push('/concepts/dozes')
  }
  unselectDrug = () => {
    let { drug } = this.props
    this.props.db.unselectDrug(drug)
  }

  edit = () => {
    this.setState({ edit: !this.state.edit })
  }

  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups, drugsDosages, warnIcons },
      drug,
      active
    } = this.props

    let { edit, text, from } = this.state

    let selectedWarnings = warnIcons[selectedDrug]
    let { key, name, level, tn, type, dosage } = drug
    let drugDosages = drugsDosages.data.get(key) || {}

    let names = drugDosages.names || {}

    let descArr = []
    if(dosage.form && names[dosage.form]) descArr.push(names[dosage.form])
    if(dosage.method && names[dosage.method]) descArr.push(names[dosage.method])
    if(dosage.pack.dosage) descArr.push(dosage.pack.dosage)
    if(dosage.pack.pack) descArr.push(dosage.pack.pack)

    let inputValue = from === 'dosage' ? descArr.join(', ') : text

    return(
      <List.Item>
        <List.Content floated='right'>
          <Button.Group color='blue'>
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
              <span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}
            </List.Header>
            <List.Description>
              {edit ?
                <Input value={inputValue} size='small' fluid onChange={this.handleChange}>
                  <input />
                  <Button onClick={this.undo} icon disabled={from === 'dosage'}><Icon name='undo' /></Button>
                </Input>
                :
                inputValue
              }
            </List.Description>
          </List.Content>
        </List.Content>
      </List.Item>

    )
  }

};
export default RecipeDrug
