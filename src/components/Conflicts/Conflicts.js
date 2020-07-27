import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Conflict from './Conflict';

import {
  Menu,
  List,
  Feed,
  Button,
  Responsive,
  Icon,
  Grid,
  Segment
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions')
@observer
class Conflicts extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  selectConflict = (groupId) => {
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups }
    } = this.props
    if( this.props.actions.selectedConflict === groupId ){
      this.props.actions.selectedDrug = null
      this.props.actions.selectedConflict = null
      //this.props.actions.activeDrugs = []
      this.props.actions.activeConflicts = []
    }else{
      this.props.actions.selectedDrug = null
      this.props.actions.selectedConflict = groupId
      //this.props.actions.activeDrugs = warnGroups[groupId].ids
      this.props.actions.activeConflicts = [parseInt(groupId)]
    }

  }

  get conflicts(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups, warnIcons }
    } = this.props
    let conflictObj = {}
    if(selectedConflict){
      let warn = warnGroups[selectedConflict]
      conflictObj[selectedConflict] = {
        value: warn.value,
        trust: warn.trust,
        color: warn.valuecolor
      }
    }else{
      Array.from(warnings.data.values()).forEach(( warn, i ) => {
        //console.log({ ...warn });
        let found = _.find(warn.subjects, { 'drugkey': selectedDrug })
        //console.log({ type: warn.type, value: warn.value, found });
        if( _.find(warn.subjects, { 'drugkey': selectedDrug }) ){

          if(!conflictObj[warn.type] || conflictObj[warn.type].value < warn.value ){
            //console.log({ type: warn.type, value: warn.value });
            conflictObj[warn.type] = {
              value: warn.value,
              trust: warn.trust,
              color: warn.color
            }
          }
        }
      })
    }

    // console.log({drugsObj});
    return conflictObj
  }

  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups }
    } = this.props
    let selectedWarnings = this.conflicts
    let noSelections = _.isEmpty(selectedWarnings)
    // console.log('activeConflicts', activeConflicts);
    return (
      <>
        <Grid as={Segment} basic>
          {_.keys(warnGroups).map((key, i) => {
            let group = warnGroups[key]
            let color = (selectedWarnings[group.type] && selectedWarnings[group.type].color) || group.valuecolor
            return(
              <Grid.Column key={'warn'+i} className='conflict' onClick={() => this.selectConflict(key)}>
                <Icon.Group size='big' className={noSelections || selectedWarnings[group.type] ? 'selected' : 'gray'}>
                  <Icon as='img' src={`/warningicons/${group.type}.svg`} />
                  <Icon size='big' name='circle outline' style={{ color }} />
                </Icon.Group>
              </Grid.Column>
            )

          })}
        </Grid>
      </>
    )
  }

};
export default Conflicts
