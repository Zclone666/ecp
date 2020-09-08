import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Patients {
  @observable ready = false;

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.patient = {
      data: observable.map({}, 'patient'),
      ready: observable.box(true)
    }


    autorun(() => {

    });


  }



}
export default Patients;
