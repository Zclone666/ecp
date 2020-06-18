import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  List,
  Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions')
@observer
class LF extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setLF = ( lf ) => {
    this.props.actions.stepsData.lf = lf
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { drugDosage: { lf, druglf, methodstolf, names } }
    } = this.props


    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {_.keys(lf).map(( lfid, i ) => {
          let lfItem = lf[lfid]
          return(
            <List.Item
              key={'doze'+i}
              as={RouterLink}
              to={'/concept/dozes/lf/2'}
              onClick={() => this.setLF(lfid)}
            >
              <List.Content floated='right'>
                <Icon

                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                <List.Header>{names[lfid]}</List.Header>
                {/*<List.Description>

                </List.Description>*/}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

};
export default LF
