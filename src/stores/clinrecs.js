import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Clinrecs {
  @observable ready = false;
  @observable checker = {};
  @observable clinrec = {};
  @observable names = {};
  @observable shortnames = {};

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;


    // this.clinrec = {
    //   data: observable.map({}, 'clinrec'),
    //   ready: observable.box(true)
    // }


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
            // console.log('DATA', data);
            this.clinrec = _.assignIn(this.clinrec, data.ClinRec )
            this.names = _.assignIn(this.names, data.names )
            this.shortnames = _.assignIn(this.shortnames, data.shortnames )
            this.stores.actions.clinrecCheckerData = _.assignIn(this.stores.actions.clinrecCheckerData, data.checker )
          }else{
            let pages = {}
            if(data && data.checker){
              this.stores.actions.clinrecCheckerData = _.assignIn(this.stores.actions.clinrecCheckerData, data.checker )
              _.keys(data.checker).forEach((id, i) => {
                let question = data.checker[id]
                this.stores.actions.clinrecCheckerData[id].value = question.type === 'Binary' ? question.value || 0 : question.value
                if(pages[question.page]){
                  pages[question.page].arr.push({
                    id,
                    name: data.names[id],
                    type: question.type,
                    unit: question.unitid ? (data.shortnames[question.unitid] || data.names[question.unitid] || null) : null,
                    unitid: question.unitid,
                    value: question.value
                  })
                }else{
                  pages[question.page] = {
                    name: data.names[question.page],
                    isReady: true,
                    arr: [{
                      id,
                      name: data.names[id],
                      type: question.type,
                      unit: question.unitid ? (data.shortnames[question.unitid] || data.names[question.unitid] || null) : null,
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
  async getByFG(child){
    this.ready = false
    this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    let data = {
      drug: child.concept,
      active_language
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: 'Drugs/ByFG',
        data,
        success: async data => {
          // console.log('DATA', data);
          let fakeId = moment().format('x').toString()
          if(data.concepts && data.concepts.length){
            this.clinrec[fakeId] = {
              check: false,
              childs: [],
              comment: "",
              concept: null,
              dosage: [],
              drug: null,
              efficiency: null,
              form: [],
              intervalpreset: [],
              method: [],
              name: "группировка признаков с условием - ИЛИ",
              parents: child.id,
              schedulepreset: [],
              trust: child.trust,
              type: "OR",
              warning: child.warning,
            }
            // console.log({
            //   'child.id': child,
            //   'this.clinrec[child.id]': this.clinrec[child.id]
            // });
            this.clinrec[child.id].childs = [fakeId]
            data.concepts.forEach((item, i) => {
              this.clinrec[item.id] = {
                check: false,
                childs: [],
                comment: "",
                concept: item,
                dosage: [],
                drug: item,
                efficiency: null,
                form: [],
                intervalpreset: [],
                method: [],
                name: item.name,
                parents: child.id,
                schedulepreset: [],
                trust: child.trust,
                type: "Drug",
                warning: child.warning
              }
              this.clinrec[fakeId].childs.push(item.id)
            });

          }

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
