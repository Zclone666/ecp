import { observable, action, autorun, computed, makeObservable } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Diseases {
  ready = false;
  searchReady = false;

  diseaseRows = [];
  allergyRows = [];

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      searchReady: observable,
      diseaseRows: observable,
      allergyRows: observable
    });

    this.stores = stores;
    this.router = stores.router;

    this.disease = {
      data: observable.map({}, 'disease'),
      ready: observable.box(true)
    }


    autorun(() => {

    });
  }
  async getSearchDisease(text, saveTo){
    this.searchReady = false
    let { active_language } = this.stores.actions
    let data = {
      text,
      lib: '61, 25',
      service: "43",
      chain: 0,
      active_language
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
    let { active_language } = this.stores.actions
    let data = {
      text,
      lib: '61, 25',
      service: "43",
      chain: 0,
      active_language
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


}
export default Diseases;
