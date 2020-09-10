import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';

class Tools {
  @observable ready = false;

  @observable names = {}
  @observable shortnames = {}

  @observable units = {}
  @observable unittypes = {}
  @observable unitarrs = {}

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
          console.log(data);
          let { names, nameshort, units, unitrefs } = data
          await this.setNames(names, nameshort)
          this.setUnits(units, unitrefs)
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
          let { names, nameshort, units, unitrefs } = data
          //this.setNames(names, nameshort)
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


  setUnits(units, unitrefs){
    // _.keys(unitrefs).forEach( refkey => {
    //   this.unitarrs.push([ refkey, ...unitrefs[refkey] ])
    // })
    _.keys(units).forEach( unitkey => {
      let unit = units[unitkey]
      let newunit = {
        name: this.names[unitkey],
        shortname: this.shortnames[unitkey],
        baseunit,
        unitkey,
        type: 'simple',
        arr: null
      }
      if(unit.length < 1){
        newunit.type = 'base'
        if(unitrefs[unitkey]) this.unitarrs[unitkey] = [ unitkey, ...unitrefs[unitkey] ]
        newunit.arr = unitkey
      }else if(unit.length > 1){
        newunit.type = 'complex'
      }else{
        _.keys(unitrefs).forEach( refkey => {
          if(unitrefs[refkey].includes(unitkey)) newunit.arr = refkey
        })
      }
      this.units[unitkey] = newunit
    })
    console.log(this.units);
  }


  async setNames(names, shortnames){
    this.names = await _.extend(this.names, names)
    if(shortnames) this.shortnames = await _.extend(this.shortnames, shortnames)
  }

}
export default Tools;
