import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';

const colorPallette = [
  '#007b2b',
  '#b0d512',
  '#03529b',
  '#fff42b',
  '#ffca2f',
  '#fc7301',
  '#f42a03',
]

class Drugs {
  @observable ready = false;

  @observable current = { //drugDosage
    drug: {},
    form: {},
    methodform: {},
    names: {},
    nameshort: {},
    units: {}
  }

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.dosage = observable.map({}, 'dosage')

    autorun(() => {

    });


  }

  //getLF
  async getFp(drug_obj){
    let { active_language } = this.stores.actions
    let data = {
      drug: drug_obj,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `drugs/FPDosage`,
        data,
        success: async data => {
          // console.log('DATA', data);
          let drugDosage = this.dosage.get(drug_obj.key)
          let { names, nameshort } = drugDosage
          let { dosage, fp, lf, method, methodform, name, shortname, pack, packname } = data
          await this.stores.tools.setNames(name, shortname)
          dosage = _.isArray(dosage) ? dosage : [dosage]
          let currPack = {
            dosage: { short: '', full: '', id: dosage[0].id_1 },
            pack: { short: '', full: '', id: pack.id_1 },
            type: 'simple',
            value: 0,
            flag: false,
            obj: {
              dosages: dosage,
              pack: {
                dosage: pack,
                id: packname
              },
            }
          }
          if(_.isArray(dosage) && dosage.length > 1 ){
            currPack.dosage.full += _.map(dosage, 'value_1').join(' + ') + ' ' + names[dosage[0].id_1]
            currPack.dosage.short += _.map(dosage, 'value_1').join(' + ') + ' ' + (nameshort[dosage[0].id_1] || names[dosage[0].id_1])
            currPack.type = 'multi'
            currPack.value = Array.from(_.map(dosage, 'value_1'))
          }else if(_.isArray(dosage) && dosage.length === 1 ){
            let val = dosage[0].value_2 ? dosage[0].value_1/dosage[0].value_2 : dosage[0].value_1
            currPack.dosage.full += val + ' ' + names[dosage[0].id_1]
            currPack.dosage.short += val + ' ' + (nameshort[dosage[0].id_1] || names[dosage[0].id_1])
            currPack.value = val
          }
          currPack.pack.full += names[packname] + (pack && (', ' + pack.value_1 + ' ' + (nameshort[pack.id_1] || names[pack.id_1])) || '')
          currPack.pack.short += (nameshort[packname] || names[packname]) + (pack && (', ' + pack.value_1 + ' ' + (nameshort[pack.id_1] || names[pack.id_1])) || '')

          this.stores.actions.stepsData = {
            key: drug_obj.key,
            way: 'lf',
            step: 4,
            form: lf,
            method,
            pack: currPack
          }

          this.stores.drugs.current = drug_obj

          await this.stores.drugs.setDosageParams(`/concept/dozes/lf/4`)


        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }

  async get(drug_obj, flag=false){
    let currentDosages = await this.dosage.get(drug_obj.key);
    let { active_language } = this.stores.actions
    if(currentDosages && !flag) {
      await this.stores.drugs.getDosageParams()
      return
    }
    let data = {
      drug: drug_obj,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `drugs/Dosages`,
        data,
        success: async data => {
          //console.log('DATA', data);
          let { drug, form, methodform, names, nameshort, units } = data
          await this.stores.tools.setNames(names, nameshort)
          let current = this.dosage.get(drug.key) || {};
          await this.dosage.set( drug.key, _.extend(current, { drug, form, methodform, names, nameshort, units, url: '/concept/dozes/' }) );
          if(units && units.length > 0) await this.stores.tools.getUnitsPharm(units)
          if(drug_obj.fpid) this.getFp(drug_obj)
        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }



  get calcValues(){
    let drug = this.stores.drugs.current
    let dosages = this.current
    let currDos = this.stores.actions.stepsData.pack
    let { units, getUnitArr } = this.stores.tools

    let unit = (currDos.dosage && units[currDos.dosage.id]) || null
    let firstUnit = null
    let secondUnit = null

    if(unit && unit.type && unit.type === 'complex'){
      unit.contains.forEach(( item ) => {
        if(item.action === 'multiplication') firstUnit = units[item.id]
        if(item.action === 'division') secondUnit = units[item.id]
      })
    }
    // console.log({firstUnit, unit});
    let unitsArr = ((firstUnit || unit) && getUnitArr((firstUnit && firstUnit.id) || (unit && unit.id))) || {}
    //console.log({currDos});
    return {
      dosage: {
        value: currDos.value,
        units: unitsArr,
        unit,
        firstUnit,
        secondUnit
      },
      count: {
        value: 1,
        unit: currDos.pack && units[currDos.pack.id]
      }
    }
  }

  setStepDosage = () => {
    let vals = this.calcValues
    let weight = this.stores.actions.drugStructure.patient.weight || null

    // console.log({vals});

    let baseDosage = vals.dosage.value
    let dosage = vals.dosage.value

    if(vals.dosage.firstUnit){
      vals.dosage.firstUnit.contains.forEach(( contain ) => {
        if(contain.action === 'division'){
          dosage = dosage / contain.value
        }else{
          dosage = dosage * contain.value
        }
      })
    }

    vals.dosage.unit.contains.forEach(( contain ) => {
      if(contain.action === 'division'){
        dosage = dosage / contain.value
      }else{
        dosage = dosage * contain.value
      }
    })

    this.stores.actions.calculatorForm = {
      // baseDosage,
      dosage,
      count: vals.count.value,
      dayCount: 1,
      fullDosage: dosage * vals.count.value,
      weightDosage: (weight ? (dosage * vals.count.value)/weight : 0),
      dayDosage: dosage * vals.count.value,
      dayWeightDosage: (weight ? (dosage * vals.count.value)/weight : 0)
    }
  }

  getFromBase = ( unitId, value ) => {
    if( value === '' || value === 0 || value === '0' || value === '.' || (value.split && (value.split(',')[1] === '' || value.split('.')[1] === '')) ) return value
    let unit = this.stores.tools.units[unitId]
    if(!unit) return 0
    let dosage = value

    // console.log({ unit });
    unit.contains.forEach(( contain ) => {
      if(contain.action === 'division'){
        dosage = dosage * contain.value
      }else{
        dosage = dosage / contain.value
      }
    })
    return dosage
  }

  getToBase = ( unitId, value ) => {
    if( value === '' || value === 0 || value === '0' || value === '.' || (value.split && (value.split(',')[1] === '' || value.split('.')[1] === '')) ) return value
    let unit = this.stores.tools.units[unitId]
    if(!unit) return 0
    let dosage = value

    // console.log({ unit });
    unit.contains.forEach(( contain ) => {
      if(contain.action === 'division'){
        dosage = dosage / contain.value
      }else{
        dosage = dosage * contain.value
      }
    })
    return dosage
  }

  // setDosageParams = async (url) => {
  //   let drugData = this.stores.actions.stepsData
  //
  //   let drug = this.current
  //   let currentDrug = await this.drug.get(drug.key) || {};
  //   let currentDosages = await this.dosage.get(drug.key) || {};
  //
  //   let {
  //     key,
  //     way,
  //     step,
  //     form,
  //     method,
  //     pack,
  //     dosage
  //   } = drugData
  //
  //   currentDrug.dosage = {
  //     key,
  //     way,
  //     step,
  //     form,
  //     method,
  //     pack,
  //     dosage
  //   }
  //   await this.drug.set( drug.key, currentDrug );
  //
  //   await this.dosage.set( drug.key, _.extend(currentDosages, { url }) );
  //   this.clearData()
  // }
  // getDosageParams = async () => {
  //   let drugData = this.stores.actions.stepsData
  //
  //   let drug = this.current
  //   let currentDrug = await this.drug.get(drug.key) || {};
  //   let currentDosages = await this.dosage.get(drug.key) || {};
  //
  //   let {
  //     key,
  //     way,
  //     step,
  //     form,
  //     method,
  //     pack,
  //     dosage
  //   } = current.dosage
  //
  //   this.stores.actions.stepsData = {
  //     key,
  //     way,
  //     step,
  //     form,
  //     method,
  //     pack,
  //     dosage
  //   }
  //
  // }

}
export default Drugs;
