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
  setDosage = ( lf ) => {
    // console.log({lf});
    //this.props.actions.stepsData.dosage = lf.bigid
    this.props.actions.stepsData.pack = lf
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
      drugs: { current }, //drugs, currDrug, setDosageParams
      dosages: { dosage }, //drugsDosages
    } = this.props

    let drugDosage = dosage.get(current.key)
    let { drug, form, methodform, names, nameshort } = drugDosage

    let arr = []

    form[stepsData.form] && form[stepsData.form].dosage.forEach((item, i) => {
      let currPack = {
        dosage: { short: '', full: '', id: item.dosage[0].id_1 },
        pack: { short: '', full: '', id: item.pack[0].dosage.id_1 },
        type: 'simple',
        value: 0,
        flag: false
      }
      // if(form[stepsData.form].solute){
      //
      // }
      //console.log({item});
      if(form[stepsData.form].solute && _.isArray(item.pack) && item.pack.length > 0 ){
        item.pack.forEach((pack, x) => {
          if(!pack.dosage) pack.dosage = {}
          currPack = {
            dosage: { short: '', full: '', id: item.dosage[0].id_1 },
            pack: { short: '', full: '', id: pack.dosage.id_1 },
            type: 'simple',
            value: 0,
            flag: !!(item.dosage[0] && item.dosage[0].id_2),
            obj: {
              dosages: item.dosage,
              pack: pack,
            }
          }
          if(_.isArray(item.dosage) && item.dosage.length > 1 ){
            currPack.dosage.full += _.map(item.dosage, 'value_1').join(' + ') + ' ' + names[item.dosage[0].id_1]
            currPack.dosage.short += _.map(item.dosage, 'value_1').join(' + ') + ' ' + (nameshort[item.dosage[0].id_1] || names[item.dosage[0].id_1])
            currPack.type = 'multi'
            currPack.value = Array.from(_.map(item.dosage, 'value_1'))
          }else if(_.isArray(item.dosage) && item.dosage.length === 1 ){
            let val = item.dosage[0].value_2 ? item.dosage[0].value_1/item.dosage[0].value_2 : item.dosage[0].value_1
            currPack.dosage.full += val + ' ' + names[item.dosage[0].id_1]
            currPack.dosage.short += val + ' ' + (nameshort[item.dosage[0].id_1] || names[item.dosage[0].id_1])
            currPack.value = val
          }
          currPack.pack.full += names[pack.id] + (pack.dosage && (', ' + pack.dosage.value_1 + ' ' + (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1])) || '')
          currPack.pack.short += (nameshort[pack.id] || names[pack.id]) + (pack.dosage && (', ' + pack.dosage.value_1 + ' ' + (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1])) || '')
          arr.push({ ...currPack })
        })
      }else{
        if(_.isArray(item.dosage) && item.dosage.length > 1 ){
          currPack.dosage.full += _.map(item.dosage, 'value_1').join(' + ') + ' ' + names[item.dosage[0].id_1]
          currPack.dosage.short += _.map(item.dosage, 'value_1').join(' + ') + ' ' + (nameshort[item.dosage[0].id_1] || names[item.dosage[0].id_1])
          currPack.type = 'multi'
          currPack.value = Array.from(_.map(item.dosage, 'value_1'))
        }else if(_.isArray(item.dosage) && item.dosage.length === 1 ){
          let val = item.dosage[0].value_2 ? item.dosage[0].value_1/item.dosage[0].value_2 : item.dosage[0].value_1
          currPack.dosage.full += val + ' ' + names[item.dosage[0].id_1]
          currPack.dosage.short += val + ' ' + (nameshort[item.dosage[0].id_1] || names[item.dosage[0].id_1])
          currPack.value = val
        }
        currPack.flag = !!(item.dosage[0] && item.dosage[0].id_2)
        currPack.obj = {
          dosages: item.dosage
        }
        arr.push({ ...currPack })
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
    let currStep = parseInt(values.step || 0)


    let drugDosage = dosage.get(current.key)
    let { drug, form, methodform, names } = drugDosage

    return (
      <List animated divided selection verticalAlign='middle' size='large' >
        {this.dosages.map(( dose, i ) => {

          return(
            <List.Item
              as={RouterLink}
              to={`/concept/dozes/${way}/${currStep+1}`}
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
