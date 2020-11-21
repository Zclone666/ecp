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

  @observable current = {
    key: null, // уникальный ключ
    id: "", // айди ДВ или ТН
    name: "", // Название ДВ или ТН
    level: 0, //
    fpid: null, //
    type: null,
    group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
    text: null,
    specials: null,
    freq: null,
    duration: null,
    solute: false,
    dosage: { // дозировка
      form: null,
      method: null,
      pack: {},
      dosage: {},
    },
    calc: {
      dosage: [0],
      count: 1,
      dosageUnit: 248,
      dayCount: 1,
      fullDosage: [0],
      weightDosage: [0],
      dayDosage: [0],
      dayWeightDosage: [0]
    },
    schedule: {
      dateStart: null,
      dateFinish: null,
      finishAlternate: null,
      clarifications: null, //уточнения
      interval: null,
      once: null,
      week: null,
      calendar: null
    },
    helpers: {
      dosage: {},
      url: ''
    }
  }; //currDrug

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.drug = observable.map({}, 'drug')
    this.liquids = observable.map({}, 'liquids')

    autorun(() => {

    });


  }

  async setGroup(keys, group){
    if(!_.isArray(keys)) {
      keys = [keys]
    }
    keys.forEach(async (key, i) => {
      let drug = await this.drug.get(key)
      drug.group = group
      this.drug.set(key, drug)
    })
    this.stores.actions.makeLiquids = true
    setTimeout(() => {
      this.checkLiquidsOk()
    }, 300)
  }
  async resetGroups(){
    this.drug.forEach((item, i) => {
      if(item.group !== 0){
        item.group = 0
        this.drug.set(item.key, item)
      }
    })
  }

  async checkLiquidsOk(){
    let isOk = true
    let obj = {}
    this.drug.forEach((item, i) => {
      if(item.group !== 0){
        obj[item.group] = !!obj[item.group] ? obj[item.group]+1 : 1
      }
    })
    _.forEach(obj, (counter) => {
      if(counter < 2 && counter !== 0){
        isOk = false
      }
    })
    // console.log(obj)
    this.stores.actions.isLiquidsOk = isOk
  }

  //getSearch
  async search(text, saveTo='search'){
    this.searchReady = false
    let { active_language } = this.stores.actions
    let data = {
      text,
      lib: '62, 52', //'61, 25' - заболевания
      service: "43",
      chain: 0,
      active_language
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
  setFP = async ( drugKey, fpid ) => {
    let currentDrug = await this.drug.get(drugKey) || {};
    currentDrug = await _.extend(currentDrug, { fpid });
    await this.drug.set( drugKey, currentDrug );
    this.stores.dosages.get(currentDrug, true)
  }


  setDosageParams = async (url) => {
    let drugData = this.stores.actions.stepsData
    let calcData = this.stores.actions.calculatorForm
    let scheduleData = this.stores.actions.scheduleForm
    let { router: { values } } = this.stores

    let drug = this.current
    let currentDrug = this.drug.get(drug.key) || {};
    let currentDosages = this.stores.dosages.dosage.get(drug.key) || {};

    let { calcValues, getFromBase } = this.stores.dosages
    let def = (calcValues.dosage.firstUnit && calcValues.dosage.firstUnit.id ) || (calcValues.dosage.unit && calcValues.dosage.unit.id)

    let { freq, duration } = drug
    // console.log({ freq, duration });
    currentDrug.freq = freq || null
    currentDrug.duration = duration || null

    let {
      key,
      form,
      method,
      pack,
      dosage,
      value,
      helpers: {
        dosage: hdosage,
        pack: hpack
      }
    } = drugData

    let {
      way,
      step,
    } = values

    let {
      dateStart,
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
      specials
    } = scheduleData

    let {
      dosage: dos,
      count,
      dayCount,
      dosageUnit,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
    } = calcData

    currentDrug.solute = (currentDosages.form && currentDosages.form[form]) ? currentDosages.form[form].solute : currentDrug.solute
    // console.log({dosageUnit, fullDosage})
    // console.log({currentDrug})
    currentDrug.dosage = {
      form,
      method,
      pack,
      dosage,
      value
    }
    currentDrug.helpers = {
      key,
      way,
      step,
      dosage: hdosage,
      pack: hpack
    }
    currentDrug.schedule = {
      dateStart: parseInt(dateStart),
      dateFinish: parseInt(dateFinish),
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
      specials
    }

    currentDrug.calc = {
      dosage: dos,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
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

    let { freq, duration } = drug
    // console.log({ freq, duration });

    let {
      form,
      method,
      pack,
      dosage,
      value
    } = currentDrug.dosage
    let {
      key,
      way,
      step,
      dosage: hdosage,
      pack: hpack
    } = currentDrug.helpers
    let {
      dateStart,
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
      specials
    } = currentDrug.schedule
    let {
      dosage: dos,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
    } = currentDrug.calc

    this.stores.actions.stepsData = {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage,
      value,
      helpers:{
        dosage: hdosage,
        pack: hpack
      }
    }
    // console.log({dosageUnit});
    this.stores.actions.calculatorForm = {
      dosage: dos,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage
    }
    this.stores.actions.scheduleForm = {
      dateStart: dateStart || moment().format('x'),
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
      specials
    }

  }

  makeLiquid = () => {
    let liquid = {
      name: "", // Название ДВ или ТН
      group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
      specials: null,
      freq: null,
      duration: null,
      calc: {
        dosage: [0],
        count: 1,
        dosageUnit: 248,
        dayCount: 1,
        fullDosage: [0],
        weightDosage: [0],
        dayDosage: [0],
        dayWeightDosage: [0],
        fullSpeed: [0],
        weightSpeed: [0],
        tintSpeed: [0],
        liquidSpeed: [0]
      },
      schedule: {
        dateStart: null,
        dateFinish: null,
        finishAlternate: null,
        clarifications: null, //уточнения
        interval: null,
        once: null,
        week: null,
        calendar: null
      }
    }

    // liquid = _.assignIn(liquid, row);

    liquid.key = moment().format('x').toString()
    let current = this.liquid.get(liquid.key) || {};
    this.liquid.set( liquid.key, _.extend(current, liquid) );
    // console.log('dasf', this.drug.get(drug.key));

    // this.stores.dosages.get(liquid)
    //
    // this.stores.db.clearData(false, true)
    return true
  }

  selectFromSearch = async (row) => {
    let drug = {
      //key: moment().format('x').toString(), // уникальный ключ
      id:"", // айди ДВ или ТН
      name: "", // Название ДВ или ТН
      level: 0, //
      //tn: false, // ДВ или ТН
      fpid: null, //
      type: null,
      group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
      text: null,
      specials: null,
      freq: null,
      duration: null,
      solute: false,
      dosage: { // дозировка
        form: null,
        method: null,
        pack: {},
        dosage: [],
        value: null
      },
      calc: {
        dosage: [0],
        count: 1,
        dosageUnit: 248,
        dayCount: 1,
        fullDosage: [0],
        weightDosage: [0],
        dayDosage: [0],
        dayWeightDosage: [0]
      },
      schedule: {
        dateStart: null,
        dateFinish: null,
        finishAlternate: null,
        clarifications: null, //уточнения
        interval: null,
        once: null,
        week: null,
        calendar: null
      },
      helpers: {
        dosage: {},
        pack: {},
        url: '',
        key: null,
        way: null,
        step: null,
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
    this.stores.dosages.dosage.delete(row.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.stores.db.clearData(false, true)
    this.checkLiquidsOk()
    return true
  }

}
export default Drugs;
