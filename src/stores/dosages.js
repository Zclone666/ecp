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
          this.stores.tools.getUnitsComplex(units)
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
    let currDos = this.stores.actions.stepsData
    let result = {
      dosage: {
        value: 0,
        units: [],
        unit: null
      },
      count: {
        value: 0,
        unit: null
      }
    }
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
