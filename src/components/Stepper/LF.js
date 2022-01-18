import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  List,
  Icon,
} from 'semantic-ui-react'
import { withTranslation } from "react-i18next";
import _ from 'lodash';

const LF = inject('db', 'actions', 'router', 'drugs', 'dosages')(observer(class LF extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setLF = ( lf ) => {
    this.props.actions.stepsData.form = lf
  }
  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData,
      },t,
      drugs: { current }, //drugs, currDrug, setDosageParams
      dosages: { dosage }, //drugsDosages
      router: { values }
    } = this.props

    let way = values.way || 'lf'
    let url = !values.liquid ? `/concept/dozes/${way}` : `/liquid/calc/${values.liquid}/dozes/${way}`
    let currStep = parseInt(values.step || 0)
    //console.log('currDrug', currDrug);

    let drugDosage = dosage.get(current.id) || {}
    //console.log('drugDosage', drugDosage);
    let { drug, form, methodform, names } = drugDosage

    let iterator = (stepsData.way === 'methods' && stepsData.method) ? methodform[stepsData.method] : _.keys(form)

    return (
      <List animated divided selection className='dozelist' verticalAlign='middle' size='large' >
        {iterator.map(( lfid, i ) => {
          let lfItem = form[lfid]

          return(
            <List.Item
              key={'doze'+i}
              disabled={(values.liquid && !lfItem.solute)}
              as={RouterLink}
              to={`${url}/${currStep+1}`}
              onClick={() => this.setLF(lfid, lfItem)}
            >
              <List.Content floated='right'>
                <Icon
                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                <List.Header>{names[lfid]} {lfItem.solute && <Icon name='lab' />}</List.Header>
                {(false && lfItem.solute) && <List.Description>
                  {t("suitable_for_solutions")}
                </List.Description>}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

}));

export default withTranslation()(LF)
