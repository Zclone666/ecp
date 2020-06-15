import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'

import _ from 'lodash';
// import { colors } from '../components/Charts/colorPallette'

class DB {
  @observable ready = false;
  @observable searchRows = [];
  @observable searchReady = true;

  @observable selectedRows = [];
  @observable warnings = {};
  @observable warnGroups = {};

  @observable currDrug = {};
  @observable drugDosage = {
    lf: {},
    druglf: {},
    methodstolf: {},
    names: {}
  };

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    // this.warnings = {
    //   data: observable.map({}, 'warnings'),
    //   ready: observable.box(false)
    // }

    autorun(() => {

    });

  }
  clearData(withSelects){
    this.stores.actions.selectedDrug = null
    this.stores.actions.selectedConflict = null
    this.stores.actions.activeConflicts = []
    this.stores.actions.activeDrugs = []
    this.searchRows = observable([])
    this.warnings = observable({});
    this.warnGroups = observable({});
    if(withSelects){
      this.selectedRows = observable([]);
    }
  }
//GetLF
  async getLF(drug){
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
        path: `GetLF`,
        data,
        success: async data => {
          console.log('DATA', data);
          let { alert, ...drug } = data
          _.assign(this.drugDosage, {...drug})
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
          console.log('DATA', data);

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
    let data = {
      // text,
      lib: '52, 62',
      service: "43",
      drugs: _.clone(this.selectedRows)
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
        path: `GetInfoPrep`,
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
  async getSearch(text){
    this.searchReady = false
    //let data = _.clone(this.stores.actions.filterTpl[filterName])
    let data = {
      text,
      lib: '62, 52',
      service: "43",
      chain: 0
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
        path: `SearchConcept`,
        data,
        success: async data => {
          // console.log('DATA', data);
          //
          // let oldArr = await _.clone(this.filters[filterName].rows)
          // let newArr = []
          if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {

            this.searchRows = observable([])
            this.searchRows = await _.unionWith(data.concepts, this.searchRows, (a, b) => a.id === b.id);
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

  async selectFromSearch(row){
    this.selectedRows = await _.unionWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.clearData()
    return true
  }
  async unselectDrug(row){
    this.selectedRows = await _.xorWith(this.selectedRows, [row], (a, b) => a.id === b.id);
    this.clearData()
    return true
  }

}
export default DB;
