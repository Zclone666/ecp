import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';

const colorPallette = [
  '#007b2b',
  '#b0d512',
  '#54C8FF',
  '#fff42b',
  '#ffca2f',
  '#fc7301',
  '#f42a03',
  '#6435C9',
  '#A333C8'
]

class Warnings {
  @observable ready = false;
  @observable groups = {};
  @observable icons = {};
  info = {
    names: observable({}),
    description: observable({}),
    literature: observable({}),
    outcome: observable({}),
    urls: observable({}),
    hinttype: observable({})
  };

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.warning = observable.map({}, 'warning')

    autorun(() => {

    });


  }
  getGroup(val){
    let color = '#cccccc'
    let group = 0
    switch (true) {
      case val === 2:
        color = colorPallette[8]
        group = 0
        break;
      case val === 3:
        color = colorPallette[7]
        group = 0
        break;
      case val === -1:
        color = colorPallette[0]
        group = 1
        break;
      case val === 0:
        color = colorPallette[1]
        group = 2
        break;
      case val > 0 && val <= 0.17:
        color = colorPallette[2]
        group = 3
        break;
      // case val > 0.2 && val <= 0.4:
      //   color = colorPallette[3]
      //   group = 4
      //   break;
      case val > 0.17 && val <= 0.5:
        color = colorPallette[4]
        group = 5
        break;
      case val > 0.5 && val <= 0.75:
        color = colorPallette[5]
        group = 6
        break;
      case val > 0.75 && val <= 1:
        color = colorPallette[6]
        group = 7
        break;
      default:
        color = '#cccccc'
        group = 0
    }
    return { color, group }
  }
  //getInfoPrep
  async check(){
    this.stores.actions.loading = true
    this.stores.db.clearData(false, true)
    let data = _.clone(this.stores.actions.drugStructure)
    data.drugs = Array.from(this.stores.drugs.drug.values())

    data.service = "43"

    data.return_subjects = false
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: 'check/Warnings', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
        data,
        success: async data => {
          //console.log('DATA', data);
          if( data && data.warnings && _.isArray(data.warnings) ){

            this.info.names = _.clone(data.names)
            this.info.description = _.clone(data.description)
            this.info.literature = _.clone(data.literature)
            this.info.outcome = _.clone(data.outcome)
            this.info.urls = _.clone(data.urls)
            this.info.hinttype = _.clone(data.hinttype)

            let warnGroups = {}
            let warnIcons = {}
            let warnForDrug = {}
            let warnForGroup = {}
            await data.warnings.forEach(( item, i ) => {

              if(!item.id || item.id.length < 1) item.id = null //moment().format('x').toString()
              item.key = 'warnkey_' + i

              let { group, color } = this.getGroup(item.value)
              let wKey = `${item.type}_${group}`

              let current = this.warning.get(item.id) || {};
              this.warning.set( item.key, _.assignIn(current, { group, color, ...item }) );

              let hint = data.hinttype[item.type] && data.names[data.hinttype[item.type]]

              //разбивка по Драгам
              if(item.subjects && _.isArray(item.subjects)){
                item.subjects.forEach(( subject, s ) => {

                  //создание варнингов по Драгам
                  if( !warnGroups[item.type] ){
                    warnGroups[item.type]={
                      type: item.type,
                      value: item.value,
                      valuecolor: color,
                      group,
                      hint
                    }
                  }else{
                    if(group > warnGroups[item.type].group){
                      warnGroups[item.type].value = item.value
                      warnGroups[item.type].valuecolor = color
                      warnGroups[item.type].group = group
                    }
                  }
                  if( subject.type === 'drug' ){


                    //иконки к Драгам
                    if( !warnIcons[subject.drugkey] || group > warnIcons[subject.drugkey].group ){
                      warnIcons[subject.drugkey] = {
                        value: item.value,
                        color,
                        group
                      }
                    }
                  }
                })
              }
            })

            this.icons = _.assignIn(this.warnIcons, warnIcons);
            this.groups = _.assignIn(this.groups, warnGroups);
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
export default Warnings;
