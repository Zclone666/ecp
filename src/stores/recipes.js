import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Recipes {
  @observable ready = false;
  @observable code = null;

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.recipe = {
      data: observable.map({}, 'recipe'),
      ready: observable.box(true)
    }


    autorun(() => {

    });


  }
  save = async () => {
    if(this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis()

    this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    await this.stores.db.clearData(false, true)
    let data = await _.cloneDeep(this.stores.actions.drugStructure)
    let drugsFull = Array.from(this.stores.drugs.drug.values())
    let liquidsFull = Array.from(this.stores.drugs.liquid.values())
    drugsFull.forEach((drugFull, i) => {
      let { helpers, ...drug } = drugFull
      data.drugs.push(drug)
    });
    liquidsFull.forEach((liquidFull, i) => {
      let { helpers, ...liquid } = liquidFull
      if(liquid.group != 0){
        data.liquids.push(liquid)
      }
    });

    data.service = "43"
    data.active_language = active_language
    data.return_subjects = false
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
      path: 'tools/SaveRecipe', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async data => {
        if(data && data.Code){
          this.code = data.Code
          return data.Code
        }else{
          return false
        }
        this.stores.actions.loading = false
      },
      fail: (alerts) => {
        this.stores.actions.loading = false
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data)
      }
    });
  }
  print = async () => {
    if(this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis()

    // this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    // await this.stores.db.clearData(false, true)
    // let data = await _.clone(this.stores.actions.drugStructure)
    // data.drugs = await Array.from(this.stores.drugs.drug.values())
    let data = {}

    data.service = "43"
    data.active_language = active_language
    // data.return_subjects = false
    // data.authkey = this.stores.actions.authkey
    data.key = this.code
    return POST({
      path: 'tools/PrintRecipe', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async data => {
        // console.log(data);
        return data.code
      },
      fail: (alerts) => {
        this.stores.actions.loading = false
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data)
      }
    });
  }
  saveList = async () => {
    if(this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis()

    this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    await this.stores.db.clearData(false, true)
    let data = await _.cloneDeep(this.stores.actions.drugStructure)
    let drugsFull = Array.from(this.stores.drugs.drug.values())
    let liquidsFull = Array.from(this.stores.drugs.liquid.values())
    drugsFull.forEach((drugFull, i) => {
      let { helpers, ...drug } = drugFull
      data.drugs.push(drug)
    });
    liquidsFull.forEach((liquidFull, i) => {
      let { helpers, ...liquid } = liquidFull
      if(liquid.group != 0){
        data.liquids.push(liquid)
      }
    });

    data.service = "43"
    data.active_language = active_language
    data.return_subjects = false
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
      path: 'prescript/New', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async data => {
        this.stores.drugs.listChanged = false
        if(data.protocol){
          this.stores.actions.protocol = data.protocol
        }
        // if(data && data.Code){
        //   this.code = data.Code
        //   return data.Code
        // }else{
        //   return false
        // }
        this.stores.actions.makeAlerts({ alerts:[{
          title: "Сохранено.",
          message: "Протокол сохранен успешно. Теперь вы можете выписать рецепт.",
          level: "success",
          sticky: false
        }]})
        this.stores.actions.loading = false
        this.stores.router.push('/')
        // setTimeout(() => {
        //   this.stores.router.push('/recipe/new')
        // }, 700)
      },
      fail: (alerts) => {
        this.stores.actions.loading = false
        this.stores.router.push('/')
        setTimeout(() => {
          this.stores.router.push('/recipe/new')
        }, 700)
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data)

      }
    });
  }
  print = async () => {
    if(this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis()

    // this.stores.actions.loading = true
    let { active_language } = this.stores.actions
    // await this.stores.db.clearData(false, true)
    // let data = await _.clone(this.stores.actions.drugStructure)
    // data.drugs = await Array.from(this.stores.drugs.drug.values())
    let data = {}

    data.service = "43"
    data.active_language = active_language
    // data.return_subjects = false
    // data.authkey = this.stores.actions.authkey
    data.key = this.code
    return POST({
      path: 'tools/PrintRecipe', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async data => {
        // console.log(data);
        return data.code
      },
      fail: (alerts) => {
        this.stores.actions.loading = false
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data)
      }
    });
  }

}
export default Recipes;
