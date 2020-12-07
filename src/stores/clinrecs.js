import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Clinrecs {
  @observable ready = false;
  @observable checker = {};

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;


    this.clinrec = {
      data: observable.map({}, 'clinrec'),
      ready: observable.box(true)
    }


    autorun(() => {

    });


  }
  async check(flag = false){
    this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    this.stores.db.clearData(false, true)
    let data = _.cloneDeep(this.stores.actions.drugStructure)
    let drugsFull = Array.from(this.stores.drugs.drug.values())
    let liquidsFull = Array.from(this.stores.drugs.liquid.values())
    drugsFull.forEach((drugFull, i) => {
      let { helpers, ...drug } = drugFull
      data.drugs.push(drug)
    });
    liquidsFull.forEach((liquidFull, i) => {
      let { helpers, ...liquid } = liquidFull
      data.liquids.push(liquid)
    });

    if(flag){
      data.checker = _.cloneDeep(this.stores.actions.clinrecCheckerData)
    }

    data.active_language = active_language

    data.return_subjects = false
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: 'tools/clinicalGuidelines',
        data,
        success: async data => {
          if(flag){
            console.log('DATA', data);
          }else{
            let pages = {}
            if(data && data.checker){
              this.stores.actions.clinrecCheckerData = _.assignIn(this.stores.actions.clinrecCheckerData, data.checker )
              _.keys(data.checker).forEach((id, i) => {
                let question = data.checker[id]
                if(pages[question.page]){
                  pages[question.page].arr.push({
                    id,
                    name: data.names[id],
                    type: question.type,
                    unitid: question.unitid,
                    value: question.value
                  })
                }else{
                  pages[question.page] = {
                    name: data.names[question.page],
                    arr: [{
                      id,
                      name: data.names[id],
                      type: question.type,
                      unitid: question.unitid,
                      value: question.value
                    }]
                  }
                }
              });

            }
            this.checker = _.assignIn(this.checker, pages )
          }
          // console.log('DATA', data);

          this.stores.actions.loading = false
        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }

}
export default Clinrecs;
