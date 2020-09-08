import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Diseases {
  @observable ready = false;

  @observable diseaseRows = [];
  @observable allergyRows = [];

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.disease = {
      data: observable.map({}, 'disease'),
      ready: observable.box(true)
    }


    autorun(() => {

    });


  }



}
export default Diseases;
