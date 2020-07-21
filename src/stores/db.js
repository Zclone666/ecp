import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';
// import { colors } from '../components/Charts/colorPallette'

class DB {
  @observable ready = false;
  @observable searchRows = [];

  @observable diseaseRows = [];
  @observable disease2Rows = [];
  @observable allergyRows = [];

  @observable searchReady = true;

  @observable selectedRows = [];
  @observable warnings = {};
  @observable warnGroups = {};

  @observable currDrug = {};
  @observable drugDosage = {
    drug: {},
    form: {},
    methodform: {},
    names: {}
  };

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.drugs = {
      data: observable.map({}, 'drugs'),
      ready: observable.box(true)
    }

    this.drugsDosages = {
      data: observable.map({}, 'drugsDosages'),
      ready: observable.box(true)
    }

    // this.warnings = {
    //   data: observable.map({}, 'warnings'),
    //   ready: observable.box(false)
    // }

    autorun(() => {

    });

  }
  clearData(withSelects, withWarnings){
    this.stores.actions.selectedDrug = null
    this.stores.actions.selectedConflict = null
    this.stores.actions.activeConflicts = []
    this.stores.actions.activeDrugs = []
    this.stores.actions.stepsData = {
      key: null,
      way: null,
      step: null,
      form: null,
      method: null,
      pack: {},
      dosage: {},
    }
    this.searchRows = observable([])

    if(withWarnings){
      this.warnings = observable({});
      this.warnGroups = observable({});
    }

    if(withSelects){
      this.selectedRows = observable([]);
      this.diseaseRows = observable([]);
      this.disease2Rows = observable([]);
      this.allergyRows = observable([]);
      this.drugsDosages.data.clear()
      this.drugs.data.clear()
    }
  }
