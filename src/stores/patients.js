import { observable, action, autorun, computed } from 'mobx';
import { GET, POST, PUT } from '../lib/connect'
import moment from 'moment'

import _ from 'lodash';


class Patients {
  @observable ready = false;
  @observable searchRows = [];

  @observable searchReady = true;

  @observable selectedRows = [];

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.patient = observable.map({}, 'patient')


    autorun(() => {

    });


  }
  async request(id){
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      id
    }

    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
        path: `tools/PatientGet`,
        data,
        success: async data => {
          console.log('DATA', data);
          let {
            allergy,
            birthdate,
            disease,
            disease2,
            driving,
            email,
            fio,
            gestation,
            growth,
            id,
            lactation,
            miscode,
            misid,
            name,
            pregnancy,
            sex,
            trimester,
            weight
          } = data.patient
          this.stores.actions.patientForm = {
            id,
            email,
            fio,
            miscode,
            misid,
            name,
            allergy,
            birthdate,
            disease,
            disease2,
            driving,
            gestation,
            growth,
            lactation,
            pregnancy,
            sex,
            trimester,
            weight
          }
          this.stores.actions.drugStructure.patient = {
            id,
            email,
            fio,
            miscode,
            misid,
            name,
            allergy,
            birthdate,
            disease,
            disease2,
            driving,
            gestation,
            growth,
            lactation,
            pregnancy,
            sex,
            trimester,
            weight
          }
          this.stores.actions.patientPassport = {
            id,
            email,
            fio,
            miscode,
            misid,
            name,
          }

          return true
        },
        fail: (alerts) => {

        },
        always: (data) => {

        }
    });
  }

  async makeList({ patients, names }){
    if(patients && _.isArray(patients)){
      patients.forEach( async (patientId, i) => {

        let current = await this.patient.get(patientId) || {}
        let patient = await _.extend(current, { name: names[patientId], id: patientId });
        // console.log(patient);
        this.patient.set(patientId, patient)
      });
      this.ready = true
    }
  }
  get arr(){
    return Array.from(this.patient.values())
  }

  async search(text, saveTo='search'){
    this.searchReady = false
    let data = {
      text,
      // lib: '62, 52', //'61, 25' - заболевания
      service: "43",
      // chain: 0
    }
    data.authkey = this.stores.actions.authkey
    data.key = this.stores.actions.privateKey
    return POST({
        path: `search/Patients`,
        data,
        success: async data => {
          if(data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
            await data.concepts.forEach(( concept, i ) => {
              data.concepts[i].key = 'concept'+i
              data.concepts[i].title = data.concepts[i].name
            })
            this[`${saveTo}Rows`] = observable([])
            this[`${saveTo}Rows`] = await _.unionWith(data.concepts, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
            this.searchReady = true
          }
        },
        fail: (alerts) => {
            this.searchReady = true
          // console.log('fail', alerts);
        },
        always: (data) => {
          // this.stores.actions.makeAlerts(data)
        }
    });
  }
  async save(){
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      patient: {

      }
    }
    data.patient = await _.assignIn({ ...this.stores.actions.drugStructure.patient }, { ...this.stores.actions.patientPassport });
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    // console.log(data.patient);
    return POST({
        path: data.patient.id ? `tools/PatientUpdate` : 'tools/PatientAdd',
        data,
        success: async data => {

          if(data.patients){
            let { doc, id, lpu, patients, names } = data
            this.makeList({ patients, names })
          }
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
export default Patients;
