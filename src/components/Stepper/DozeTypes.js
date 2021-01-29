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



  get dosages(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        stepsData
      },
      drugs: { current },
      dosages: { dosage },
    } = this.props

    let drugDosage = dosage.get(current.key)
    let { drug, form, methodform, names, nameshort } = drugDosage

    let arr = []

    form[stepsData.form] && form[stepsData.form].dosage.forEach((item, i) => {
      let itemDosage = null
      if(_.isArray(item.dosage) && item.dosage.length > 0) itemDosage = item.dosage
      if(_.isObject(item.dosage) && !(_.isArray(item.dosage))) itemDosage = [item.dosage]

      // if(form[stepsData.form].solute){
      //
      // }
      //console.log({item});
      //console.log({itemDosage});
      if(!itemDosage){
        arr.push({
          dosage: { short: 'нет данных', full: 'Дозировка не указана', id: 248 },
          pack: { short: '', full: '', id: (item.pack && item.pack[0] && item.pack[0].dosage) ? item.pack[0].dosage.id_1 : null },
          type: 'simple',
          value: 0,
          obj: {
            dosages: null,
            pack: null,
          }
        })
      }else{
        let currPack = {
          dosage: { short: '', full: '', id: itemDosage[0].id_1 },
          pack: { short: '', full: '', id: item.pack[0].dosage ? item.pack[0].dosage.id_1 : null },
          type: 'simple',
          value: 0,
          flag: false
        }
        if(form[stepsData.form].solute && _.isArray(item.pack) && item.pack.length > 0 ){
          item.pack.forEach((pack, x) => {
            if(!pack.dosage) pack.dosage = {}
            currPack = {
              dosage: { short: '', full: '', id: itemDosage[0].id_1 },
              pack: { short: '', full: '', id: pack.dosage.id_1 },
              type: 'simple',
              value: 0,
              flag: !!(itemDosage[0] && itemDosage[0].id_2),
              obj: {
                dosages: itemDosage,
                pack: pack,
              }
            }
            if(_.isArray(itemDosage) && itemDosage.length > 1 ){
              currPack.dosage.full += _.map(itemDosage, 'value_1').join(' + ') + ' ' + names[itemDosage[0].id_1]
              currPack.dosage.short += _.map(itemDosage, 'value_1').join(' + ') + ' ' + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1])
              currPack.type = 'multi'
              currPack.value = Array.from(_.map(itemDosage, 'value_1'))
            }else if(_.isArray(itemDosage) && itemDosage.length === 1 ){
              let val = itemDosage[0].value_2 ? itemDosage[0].value_1/itemDosage[0].value_2 : itemDosage[0].value_1
              currPack.dosage.full += val + ' ' + names[itemDosage[0].id_1]
              currPack.dosage.short += val + ' ' + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1])
              currPack.value = [val]
            }
            currPack.pack.full += (names[pack.id] || '') + (pack.dosage && (', ' + (pack.dosage.value_1 || '') + ' ' + (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1] || '')) || '')
            currPack.pack.short += (nameshort[pack.id] || names[pack.id] || '') + (pack.dosage && (', ' + (pack.dosage.value_1 || '') + ' ' + (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1] || '')) || '')
            arr.push({ ...currPack })
          })
        }else{
          let pack = item.pack[0]
          if(_.isArray(itemDosage) && itemDosage.length > 1 ){
            currPack.dosage.full += _.map(itemDosage, 'value_1').join(' + ') + ' ' + names[itemDosage[0].id_1]
            currPack.dosage.short += _.map(itemDosage, 'value_1').join(' + ') + ' ' + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1])
            currPack.type = 'multi'
            currPack.value = Array.from(_.map(itemDosage, 'value_1'))
          }else if(_.isArray(itemDosage) && itemDosage.length === 1 ){
            let val = itemDosage[0].value_2 ? itemDosage[0].value_1/itemDosage[0].value_2 : itemDosage[0].value_1
            currPack.dosage.full += val + ' ' + names[itemDosage[0].id_1]
            currPack.dosage.short += val + ' ' + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1])
            currPack.value = [val]
          }
          currPack.flag = !!(itemDosage[0] && itemDosage[0].id_2)
          currPack.obj = {
            dosages: itemDosage,
            pack: null//item.pack[0]
          }
          arr.push({ ...currPack })
        }
      }


    })
    return arr

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
      dosages: { dosage }, //drugsDosages
      router: { values }
    } = this.props
    let way = values.way || 'lf'
    let url = !values.liquid ? `/concept/dozes/${way}` : `/liquid/calc/${values.liquid}/dozes/${way}`
    let currStep = parseInt(values.step || 0)


    let drugDosage = dosage.get(current.key)
    let { drug, form, methodform, names } = drugDosage

    return (
      <List animated divided selection className='dozelist' verticalAlign='middle' size='large' >
        {this.dosages.map(( dose, i ) => {

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
                <List.Header>{dose.dosage.short.length > 0 ? dose.dosage.short : dose.dosage.full}</List.Header>
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
