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
  clearData(){
    this.filters = observable({})
    this.tables = observable({})
    this.charts = observable({})
    this.tabs = observable({})
    this.tabsCount = 0
    this.maintab = null
    this.stores.actions.clearFilters()
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
            data.warnings.forEach(( item, i ) => {
              // console.log('here 1');
              if( item.drugsids && _.isArray(item.drugsids) ){
                // console.log('here 2');
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
            this.warnings = _.assignIn(this.warnings, warnings);
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
      lib: '52, 62',
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
  // @action updateModel(name, item, key, arr){
  //   //console.log('Update '+name);
  //   //Meteor.setTimeout(() => {
  //     let { _id } = item
  //     if(item.deleted){
  //       this[name].data.delete(_id);
  //     }else{
  //       let current = this[name].data.get(_id) || {};
  //       this[name].data.set(_id, _.extend(current, item));
  //     }
  //     if(arr.count() == (key+1) && arr.count() > 0) {this[name].ready.set(true)}
  //   //}, 0)
  //
  // }

}
export default DB;
