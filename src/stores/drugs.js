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
    freq_id: null,
    duration: null,
    duration_id: null,
    solute: false,
    dosage: { // дозировка
      form: null,
      method: null,
      pack: {},
      dosage: {},
      value: null
    },
    calc: {
      dosage: [0],
      count: 1,
      dosageUnit: '248',
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
    this.liquid = observable.map({}, 'liquid')

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
  async MNNfromTN(drug){
    let { active_language } = this.stores.actions
    let data = {
      drug,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    let current = this.stores.drugs.drug.get(drug.key)
    if(current.helpers.mnn){
      current = _.extend(current, current.helpers.drugCache)
      current.helpers.mnn = false
      current.helpers.drugCache = null
    }else{
      return POST({
          path: `drugs/MNNfromTN`,
          data,
          success: async data => {
            current = _.extend(current, data.mnn)
            current.helpers.mnn = true
            current.helpers.drugCache = _.cloneDeep(drug)
            this.stores.drugs.drug.set(drug.key, current)
            // console.log('DATA', data);

          },
          fail: (alerts) => {

          },
          always: (data) => {

          }
      });
    }

  }
  setFP = async ( drugKey, fpid ) => {
    let currentDrug = await this.drug.get(drugKey) || {};
    currentDrug = await _.extend(currentDrug, { fpid });
    await this.drug.set( drugKey, currentDrug );
    this.stores.dosages.get(currentDrug, true)
  }


  setDosageParams = async () => {
    let drugData = this.stores.actions.stepsData
    let calcData = this.stores.actions.calculatorForm
    let scheduleData = this.stores.actions.scheduleForm
    let { router: { values } } = this.stores

    let drug = this.current
    let currentDrug = this.drug.get(drug.key) || {};
    let currentDosages = this.stores.dosages.dosage.get(drug.key) || {};

    let { calcValues, getFromBase } = this.stores.dosages
    let def = (calcValues.dosage.firstUnit && calcValues.dosage.firstUnit.id ) || (calcValues.dosage.unit && calcValues.dosage.unit.id)

    let { freq, freq_id, duration, duration_id } = drug
    // console.log({ freq, duration });
    currentDrug.freq = freq || null
    currentDrug.freq_id = freq_id || null
    currentDrug.duration = duration || null
    currentDrug.duration_id = duration_id || null
    currentDrug.specials = this.stores.actions.drugStructure.specials

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
      calendar
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
      calendar
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

    await this.stores.dosages.dosage.set( drug.key, currentDosages );
    this.stores.db.clearData()
  }

  getDosageParams = async () => {
    let drugData = this.stores.actions.stepsData

    let drug = this.current
    let currentDrug = await this.drug.get(drug.key) || {};
    let currentDosages = await this.stores.dosages.dosage.get(drug.key) || {};

    let { freq, freq_id, duration, duration_id } = drug
    // console.log({ freq, duration });
    // currentDrug.freq = freq || null
    // currentDrug.freq_id = freq_id || null
    // currentDrug.duration = duration || null
    // currentDrug.duration_id = duration_id || null
    // console.log({ freq, duration });
    let { specials } = currentDrug
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
      calendar
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
      calendar
    }
    this.stores.actions.drugStructure.specials = specials
  }

  get calcLiquid(){
    let {
			drug: drugs,
      stores: {
        tools: { unitarrs },
        router: { values: route }
      }
		} = this

    //hardcode!!!
    let liquidUnits = unitarrs[112]
    let dryUnits = unitarrs[42]

		let counts = {}
    let weights = {}
    let weight = [] // list of weights
    let count = 0 //full value of liquid
    let unit = null //dosage unit
    let liqUnit = null //liquid unit
    let id = route && route.liquid || null
    let ready = true

		drugs.forEach(( drugObj, key ) => {

			let drug = { ...drugObj }

			if(drug.group == id){
        if(drug.calc.dosage && drug.calc.dosage[0] > 0){
          if(dryUnits.includes(drug.calc.dosageUnit)){
            weights[drug.key] = {
              count: drug.calc.fullDosage,
              unit: drug.calc.dosageUnit
            }
            if(!drug.calc.fullDosage){
              drug.calc.fullDosage = []
            }else if(!Array.isArray(drug.calc.fullDosage)){
              drug.calc.fullDosage = [drug.calc.fullDosage]
            }
            weight = [ ...weight, ...drug.calc.fullDosage ]
            unit = unit || drug.calc.dosageUnit
          }else if(liquidUnits.includes(drug.calc.dosageUnit)){

          }

          if(dryUnits.includes(drug.dosage.pack.dosage.id_1)){

          }else if(liquidUnits.includes(drug.dosage.pack.dosage.id_1)){
            counts[drug.key] = {
              count: drug.calc.count,
              unit: drug.dosage.pack.dosage.id_1
            }
            count+=drug.calc.count
            liqUnit = liqUnit || drug.dosage.pack.dosage.id_1
          }

        }else{
          ready = false
        }
			}
		})
    // console.log({
    //   weight, count, weights, counts, ready, unit, liqUnit, liquidUnits, dryUnits, id
		// });

		return {
      weight, count, weights, counts, ready, unit, liqUnit, liquidUnits, dryUnits, id
		}
  }

  makeLiquids = async () => {
    let arr = []
    this.drug.forEach((drug, key) => {
      if(arr.indexOf(drug.group) === -1){
        arr.push(drug.group)
      }
    });
    arr.forEach((item, i) => {
      this.makeLiquid(item)
    });

  }
  removeLiquids = async (arr) => {
    if(!arr) return
    if(!Array.isArray(arr)) arr = [arr]
    arr.forEach((item, i) => {
      this.liquid.remove( item );
    });
  }

  makeLiquid = async (item) => {
    let current = this.liquid.get(item) || {};
    if(current.group && current.group !== 0) return
    let liquid = {
      name: "", // Название ДВ или ТН
      group: item, // группа раствора (0 - нет раствора, больше 0 - раствор)
      specials: null,
      freq: null,
      freq_id: null,
      duration: null,
      duration_id: null,
      calc: {
        dosage: [0],
        count: 0,
        dosageUnit: '248',
        dayCount: 1,
        fullDosage: [0],
        weightDosage: [0],
        dayDosage: [0],
        dayWeightDosage: [0],
        durationCount: 1,
        durationUnit: '75',
        fullSpeed: [0],
        weightSpeed: [0],
        tintSpeed: 0,
        liquidSpeed: 0
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
    await this.liquid.set( item, _.extend(current, liquid) );
    await this.getLiquidParams(item)
    return true
  }

  setLiquidParams = async (id=null) => {
    let {
      stores: {
        router: { values: route }
      }
		} = this
    id = id || (route && route.liquid || null)
    if(!id) return
    id = parseInt(id)
    let current = await this.liquid.get(id) || {};
    let {
      name, // Название ДВ или ТН
      group, // группа раствора (0 - нет раствора, больше 0 - раствор)
      specials,
      freq,
      freq_id,
      duration,
      duration_id,
      calc: {
        dosage,
        count,
        dosageUnit,
        dayCount,
        fullDosage,
        weightDosage,
        dayDosage,
        dayWeightDosage,
        durationCount,
        durationUnit,
        fullSpeed,
        weightSpeed,
        tintSpeed,
        liquidSpeed
      },
      schedule: {
        dateStart,
        dateFinish,
        finishAlternate,
        clarifications, //уточнения
        interval,
        once,
        week,
        calendar
      }
    } = this.stores.actions.liquidForm

    this.liquid.set( id, _.extend(current, {
      name,
      group,
      specials,
      freq,
      freq_id,
      duration,
      duration_id,
      calc: {
        dosage,
        count,
        dosageUnit,
        dayCount,
        fullDosage,
        weightDosage,
        dayDosage,
        dayWeightDosage,
        durationCount,
        durationUnit,
        fullSpeed,
        weightSpeed,
        tintSpeed,
        liquidSpeed
      },
      schedule: {
        dateStart,
        dateFinish,
        finishAlternate,
        clarifications, //уточнения
        interval,
        once,
        week,
        calendar
      }
    } ) );
    // console.log(this.liquid.get(id));
  }

  recalcLiquidParams = (id=null) => {
    let {
      stores: {
        router: { values: route },
        dosages: { getToBase, getFromBase }
      }
		} = this
    id = id || (route && route.liquid || null)
    if(!id) return
    id = parseInt(id)

    let patientWeight = this.stores.actions.drugStructure.patient.weight
    let {
      dosage,
      count,
      dosageUnit,
      dayCount,
      durationCount,
      durationUnit
    } = this.stores.actions.liquidForm.calc
    //.reduce((a, b) => a + b)
    let fullDosage = _.map( dosage, (dos) => { return dos*count } )
    let weightDosage = _.map( fullDosage, (dos) => { return patientWeight ? ( dos/patientWeight ) : 0 } )
    let dayDosage = _.map( fullDosage, (dos) => { return dos*dayCount } )
    let dayWeightDosage = _.map( weightDosage, (dos) => { return patientWeight ? (dos*dayCount) : 0 } )
    let fullSpeed = _.map( fullDosage, (dos) => { return dos/durationCount } )
    let weightSpeed = _.map( fullSpeed, (dos) => { return patientWeight ? (dos/patientWeight) : 0 } )
    let tintSpeed = getToBase(168, getFromBase( 799, count ))/durationCount
    let liquidSpeed = count/durationCount

    this.stores.actions.liquidForm.calc = {
      dosage,
      count,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
      durationCount,
      durationUnit,
      fullSpeed,
      weightSpeed,
      tintSpeed,
      liquidSpeed
    }
    // console.log({
    //   dosage,
    //   count,
    //   dosageUnit,
    //   dayCount,
    //   fullDosage,
    //   weightDosage,
    //   dayDosage,
    //   dayWeightDosage,
    //   durationCount,
    //   durationUnit,
    //   fullSpeed,
    //   weightSpeed,
    //   tintSpeed,
    //   liquidSpeed
    // });
  }

  getLiquidParams = async (id=null) => {
    let {
      stores: {
        router: { values: route },
        dosages: { getToBase, getFromBase }
      }
		} = this
    id = id || (route && route.liquid || null)
    if(!id) return
    id = parseInt(id)

    let current = await this.liquid.get(id) || {};

    let flag = false //if dosages changed set true
    let {
      ready, weights, counts, weight, count: calcCount, unit
    } = this.calcLiquid

    let arr = []
    this.drug.forEach((drug, key) => {
      if(drug.group === id){
        arr.push(drug.key)
      }
    });

    if(current.calc.dosage && current.calc.dosage[0] === 0) flag = true
    if(weight.length != current.calc.dosage.length || calcCount != current.calc.count) flag = true
    if(!_.isEqual( _.keys(weights), arr )) flag = true
    if(!_.isEqual( weight, current.calc.dosage )) flag = true
    if(!ready) return

    //
    let {
      name,
      group,
      specials,
      freq,
      freq_id,
      duration,
      duration_id
    } = current
    // console.log('HERE 1');
    if(flag){

      let patientWeight = this.stores.actions.drugStructure.patient.weight
      let dosage = _.map( weight, (dos) => { return dos/calcCount } )
      // let fullDosage = weight
      //console.log({fullDosage});
      this.stores.actions.liquidForm = {
        name, // Название ДВ или ТН
        group, // группа раствора (0 - нет раствора, больше 0 - раствор)
        specials,
        freq,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosage: dosage,
          count: calcCount,
          dosageUnit: unit,
          dayCount: 1,
          fullDosage: weight,
          weightDosage: [0], //_.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          dayDosage: [0], // fullDosage,
          dayWeightDosage: [0], // _.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          durationCount: 1,
          durationUnit: '75',
          fullSpeed: [0], // fullDosage,
          weightSpeed: [0], // _.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          tintSpeed: 0, // getFromBase( 799, fullDosage ),
          liquidSpeed:  0, //calcCount
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
      setTimeout(this.recalcLiquidParams, 200)
      // console.log({
      //   dosage: weight,
      //   count: calcCount,
      //   dosageUnit: unit,
      //   dayCount: 1,
      //   fullDosage: fullDosage,
      //   weightDosage: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   dayDosage: fullDosage,
      //   dayWeightDosage: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   durationCount: 1,
      //   durationUnit: 75,
      //   fullSpeed: fullDosage,
      //   weightSpeed: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   tintSpeed: getFromBase( 799, fullDosage ),
      //   liquidSpeed: calcCount
      // });
    }else{
      // console.log('HERE 3');
      let {
        calc: {
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar
        }
      } = current
      this.stores.actions.liquidForm = {
        name, // Название ДВ или ТН
        group, // группа раствора (0 - нет раствора, больше 0 - раствор)
        specials,
        freq,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar
        }
      }
      if(this.stores.actions.drugStructure.patient.weight && parseFloat(this.stores.actions.drugStructure.patient.weight) > 0) this.recalcLiquidParams()
    }
    // this.liquid.set( group, _.extend(current, liquid) );

    return true
  }

  selectFromSearch = async (row, flag = false) => {
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
      freq_id: null,
      duration: null,
      duration_id: null,
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
        dosageUnit: '248',
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
        mnn: false,
        drugCache: null
      }
    }
    if(!row.calc) row.calc = drug.calc
    if(!row.dosage) row.dosage = drug.dosage
    if(!row.schedule) row.schedule = drug.schedule
    drug = _.extend(drug, row);
    // console.log(row.key);
    drug.key = (row.key && row.key.substring(0, 7) !== 'concept') ? row.key : moment().format('x').toString()
    let current = await this.drug.get(drug.key) || {};
    await this.drug.set( drug.key, _.extend(current, drug) );
    // console.log({current, drug});
    await this.stores.dosages.get(drug)

    if(!flag){
      await this.stores.db.clearData(false, true)
    }

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
