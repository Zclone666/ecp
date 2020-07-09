import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Drug from './Drug';

import {
  // Menu,
  List,
  // Feed,
  Button,
  // Responsive,
  // Icon,
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


  render(){
    // const { selectedDrug, selectedConflict } = this.state
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { warnings, warnGroups, drugs }
    } = this.props
    let selectedWarnings = warnings[selectedDrug]
    // console.log('activeDrugs', activeDrugs);
    let iterator = Array.from(drugs.data.values())
    // console.log('iterator', iterator);
    return (
      <List divided selection verticalAlign='middle' size='big' className='drugslist'>
        {iterator.map(( drug, i ) => {
          return(
            <Drug drug={drug} key={`drug_${i}`} />
          )

        })}
      </List>
    )
  }

};
export default Drugs
