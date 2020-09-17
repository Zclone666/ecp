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
  async get(drug_obj){
    let currentDosages = await this.dosage.get(drug_obj.key);
    if(currentDosages) {
      await this.stores.drugs.getDosageParams()
      return
    }
    let data = {
      lib: '52, 62',
      service: "43",
      drug: drug_obj
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `drugs/Dosages`,
        data,
        success: async data => {
          //console.log('DATA', data);
          let { drug, form, methodform, names, nameshort, units } = data
          this.stores.tools.setNames(names, nameshort)
          let current = this.dosage.get(drug.key) || {};
          this.dosage.set( drug.key, _.extend(current, { drug, form, methodform, names, nameshort, units, url: '/concept/dozes/' }) );
          if(units && units.length > 0) this.stores.tools.getUnitsPharm(units)
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
      fullDosage: dosage * vals.count.value,
      weightDosage: (weight ? (dosage * vals.count.value)/weight : 0)
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
