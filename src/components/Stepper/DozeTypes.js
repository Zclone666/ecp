import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a'
import {
  List,
  Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'dosages')
@observer
class DozeTypes extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }
  setDosage = ( data ) => {
    // console.log(data);
    let { obj, value, ...helpers } = data
    let { dosages, pack } = obj
    // console.log({ dosages, pack, value, helpers });
    this.props.actions.stepsData.dosage = dosages
    this.props.actions.stepsData.pack = pack
    this.props.actions.stepsData.value = value
    this.props.actions.stepsData.helpers = helpers
    // console.log(this.props.actions.stepsData);
  }
  tpl = () => {
    let tpl = {
      form: {
        'Gylu7sRGD3olOaK4zzIofg==': {
          dosage: [
            {
              dosage: [
                {
                  id_1: "248",
                  id_2: null,
                  type: "value",
                  value_1: 75,
                  value_2: null
                },
                {
                  id_1: "248",
                  id_2: null,
                  type: "value",
                  value_1: 4,
                  value_2: null
                },
                {
                  id_1: "248",
                  id_2: null,
                  type: "value",
                  value_1: 100,
                  value_2: null
                }
              ],
              pack: [
                {
                  dosage: {
                    id_1: "42",
                    id_2: null,
                    type: "value",
                    value_1: 15,
                    value_2: null,
                  },
                  id: "B2dhUpa/jYD2Y9hybHPSzg=="
                },
                {
                  dosage: {
                    id_1: "42",
                    id_2: null,
                    type: "value",
                    value_1: 15,
                    value_2: null,
                  },
                  id: "B2dhUpa/jYD2Y9hybHPSzg=="
                },
                {
                  dosage: {
                    id_1: "42",
                    id_2: null,
                    type: "value",
                    value_1: 15,
                    value_2: null,
                  },
                  id: "B2dhUpa/jYD2Y9hybHPSzg=="
                }
              ]
            }
          ]
        }
      }
    }
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
      drugs: { current }, //drugs, currDrug, setDosageParams
      dosages: { dosage, currDosagesArr }, //drugsDosages
      router: { values }
    } = this.props
    let way = values.way || 'lf'
    let url = !values.liquid ? `/concept/dozes/${way}` : `/liquid/calc/${values.liquid}/dozes/${way}`
    let currStep = parseInt(values.step || 0)


    let drugDosage = dosage.get(current.id)
    let { drug, form, methodform, names } = drugDosage

    return (
      <List animated divided selection className='dozelist' verticalAlign='middle' size='large' >
        {currDosagesArr.map(( dose, i ) => {

          return(
            <List.Item
              as={RouterLink}
              to={`${url}/${currStep+1}`}
              onClick={() => this.setDosage(dose)}
              key={'type'+i}
            >

              <List.Content floated='right'>
                <Icon

                  name='right chevron'
                  size='big'
                />
              </List.Content>

              <List.Content className='large'>
                {dose.flag && <Icon name='warning sign' color='red' style={{ float: 'left' }} />}
                <List.Header>{dose.dosage.small.length > 0 ? dose.dosage.small : dose.dosage.full}</List.Header>
                {dose.pack.full.length > 0 && <List.Description>
                  {dose.pack.full}
                </List.Description>}
              </List.Content>

            </List.Item>
          )

        })}
      </List>
    )
  }

};
export default DozeTypes
