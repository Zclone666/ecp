import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';
// import { colors } from '../components/Charts/colorPallette'

const colorPallette = [
  '#007b2b',
  '#b0d512',
  '#03529b',
  '#fff42b',
  '#ffca2f',
  '#fc7301',
  '#f42a03',
]



class DB {
  @observable ready = false;
  @observable searchRows = [];

  @observable diseaseRows = [];
  @observable allergyRows = [];

  @observable searchReady = true;

  @observable selectedRows = [];
  //@observable warnings = {};
  @observable warnGroups = {};
  @observable warnIcons = {};
  warnInfo = {
    names: observable({}),
    description: observable({}),
    literature: observable({}),
    outcome: observable({})
  };

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

    this.warnings = {
      data: observable.map({}, 'warnings'),
      ready: observable.box(false)
    }

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
      this.warnings.data.clear();
      this.warnIcons = observable({});
      this.warnGroups = observable({});
    }

    if(withSelects){
      this.selectedRows = observable([]);
      this.diseaseRows = observable([]);
      this.allergyRows = observable([]);
      this.drugsDosages.data.clear()
      this.drugs.data.clear()
    }
  }
  getGroup(val){
    let color = '#cccccc'
    let group = 0
    switch (true) {
      case val === -1:
        color = colorPallette[0]
        group = 1
        break;
      case val === 0:
        color = colorPallette[1]
        group = 2
        break;
      case val > 0 && val <= 0.2:
        color = colorPallette[2]
        group = 3
        break;
      case val > 0.2 && val <= 0.4:
        color = colorPallette[3]
        group = 4
        break;
      case val > 0.4 && val <= 0.6:
        color = colorPallette[4]
        group = 5
        break;
      case val > 0.6 && val <= 0.8:
        color = colorPallette[5]
        group = 6
        break;
      case val > 0.8 && val <= 1:
        color = colorPallette[6]
        group = 7
        break;
      default:
        color = '#cccccc'
        group = 0
    }
    return { color, group }
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
    this.stores.actions.loading = true
    //this.searchReady = false
    //let data = _.clone(this.stores.actions.filterTpl[filterName])
    let data = _.clone(this.stores.actions.drugStructure)
    data.drugs = Array.from(this.drugs.data.values())
    //let data = {
      // text,
    //data.lib = '52, 62'
    data.service = "43"
    //data.drugs = drugs//_.clone(this.selectedRows)
    //}
    // data.text = text
    // authkey: "TGQLnQWwsdH79Ujybvn6uwZD"
    // chain: 0
    // key: "4vvqd9zcewdc2a"
    // lib: "66"
    // service: "43"
    // text: "ан"
    // data.key = '1f9b2da3f046b34b'
    data.return_subjects = false
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: 'check/Warnings', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
        data,
        success: async data => {
          //console.log('DATA', data);
          if( data && data.warnings && _.isArray(data.warnings) ){

            this.warnInfo.names = _.clone(data.names)
            this.warnInfo.description = _.clone(data.description)
            this.warnInfo.literature = _.clone(data.literature)
            this.warnInfo.outcome = _.clone(data.outcome)



            //let warnings = {}
            let warnGroups = {}
            let warnIcons = {}
            let warnForDrug = {}
            let warnForGroup = {}
            await data.warnings.forEach(( item, i ) => {

              // console.log('here 1');
              //if( item.drugsids && _.isArray(item.drugsids) ){
                // console.log('here 2');
                if(!item.id || item.id.length < 1) item.id = null //moment().format('x').toString()
                item.key = 'warnkey_' + i

                let { group, color } = this.getGroup(item.value)
                let wKey = `${item.type}_${group}`

                let current = this.warnings.data.get(item.id) || {};
                this.warnings.data.set( item.key, _.assignIn(current, { group, color, ...item }) );

                //разбивка по Драгам
                if(item.subjects && _.isArray(item.subjects)){
                  item.subjects.forEach(( subject, s ) => {

                    //создание варнингов по Драгам
                    if( !warnGroups[item.type] ){
                      warnGroups[item.type]={
                        type: item.type,
                        value: item.value,
                        valuecolor: color,
                        group
                      }
                    }else{
                      if(item.value > warnGroups[item.type].value){
                        warnGroups[item.type].value = item.value
                        warnGroups[item.type].valuecolor = color
                        warnGroups[item.type].group = group
                      }
                    }
                    if( subject.type === 'drug' ){


                      //иконки к Драгам
                      if( !warnIcons[subject.drugkey] || item.value > warnIcons[subject.drugkey].value ){
                        warnIcons[subject.drugkey] = {
                          value: item.value,
                          color,
                          group
                        }
                      }

                      //стрелки к Драгам
                      // if( !warnings[subject.drugkey] || item.value > warnings[subject.drugkey].value ){
                      //   warnings[subject.drugkey] = {
                      //     value: item.value,
                      //     color,
                      //     group
                      //   }
                      // }

                    }




                  })
                }

                //

                // warnGroups[item.group].valuecolor = _.maxBy(_.toArray(warnings[drug.id]), function(o){ return o.value; });
                // warnGroups[item.group].ids =  _.unionWith(warnGroups[item.group].ids, item.drugsids, (a, b) => a.id === b);
                //
                // item.drugsids.forEach(( drug, x ) => {
                //   // console.log('here 3');
                //   if( !warnings[drug] ){
                //     warnings[drug]={}
                //   }
                //   item.drugsids.forEach(( drugParent, y ) => {
                //     // console.log('here 4');
                //     if( drugParent !== drug ){
                //       // console.log('here 5');
                //       warnings[drug][drugParent] = {
                //         id: item.id,
                //         group: item.group,
                //         trust: item.trust,
                //         type: item.type,
                //         value: item.value,
                //         valuecolor: item.valuecolor
                //       }
                //     }
                //   })
                // })
              //}
            })
            // console.log('warnGroups', warnGroups);
            this.warnIcons = _.assignIn(this.warnIcons, warnIcons);
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
          this.stores.actions.loading = false
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
            await data.concepts.forEach(( concept, i ) => {
              data.concepts[i].key = 'concept'+i
              data.concepts[i].title = data.concepts[i].name
              data.concepts[i].main = saveTo === 'disease' ? true : false
            })
            this.diseaseRows = observable([])
            this.diseaseRows = await _.unionWith(data.concepts, this.diseaseRows, (a, b) => a.id === b.id);
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
    //console.log({ warnGroups: this.warnGroups });
    return true
  }
  async unselectDrug(row){
    this.drugs.data.delete(row.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.clearData(false, true)
    //console.log({ warnGroups: this.warnGroups });
    return true
  }


}
export default DB;
