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
    this.props.actions.selectedDrug = null
    this.props.actions.selectedConflict = groupId
    this.props.actions.activeDrugs = warnGroups[groupId].ids
    this.props.actions.activeConflicts = [parseInt(groupId)]
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
    let selectedWarnings = warnings[selectedDrug]
    console.log('activeConflicts', activeConflicts);
    return (
      <>
        <Grid as={Segment} basic>
          {_.keys(warnGroups).map((key, i) => {
            let group = warnGroups[key]
            return(
              <Grid.Column className='conflict' onClick={() => this.selectConflict(key)}>
                <Icon.Group key={'ico'+i} size='big' className={activeConflicts.includes(parseInt(key)) ? 'selected' : 'gray'}>
                  <Icon as='img' src={`/warningicons/${group.type}.svg`} style={{ width: 45, marginLeft: 3, marginTop: 0 }} />
                  <Icon size='big' name='circle outline' style={{ color: group.valuecolor }} />
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