//GetLF
  async getLF(drug_obj){
    //this.searchReady = false
    //let data = _.clone(this.stores.actions.filterTpl[filterName])
    let data = {
      // text,
      lib: '52, 62',
      service: "43",
      drug: drug_obj
    }
    // data.text = text
    // authkey: "TGQLnQWwsdH79Ujybvn6uwZD"
    // chain: 0
    // key: "4vvqd9zcewdc2a"
    // lib: "66"
    // service: "43"
    // text: "ан"
    // data.key = '1f9b2da3f046b34b'
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `drugs/Dosages`,
        data,
        success: async data => {
          //console.log('DATA', data);
          let { drug, form, methodform, names } = data
          let current = this.drugsDosages.data.get(drug.key) || {};
          this.drugsDosages.data.set( drug.key, _.extend(current, { drug, form, methodform, names, url: '/concept/dozes/' }) );

          // let { alert, ...drug } = data
          // _.assign(this.drugDosage, {...drug})
        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }

  async GetDuration(drug){
    //this.searchReady = false
    //let data = _.clone(this.stores.actions.filterTpl[filterName])
    let data = {
      // text,
      lib: '52, 62',
      service: "43",
      drugs: [ drug ]
    }
    // data.text = text
    // authkey: "TGQLnQWwsdH79Ujybvn6uwZD"
    // chain: 0
    // key: "4vvqd9zcewdc2a"
    // lib: "66"
    // service: "43"
    // text: "ан"
    // data.key = '1f9b2da3f046b34b'
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `GetDuration`,
        data,
        success: async data => {
          //i`1console.log('DATA', data);

        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }
  async getInfoPrep(){
    //this.searchReady = false
    //let data = _.clone(this.stores.actions.filterTpl[filterName])
    let data = _.clone(this.stores.actions.drugStructure)
    data.drugs = Array.from(this.drugs.data.values())
    //let data = {
      // text,
    data.lib = '52, 62',
    data.service = "43",
    data.drugs = drugs//_.clone(this.selectedRows)
    //}
    // data.text = text
    // authkey: "TGQLnQWwsdH79Ujybvn6uwZD"
    // chain: 0
    // key: "4vvqd9zcewdc2a"
    // lib: "66"
    // service: "43"
    // text: "ан"
    // data.key = '1f9b2da3f046b34b'
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: 'check/Warnings', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
        data,
        success: async data => {
          //console.log('DATA', data);
          if( data && data.warnings && _.isArray(data.warnings) ){
            let warnings = {}
            let warnGroups = {}
            data.warnings.forEach(( item, i ) => {
              // console.log('here 1');
              if( item.drugsids && _.isArray(item.drugsids) ){
                // console.log('here 2');

                if( !warnGroups[item.group] ){
                  warnGroups[item.group]={
                    type: item.type,
                    value: item.value,
                    valuecolor: item.valuecolor,
                    ids: []
                  }
                }
                // warnGroups[item.group].valuecolor = _.maxBy(_.toArray(warnings[drug.id]), function(o){ return o.value; });
                warnGroups[item.group].ids =  _.unionWith(warnGroups[item.group].ids, item.drugsids, (a, b) => a.id === b);

                item.drugsids.forEach(( drug, x ) => {
                  // console.log('here 3');
                  if( !warnings[drug] ){
                    warnings[drug]={}
                  }
                  item.drugsids.forEach(( drugParent, y ) => {
                    // console.log('here 4');
                    if( drugParent !== drug ){
                      // console.log('here 5');
                      warnings[drug][drugParent] = {
                        id: item.id,
                        group: item.group,
                        trust: item.trust,
                        type: item.type,
                        value: item.value,
                        valuecolor: item.valuecolor
                      }
                    }
                  })
                })
              }
            })
            // console.log('warnGroups', warnGroups);
            this.warnings = _.assignIn(this.warnings, warnings);
            this.warnGroups = _.assignIn(this.warnGroups, warnGroups);
          }

          //
          // let oldArr = await _.clone(this.filters[filterName].rows)
          // let newArr = []
          // if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
          //
          //
          //   this.searchRows = await _.unionWith(data.concepts, this.searchRows, (a, b) => a.id === b.id);
          //   this.searchReady = true
          // }
        },
        fail: (alerts) => {
            //this.searchReady = true
          // console.log('fail', alerts);
        },
        always: (data) => {
          // this.stores.actions.makeAlerts(data)
        }
    });
  }
  async getSearch(text, saveTo='search'){
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

  async getSearchDisease(text, saveTo){
    this.searchReady = false
    let data = {
      text,
      lib: '61, 25',
      service: "43",
      chain: 0
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `search/Diseases`,
        data,
        success: async data => {
          if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
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
  async getSearchAllergy(text, saveTo){
    this.searchReady = false
    let data = {
      text,
      lib: '61, 25',
      service: "43",
      chain: 0
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `search/Allergy`,
        data,
        success: async data => {
          if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
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

    let drug = this.currDrug
    let currentDrug = await this.drugs.data.get(drug.key) || {};
    let currentDosages = await this.drugsDosages.data.get(drug.key) || {};

    let { form, method, pack, dosage } = drugData

    currentDrug.dosage = { form, method, pack, dosage }

    await this.drugs.data.set( drug.key, currentDrug );

    await this.drugsDosages.data.set( drug.key, _.extend(currentDosages, { url }) );
    this.clearData()
  }
  getDosageParams = async (url) => {
    let drugData = this.stores.actions.stepsData

    let drug = this.currDrug
    let currentDrug = await this.drugs.data.get(drug.key) || {};
    let currentDosages = await this.drugsDosages.data.get(drug.key) || {};

    let { form, method, pack, dosage } = drugData

    currentDrug.dosage = { form, method, pack, dosage }

    await this.drugs.data.set( drug.key, currentDrug );

    await this.drugsDosages.data.set( drug.key, _.extend(currentDosages, { url }) );
    this.clearData()
  }

  selectFromSearch = async (row) => {
    let drug = {
      //key: moment().format('x').toString(), // уникальный ключ
      id:"", // айди ДВ или ТН
      name: "", // Название ДВ или ТН
      level: 0, //
      tn: false, // ДВ или ТН
      fp_id: "", //
      group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
      dosage: { // дозировка
        // way: null,
        // step: null,
        form: null,
        method: null,
        pack: {},
        dosage: {},

        //unstructured: "",
        // form: {
        //   id: "",
        //   name: "",
        //   parent: {
        //     key: "",
        //     val: ""
        //   },
        //   val: "",
        //   unit: "",
        //   valunit: ""
        // },
        // method: {
        //   id: "",
        //   name: ""
        // },
        // val: "",
        // unit: "",
        // unit_id: "",
        // unit_type: "",
        // count: "",
        // freq: {
        //   id: "",
        //   name: "",
        //   val: ""
        // },
        // duration: {
        //   id: "",
        //   name: "",
        //   val: "",
        //   calendar: [{
        //     data1: "",
        //     data2: ""
        //   }]
        // },
        // special: "",
        // spec: ""
      },
      // data1: "",
      // data2: ""
    }
    drug = _.assignIn(drug, row);
    // let drugFull = {
    //   drug,
    //   stepsData:{
    //     way: null,
    //     step: null,
    //   },
    //   url: '/concept/dozes/'
    // }
    drug.key = moment().format('x').toString()
    let current = this.drugs.data.get(drug.key) || {};
    this.drugs.data.set( drug.key, _.extend(current, drug) );
    // console.log('dasf', this.drugs.data.get(drug.key));

    this.getLF(drug)

    // this.selectedRows = await _.unionWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.clearData(false, true)
    return true
  }
  async unselectDrug(row){
    this.drugs.data.delete(row.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.clearData(false, true)
    return true
  }


}
export default DB;
