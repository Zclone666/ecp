import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Drug from './Drug';

import {
  Menu,
  List,
  Feed,
  Button,
  Responsive,
  Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions')
@observer
class Drugs extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }

  selectDrug = (drugId) => {
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups }
    } = this.props
    let selectedWarnings = warnings[drugId]
    let groups = []
    let drugs = []
    for( let key in selectedWarnings ){
      groups = _.unionWith(groups, [selectedWarnings[key].group], (a, b) => a === b);
      drugs = _.unionWith(drugs, [key], (a, b) => a === b);
    }
    console.log({ groups, drugs });
    this.props.actions.selectedDrug = drugId
    this.props.actions.activeConflicts = groups
    this.props.actions.selectedConflict = null
    this.props.actions.activeDrugs = drugs
  }
  render(){
    // const { selectedDrug, selectedConflict } = this.state
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups }
    } = this.props
    let selectedWarnings = warnings[selectedDrug]
    // console.log('activeDrugs', activeDrugs);
    return (
      <List divided selection verticalAlign='middle' size='big' className='drugslist'>
        {selectedRows.map(( drug, i ) => {
          let { name, level, tn } = drug
          let currWarning = activeDrugs.includes(drug.id) && (selectedWarnings && warnGroups[selectedWarnings[drug.id].group] || warnGroups[selectedConflict])
          let hasWarning = warnings[drug.id] && !_.isEmpty(warnings[drug.id])
          // console.log('warnings[drug.id]', warnings[drug.id]);
          let maxItem = _.maxBy(_.toArray(warnings[drug.id]), function(o){ return o.value; });
          // console.log('currWarning', currWarning);
          // console.log('maxItem', maxItem);
          let className = selectedDrug === drug.id ? 'selected' : ''
          className += (activeDrugs.length < 1 || activeDrugs.includes(drug.id) || selectedDrug === drug.id)  ? '' : ' unused'
          return(
            <List.Item key={`drug_${i}`} className={className}>
              <List.Content floated='right'>
                <Responsive fireOnMount as={Button.Group} vertical basic color='blue' maxWidth='480'>
                  <Button icon>
                    <Icon name='ellipsis horizontal' />
                  </Button>
                </Responsive>
                <Responsive fireOnMount as={Button.Group} basic color='blue' minWidth='481'>
                  <Button icon>
                    <Icon name='tint' />
                  </Button>
                  <Button icon>
                    <Icon name='font' />
                  </Button>
                  <Button icon>
                    <Icon name='delete' />
                  </Button>
                </Responsive>
              </List.Content>
              {(currWarning && currWarning.valuecolor) ?
                <div className='left floated content arrowBg' style={{ backgroundColor: currWarning.valuecolor }} >
                  <List.Icon
                    name='arrow alternate circle right'
                    style={{ color: '#FFF' }}
                    size='large'
                    onClick={() => this.setState({ selectedDrug: drug.id })}
                  />
                </div>
                :
                <div className='left floated content arrowBg none'>
                  <List.Icon
                    name='arrow alternate circle right'
                    style={{ color: '#FFF' }}
                    size='large'
                  />
                </div>
              }
              {hasWarning ?
                <List.Icon name='warning circle' style={{ color: maxItem.valuecolor }} size='large' onClick={() => this.selectDrug(drug.id)} />
                :
                <List.Icon name='warning circle' size='large' style={{ color: 'transparent' }} />
              }

              <List.Content className='ui feed large'>
                <Feed.Event>
                  <Feed.Content>
                    <Feed.Summary>
                      <span className='underlined'>{name}</span>{tn && <span><sup>TM</sup></span>}
                      <Feed.Date>внутривенное введение, 1 мл</Feed.Date>
                    </Feed.Summary>
                    <Feed.Meta>
                      р-р для в/в и в/м введ 0.1 % (1 мг/мл) (ампула 1 мл)
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              </List.Content>
            </List.Item>
          )
        })}
      </List>
    )
  }

};
export default Drugs
