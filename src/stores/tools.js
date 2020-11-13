import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';

class Tools {
  @observable ready = false;

  @observable names = {}
  @observable shortnames = {}

  @observable units = {}
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

  async getUnitsPharm(units){
    units = units || []
    let { active_language } = this.stores.actions
    let data = {
      units,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/UnitsPharm`,
        data,
        success: async data => {
          // console.log(data);
          let { names, nameshort, units, unitrefs, unitpharm } = data


          // kostyl
          if(units[250]){
            names[99] = 'процент'
            nameshort[99] = '%'
            unitpharm.push(99)
            units[99]=_.cloneDeep(units[250])
            units[99][0].value = 10
          }


          // end kostyl

          await this.setNames(names, nameshort)
          this.setUnits(units, unitrefs, unitpharm)
        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }
  async getUnitsPrimary(){
    let { active_language } = this.stores.actions
    let data = {
      active_language
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
    let { active_language } = this.stores.actions
    let data = {
      units: units,
      active_language
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

  async getUnitsSchedule(){
    let { active_language } = this.stores.actions
    let data = {
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
      path: `info/Schedule`,
      data,
      success: async data => {
        // console.log('DATA', data);

      },
      fail: (alerts) => {

      },
      always: (data) => {

      }
    });
  }

  setUnits = (units, unitrefs, unitpharm) => {
    // _.keys(unitrefs).forEach( refkey => {
    //   this.unitarrs.push([ refkey, ...unitrefs[refkey] ])
    // })
    // console.log({ unitpharm });
    _.keys(units).forEach( unitkey => {
      let unit = units[unitkey]
      let newunit = {
        name: this.names[unitkey],
        shortname: this.shortnames[unitkey],
        contains: unit,
        id: unitkey,
        type: 'simple',
        arr: null,
        show: unitpharm.includes(unitkey) || false
      }
      if(unitrefs[unitkey]) this.unitarrs[unitkey] = (newunit.show ? [ unitkey, ...unitrefs[unitkey] ] : unitrefs[unitkey])
      if(unit.length < 1){
        newunit.type = 'base'

        newunit.arr = unitkey
      }else if(unit.length > 1){
        newunit.type = 'complex'
        _.keys(unitrefs).forEach( refkey => {
          if(unitrefs[refkey].includes(unitkey)) newunit.arr = refkey
        })
      }else{
        _.keys(unitrefs).forEach( refkey => {
          if(unitrefs[refkey].includes(unitkey)) newunit.arr = refkey
        })
      }

      if(unitrefs[unitkey]){
        this.unitarrs[unitkey] = (newunit.show ? [ unitkey, ...unitrefs[unitkey] ] : unitrefs[unitkey])
      }
      //if(unitkey === '42') console.log(this.unitarrs[unitkey]);
      this.units[unitkey] = newunit
    })
    //console.log(this.units);
  }

  getUnitArr = (unitId) => {
    let result = {}
    // console.log({unitId});
    // console.log('unitarrs', this.unitarrs);
    // console.log(this.units[unitId]);
    if(this.units[unitId] && this.units[unitId].arr && this.unitarrs[this.units[unitId].arr]){
      //console.log('here', this.unitarrs[this.units[unitId].arr]);
      this.unitarrs[this.units[unitId].arr].forEach( arrKey => {
        //console.log(arrKey, this.units[arrKey], this.units);
        if(this.units[unitId].type === this.units[arrKey].type || this.units[arrKey].type === 'base'){
          result[arrKey] = this.units[arrKey]
        }
      })
    }
    // console.log(result);
    return result
  }


  async setNames(names, shortnames){
    this.names = await _.extend(this.names, names)
    if(shortnames) this.shortnames = await _.extend(this.shortnames, shortnames)
  }

  round = ( val, dec = 3 ) => {
    let delimiter = Math.pow(10,dec)
    return Math.floor(val * delimiter) / delimiter
  }

}
export default Tools;
