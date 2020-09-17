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
  @observable searchRows = [];

  @observable searchReady = true;

  @observable selectedRows = [];

  @observable current = {}; //currDrug

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.drug = observable.map({}, 'drug')

    autorun(() => {

    });


  }
  //getSearch
  async search(text, saveTo='search'){
    this.searchReady = false
    let data = {
      text,
      lib: '62, 52', //'61, 25' - заболевания
      service: "43",
      chain: 0
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `search/Drugs`,
        data,
        success: async data => {
          if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
            await data.concepts.forEach(( concept, i ) => {
              data.concepts[i].key = 'concept'+i
              data.concepts[i].title = data.concepts[i].name
            })
            this[`${saveTo}Rows`] = observable([])
            this[`${saveTo}Rows`] = await _.unionWith(data.concepts, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
            this.searchReady = true
          }
        },
        fail: (alerts) => {
            this.searchReady = true
          // console.log('fail', alerts);
        },
        always: (data) => {
          // this.stores.actions.makeAlerts(data)
        }
    });
  }


  setDosageParams = async (url) => {
    let drugData = this.stores.actions.stepsData
    let calcData = this.stores.actions.calculatorForm

    let drug = this.current
    let currentDrug = await this.drug.get(drug.key) || {};
    let currentDosages = await this.stores.dosages.dosage.get(drug.key) || {};

    let { calcValues, getFromBase } = this.stores.dosages
    let def = (calcValues.dosage.firstUnit && calcValues.dosage.firstUnit.id ) || (calcValues.dosage.unit && calcValues.dosage.unit.id)

    let {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage
    } = drugData

    let {
      dosage: dos,
      count,
      fullDosage,
      weightDosage
    } = calcData

    currentDrug.dosage = {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage
    }

    currentDrug.calc = {
      dosage: dos,
      count,
      fullDosage: fullDosage,
      weightDosage:  weightDosage
    }
    await this.drug.set( drug.key, currentDrug );

    await this.stores.dosages.dosage.set( drug.key, _.extend(currentDosages, { url }) );
    this.stores.db.clearData()
  }

  getDosageParams = async () => {
    let drugData = this.stores.actions.stepsData

    let drug = this.current
    let currentDrug = await this.drug.get(drug.key) || {};
    let currentDosages = await this.stores.dosages.dosage.get(drug.key) || {};

    let {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage
    } = currentDrug.dosage
    let {
      dosage: dos,
      count,
      fullDosage,
      weightDosage
    } = currentDrug.calc

    this.stores.actions.stepsData = {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage
    }
    this.stores.actions.calculatorForm = {
      dosage: dos,
      count,
      fullDosage,
      weightDosage
    }

  }

  selectFromSearch = async (row) => {
    let drug = {
      //key: moment().format('x').toString(), // уникальный ключ
      id:"", // айди ДВ или ТН
      name: "", // Название ДВ или ТН
      level: 0, //
      //tn: false, // ДВ или ТН
      fp_id: "", //
      type: null,
      group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
      dosage: { // дозировка
        // way: null,
        // step: null,
        form: null,
        method: null,
        pack: {},
        dosage: {},

      },
      calc: {
        dosage: 0,
        count: 1,
        fullDosage: 0,
        weightDosage: 0
      }
    }
    drug = _.assignIn(drug, row);

    drug.key = moment().format('x').toString()
    let current = this.drug.get(drug.key) || {};
    this.drug.set( drug.key, _.extend(current, drug) );
    // console.log('dasf', this.drug.get(drug.key));

    this.stores.dosages.get(drug)

    this.stores.db.clearData(false, true)
    return true
  }
  async unselectDrug(row){
    this.drug.delete(row.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.stores.db.clearData(false, true)
    return true
  }

}
export default Drugs;
