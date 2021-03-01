import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';

import { DrugScheme, LiquidScheme } from '../schemes';

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

  @observable deletedRows = [];
  @observable deletedLiquids = [];

  @observable searchReady = true;

  @observable listChanged = true;

  @observable selectedRows = [];

  @observable current = this.getNew();
  @observable currLiquid = this.getNewLiquid();

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.drug = observable.map({}, 'drug')
    this.liquid = observable.map({}, 'liquid')

    autorun(() => {
      // console.log(Array.from(this.liquid.values()));
    });
  }
  //drug
  setCurrent = async ({ drug, key }) => {
    await _.assignIn( this.current, DrugScheme )
    if(!drug && !!key) drug = await this.drug.get(key)
    _.assignIn( this.current, drug )
  }

  unsetCurrent = () => {
    _.assignIn( this.current, DrugScheme )
  }

  getCurrent = () => {
    return _.cloneDeep(this.current)
  }

  getClone = async ( key ) => {
    let drug = await this.drug.get(key)
    return _.cloneDeep(drug)
  }

  getNew = () => {
    return _.cloneDeep(DrugScheme)
  }

  // service functions
  async clearProto(){
    this.drug.forEach(( drugObj, key ) => {
      if(drugObj.proto){
        this.unselectDrug(key)
      }
    })
  }

  async MNNfromTN(drug){
    let { active_language } = this.stores.actions
    let data = {
      drug,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    let current = this.drug.get(drug.key)
    if(current.helpers.mnn){
      current = _.assignIn(current, current.helpers.drugCache)
      current.helpers.mnn = false
      current.helpers.drugCache = null
    }else{
      return POST({
          path: `drugs/MNNfromTN`,
          data,
          success: async data => {
            current = _.assignIn(current, data.mnn)
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
    currentDrug = await _.assignIn(currentDrug, { fpid });
    await this.drug.set( drugKey, currentDrug );
    this.stores.dosages.get(currentDrug, true)
  }

  setDosageParams = async () => {
    let drugData = this.stores.actions.stepsData
    let calcData = this.stores.actions.calculatorForm
    let scheduleData = this.stores.actions.scheduleForm
    let { router: { values } } = this.stores

    let drug = this.getCurrent()
    let currentDrug = this.drug.get(drug.key) || {};
    let currentDosages = this.stores.dosages.dosage.get(drug.id) || {};

    let { calcValues, getFromBase } = this.stores.dosages
    let def = (calcValues.dosage.firstUnit && calcValues.dosage.firstUnit.id ) || (calcValues.dosage.unit && calcValues.dosage.unit.id)

    let { freq, freq_id, duration, duration_id } = drug

    currentDrug.edit = true
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

    this.listChanged = true
    await this.stores.dosages.dosage.set( drug.key, currentDosages );
    this.stores.db.clearData()
  }

  getDosageParams = async () => {
    let drugData = this.stores.actions.stepsData

    let drug = this.current
    let currentDrug = await this.drug.get(drug.key) || {};
    let currentDosages = await this.stores.dosages.dosage.get(drug.id) || {};

    if(currentDosages.form){
      await _.forEach(currentDosages.form, ( item ) => {
        if(item.solute) {
          currentDosages.solute = true
          currentDrug.solute = true
        }
      })
    }

    let { freq, freq_id, duration, duration_id } = drug

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
      dateStart: dateStart || moment(moment().format('DD.MM.YYYY'), 'DD.MM.YYYY').format('x'),
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar
    }
    this.stores.actions.drugStructure.specials = specials
    this.listChanged = true
  }

  // liquids and groups
  getNewLiquid = () => {
    return _.cloneDeep(LiquidScheme)
  }

  setCurrentLiquid = async ({ liquid, key }) => {
    await _.assignIn( this.currLiquid, LiquidScheme )
    if(!liquid && !!key) liquid = await this.liquid.get(key)
    _.assignIn( this.currLiquid, liquid )
  }

  getCurrentLiquid = () => {
    return _.cloneDeep(this.currLiquid)
  }

  getCloneLiquid = async ( key ) => {
    let liquid = await this.liquid.get(key)
    return _.cloneDeep(liquid)
  }

  unsetCurrentLiquid = () => {
    _.assignIn( this.currLiquid, LiquidScheme )
  }

  async setGroup(keys, group){
    if(!_.isArray(keys)) {
      keys = [keys]
    }

    let currGroup = null
    await keys.forEach(async (key, i) => {
      let drug = await this.drug.get(key)
      currGroup = drug.group

      drug.group = group
      drug.edit = true

      this.drug.set(key, drug)
    })

    await this.drug.forEach(async (drug, key) => {
      if(drug.group == group && group !== 0){
        drug.edit = true
      }
      if(drug.group == currGroup && group == 0){
        drug.edit = true
      }
    })

    let currLiquid = await this.liquid.get( currGroup ) || {}

    if(currLiquid.key){
      currLiquid.edit = true
      // await this.liquid.set( currGroup, currLiquid )
    }

    if( group == 0 ){
      if(currLiquid.proto){
        this.deletedLiquids.push(currLiquid)
      }
      this.liquid.delete( currGroup )
    }

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

  get checkLiquids(){
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
    return isOk
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
          if(drug.dosage && drug.dosage.pack && drug.dosage.pack.dosage){
            if(dryUnits.includes(drug.dosage.pack.dosage.id_1)){

            }else if(liquidUnits.includes(drug.dosage.pack.dosage.id_1)){
              counts[drug.key] = {
                count: drug.calc.count,
                unit: drug.dosage.pack.dosage.id_1
              }
              count+=drug.calc.count
              liqUnit = liqUnit || drug.dosage.pack.dosage.id_1
            }
          }


        }else{
          ready = false
        }
			}
		})
    // console.log({
    //   weight, count, weights, counts, ready, unit, liqUnit, liquidUnits, dryUnits, id
		// });
    // this.listChanged = true
		return {
      weight, count, weights, counts, ready, unit, liqUnit, liquidUnits, dryUnits, id
		}
  }

  removeLiquids = async (arr) => {
    if(!arr) return
    if(!Array.isArray(arr)) arr = [arr]
    arr.forEach((item, i) => {
      let currLiquid = this.liquid.get( item ) || {}
      if(currLiquid.proto){
        this.deletedLiquids.push(currLiquid)
      }
      this.liquid.delete( item );
    });
    this.listChanged = true
  }

  makeLiquids = async () => {
    let arr = []
    this.drug.forEach((drug, key) => {
      if(arr.indexOf(drug.group) === -1 && drug.group != 0){
        arr.push(drug.group)
      }
    });
    arr.forEach((item, i) => {
      this.makeLiquid(item)
    });
    this.listChanged = true
  }

  makeLiquid = async (item) => {
    let current = this.liquid.get(item) || {};

    current.edit = true
    if( current.group && current.group !== 0 ) return
    current.group = item

    let liquid = this.getNewLiquid()
    await this.liquid.set( item, _.assignIn(liquid, current) );
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
      edit,
      freq_id,
      duration,
      duration_id,
      calc: {
        dosageBaseUnit,
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

    edit = true
    current.edit = true

    this.liquid.set( id, _.assignIn(current, {
      name,
      group,
      specials,
      freq,
      edit,
      freq_id,
      duration,
      duration_id,
      calc: {
        dosageBaseUnit,
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
    this.listChanged = true
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
    this.listChanged = true
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
          dosageBaseUnit: '248',
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
          dosageBaseUnit,
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
          dosageBaseUnit,
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
    // this.liquid.set( group, _.assignIn(current, liquid) );
    this.listChanged = true
    return true
  }

  // search, creae and remove drugs
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
          }else if(data.concepts && data.concepts.length == 0 && _.isArray(data.concepts)){
            this[`${saveTo}Rows`] = observable([])
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

  // concept from search, flag - if true, do not clear data
  selectFromSearch = async (concept, flag = false, getDosages = true) => {

    let drug = this.getNew()
    if(!concept.calc) concept.calc = drug.calc
    if(!concept.dosage) concept.dosage = drug.dosage
    if(!concept.schedule) concept.schedule = drug.schedule
    drug = _.assignIn(drug, concept);

    drug.key = (concept.key && concept.key.substring(0, 7) !== 'concept') ? concept.key : moment().format('x').toString()

    await this.drug.set( drug.key, drug );

    // _.assignIn(this.current, drug);

    if(getDosages){
      await this.stores.dosages.get(drug)
    }

    if(!flag){
      await this.stores.db.clearData(false, true)
    }
    this.listChanged = true
    return true
  }

  async unselectDrug(drug){
    if(drug.proto){
      this.deletedRows.push(drug)
    }
    await this.drug.delete(drug.key)
    // await this.stores.dosages.dosage.delete(drug.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [drug], (a, b) => a.id === b.id);
    this.stores.db.clearData(false, true)
    this.checkLiquidsOk()
    this.listChanged = true
    return true
  }

}
export default Drugs;
