import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Recipes {
  @observable ready = false;

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
    // this.stores.actions.loading = true
    await this.stores.db.clearData(false, true)
    let data = await _.clone(this.stores.actions.drugStructure)
    data.drugs = await Array.from(this.stores.drugs.drug.values())

    data.service = "43"

    data.return_subjects = false
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: 'tools/SaveRecipe', //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
        data,
        success: async data => {
          return true
        },
        fail: (alerts) => {

        },
        always: (data) => {
          this.stores.actions.makeAlerts(data)
        }
    });
  }


}
export default Recipes;
