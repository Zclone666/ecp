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

  get warnDrugs(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups, warnIcons }
    } = this.props
    let drugsObj = {}
    Array.from(warnings.data.values()).forEach(( warn, i ) => {
      console.log({ warn });
      if(_.find(warn.subjects, { 'drugkey': selectedDrug }) && warn.type === 'interdrug' ){
        let arr = _.filter(warn.subjects, (o) => { return o.drugkey !== selectedDrug; }) || []
        console.log({ arr });
        arr.forEach(( item, x ) => {
          console.log({ item });
          if( !drugsObj[item.drugkey] || drugsObj[item.drugkey].value < warn.value ){
            drugsObj[item.drugkey] = {
              value: warn.value,
              group: warn.group,
              color: warn.color,
            }
          }
        })
      }
    })
    console.log({drugsObj});
    return drugsObj
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

    let warnDrugs = this.warnDrugs
    // console.log('iterator', iterator);
    return (
      <List divided selection verticalAlign='middle' size='big' className='drugslist'>
        {iterator.map(( drug, i ) => {
          return(
            <Drug active={warnDrugs[drug.key] || false} drug={drug} key={`drug_${i}`} />
          )

        })}
      </List>
    )
  }

};
export default Drugs
