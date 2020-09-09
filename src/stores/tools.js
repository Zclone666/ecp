import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';

class Tools {
  @observable ready = false;

  @observable unitsPharm = {};
  @observable unitsPrimary = {};
  @observable unitsComplex = {};

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;


    autorun(() => {

    });



  }

  async getUnitsPharm(){
    let data = {

    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/UnitsPharm`,
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
  async getUnitsPrimary(){
    let data = {

    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/UnitsPrimary`,
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
  async getUnitsComplex(units){
    let data = {
      units: units
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/UnitsComplex`,
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

}
export default Tools;
