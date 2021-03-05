import { observable, action, autorun, computed } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";

class Patients {
  @observable ready = false;
  @observable searchRows = [];

  @observable searchReady = true;

  @observable selectedRows = [];

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.patient = observable.map({}, "patient");

    autorun(() => {});
  }
  async request(id) {
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      id,
      active_language,
    };
    await this.stores.db.clearData(false, true);
    await this.stores.drugs.clearProto();
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
      path: `prescript/Actual`,
      data,
      success: async (data) => {
        // console.log('DATA', data);
        let {
          allergy,
          birthdate,
          disease,
          disease2,
          co_disease,
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
          weight,
        } = data.patient;
        let { drugs, liquids } = data;
        co_disease = co_disease || [];
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
          co_disease,
          driving,
          gestation,
          growth,
          lactation,
          pregnancy,
          sex,
          trimester,
          weight,
        };
        this.stores.actions.drugStructure.patient = {
          id,
          key: id,
          email,
          fio,
          miscode,
          misid,
          name,
          allergy,
          birthdate,
          disease,
          disease2,
          co_disease,
          driving,
          gestation,
          growth,
          lactation,
          pregnancy,
          sex,
          trimester,
          weight,
        };
        this.stores.actions.patientPassport = {
          id,
          email,
          fio,
          miscode,
          misid,
          name,
        };
        liquids.forEach(async (liquid, i) => {
          if (liquid.group != null) {
            await this.stores.drugs.liquid.set(liquid.group, liquid);
          } else {
            this.stores.drugs.deletedLiquids.push(liquid);
          }
        });

        drugs.forEach(async (drug, i) => {
          await this.stores.drugs.selectFromSearch(drug, false, false);
        });

        await this.stores.tools.stepByStepLoading(this.stores.dosages.get, drugs);

        this.stores.actions.makeLiquids = false;

        this.stores.actions.loading = false;

        // this.stores.drugs.listChanged = false;

        return data.patient || {};
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  async getPatient(id) {
    let { active_language } = this.stores.actions;
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      id,
      active_language,
    };
    await this.stores.db.clearData(true);
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
      path: `tools/PatientGet`,
      data,
      success: async (data) => {
        // console.log('DATA', data);
        let {
          allergy,
          birthdate,
          disease,
          disease2,
          co_disease,
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
          weight,
        } = data.patient;
        // let { drugs } = data
        co_disease = co_disease || [];
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
          co_disease,
          driving,
          gestation,
          growth,
          lactation,
          pregnancy,
          sex,
          trimester,
          weight,
        };
        this.stores.actions.drugStructure.patient = {
          id,
          key: id,
          email,
          fio,
          miscode,
          misid,
          name,
          allergy,
          birthdate,
          disease,
          disease2,
          co_disease,
          driving,
          gestation,
          growth,
          lactation,
          pregnancy,
          sex,
          trimester,
          weight,
        };
        this.stores.actions.patientPassport = {
          id,
          email,
          fio,
          miscode,
          misid,
          name,
        };

        // drugs.forEach(async (drug, i) => {
        //   await this.stores.drugs.selectFromSearch( drug )
        // });
        return data.patient || {};
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  async makeList({ patients, names }) {
    if (patients && _.isArray(patients)) {
      patients.forEach(async (patientId, i) => {
        let patient = this.getById(patientId);
        let key = patientId || (moment().format("x") + i).toString();

        // let current = await this.patient.get(key) || {}
        // let patient = await _.extend(current, { name: names[patientId], id: patientId, key });
        // console.log(patient);
        await this.patient.set(key, { name: names[patientId], id: patientId, key });
      });
      this.ready = true;
    }
  }

  get arr() {
    return Array.from(this.patient.values());
  }

  getById(id) {
    let res = {};
    Array.from(this.patient.values()).forEach((item, i) => {
      if (item.id === id) res = item;
    });
    return res;
  }

  async search(text, saveTo = "search") {
    // {
    //   "key":"",
    //   "authkey":"ауткей",
    //   "doctor_id":"MQLoOvfAe/jDj984HuPKXw==",
    //   "text":"тут текст для поиска"
    // }
    this.searchReady = false;
    let { active_language } = this.stores.actions;
    let data = {
      text,
      // lib: '62, 52', //'61, 25' - заболевания
      service: "43",
      // chain: 0
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `search/Patients`,
      data,
      success: async (data) => {
        if (data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
          await data.concepts.forEach((concept, i) => {
            data.concepts[i].key = "concept" + i;
            data.concepts[i].title = data.concepts[i].name;
          });
          this[`${saveTo}Rows`] = observable([]);
          this[`${saveTo}Rows`] = await _.unionWith(data.concepts, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
          this.searchReady = true;
        }
      },
      fail: (alerts) => {
        this.searchReady = true;
        // console.log('fail', alerts);
      },
      always: (data) => {
        // this.stores.actions.makeAlerts(data)
      },
    });
  }

  async save() {
    let { active_language } = this.stores.actions;
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      patient: {},
      active_language,
    };
    let patient = await _.assignIn(
      { ...this.stores.actions.drugStructure.patient },
      { ...this.stores.actions.patientPassport }
    );
    data.patient = patient;
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    // console.log(data.patient);
    return POST({
      path: data.patient.id ? `tools/PatientUpdate` : "tools/PatientAdd",
      data,
      success: async (data) => {
        if (data.patients) {
          let { doc, id, lpu, patients, names } = data;
          await this.makeList({ patients, names });
          await this.request(patients[0]);
          return this.getById(patients[0]);
        }
      },
      fail: (alerts) => {},
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  }
}
export default Patients;
