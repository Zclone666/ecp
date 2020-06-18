import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  List,
  Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class DozeTypes extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setDosage = ( lf ) => {
    this.props.actions.stepsData.dosage = lf
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      db: { drugDosage: { lf, druglf, methodstolf, names } },
      router: { values }
    } = this.props
    let way = values.way || 'lf'
    let currStep = parseInt(values.step || 0)

    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {lf[stepsData.lf] && lf[stepsData.lf].dosage.map(( dosage, i ) => {

          return(
            <List.Item
              as={RouterLink}
              to={`/concept/dozes/${way}/${currStep+1}`}
              onClick={() => this.setDosage(dosage.bigid)}
            >
              <List.Content floated='right'>
                <Icon

                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                <List.Header>{dosage.value} {names[dosage.bigid]}</List.Header>
                {/*<List.Description>
                  {names[dosage.bigid]}
                </List.Description>*/}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

};
export default DozeTypes
