import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class DrugInfo {
  @observable ready = false;

  @observable current = { //drugDosage
    drug: {},
    form: {},
    methodform: {},
    names: {},
    nameshort: {},
    units: {}
  }

  @observable names = {}

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.info = observable.map({}, 'analog')

    autorun(() => {

    });


  }

  //getLF
  async get(drug_obj){
    this.ready = false
    this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    // let currentDosages = await this.dosage.get(drug_obj.key);
    // if(currentDosages) {
    //   await this.stores.drugs.getDosageParams()
    //   return
    // }
    let data = {
      drug: drug_obj,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `drugs/Info`,
        data,
        success: async data => {
          // console.log('DATA', data);
          let { items } = data

          // this.names = await _.extend(this.names, names)

          let current = await this.info.get(drug_obj.key) || {};
          
          let info = {
            key: drug_obj.key,
            id: drug_obj.id,
            items
          }

          await this.info.set( drug_obj.key, _.extend(current, info) );


          // await tn.forEach(( analogObj ) => {
          //   let analog = {
          //     id: analogObj.drug.id,
          //     drug: analogObj.drug,
          //     name: analogObj.drug.name,
          //     arr: [],
          //     min: null,
          //     max: null
          //   }
          //   analogObj.fp && _.forEach(analogObj.fp, ( item, id ) => {
          //     if( item.pricemin && item.pricemin > analog.min ) analog.min =item.pricemin
          //     if( item.pricemax && item.pricemax > analog.max ) analog.max =item.pricemax
          //     analog.arr.push({
          //       id: id,
          //       name: names[id],
          //       min: item.pricemin,
          //       max: item.pricemax
          //     })
          //   })
          //   analogs.arr.push(analog)
          // })
          // await this.analog.set( drug_obj.key, _.extend(current, analogs) );
          this.ready = true
          this.stores.actions.loading = false
          // this.stores.tools.setNames(names, nameshort)
          // let current = this.dosage.get(drug.key) || {};
          // this.dosage.set( drug.key, _.extend(current, { drug, form, methodform, names, nameshort, units, url: '/concept/dozes/' }) );
          // if(units && units.length > 0) this.stores.tools.getUnitsPharm(units)
        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }


}
export default DrugInfo;
