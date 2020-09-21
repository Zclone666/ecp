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
  async request(){
    let data = {
      "security":{
        "key": this.stores.actions.privateKey,
        "authkey": this.stores.actions.authkey,
        "service": '108'
      },
      "id":null
    }

    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/PatientGet`,
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
  async save(){
    let data = {
      security: {
        key: this.stores.actions.privateKey,
        authkey: this.stores.actions.authkey,
        service: '108'
      },
      patient: {

      }
    }
    data.patient = _.assignIn({ ...this.stores.actions.drugStructure.patient }, { ...this.stores.actions.patientPassport });
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/PatientAdd`,
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

}
export default Patients;
