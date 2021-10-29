import { observable, action, autorun, computed, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import { PatientScheme } from "../schemes";

import _ from "lodash";
import AlertItem from "../components/Alerts/Alert";

class Patients {
  ready = false;
  searchRows = [];

  searchReady = true;

  selectedRows = [];

  current = _.cloneDeep(PatientScheme);

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      searchRows: observable,
      searchReady: observable,
      selectedRows: observable,
      current: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    this.patient = observable.map({}, "patient");

    autorun(() => {});
  }

  setCurrent = async ({
    id,
    email,
    fio,
    miscode,
    misid,
    name,
    birthdate,
    sex,
    growth,
    weight,
    disease,
    co_disease,
    labparams,
    pregnancy,
    gestation,
    trimester,
    lactation,
    driving,
    alcohol,
    masIndex,
    allergy,
    mutations,
    lastname,
    patronymic,
    firstname,
    snils,
    policy_num,
    medcard_num,

    main_address,
    genpassport_exist,
  }) => {
    let patientTpl = _.cloneDeep(PatientScheme);
    masIndex = parseFloat((weight / Math.pow(growth / 100, 2)).toFixed(2));
    await _.assignIn(this.current, patientTpl, {
      id,
      email,
      fio,
      miscode,
      misid,
      name,
      birthdate,
      sex,
      growth,
      weight,
      disease,
      co_disease,
      labparams,
      pregnancy,
      gestation,
      trimester,
      lactation,
      driving,
      alcohol,
      masIndex,
      allergy,
      mutations,
      lastname,
      patronymic,
      firstname,
      snils,
      policy_num,
      medcard_num,

      main_address,

      genpassport_exist,
    });
  };

  unsetCurrent = () => {
    this.stores.actions.resetPatientPassport();
    _.assignIn(this.current, PatientScheme);
  };

  getCurrent = () => {
    return _.cloneDeep(this.current);
  };

  getClone = async (key) => {
    let patient = await this.patient.get(key);
    return _.cloneDeep(patient);
  };

  getNew = () => {
    return _.cloneDeep(PatientScheme);
  };

  async request(id) {
    this.stores.actions.loading = true;
    await this.stores.actions.resetAll();
    let { active_language } = this.stores.actions;
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      id,
      active_language,
    };
    await this.stores.db.clearData(false, true);
    await this.stores.drugs.clearProto();

    return POST({
      path: `prescript/Actual`,
      data,
      success: async (data) => {
        if (data.patient && data.patient.id) {
          await this.setCurrent(data.patient);
        }

        this.stores.clinrecs.collectorAvailable = data.is_collector_available;

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
          labparams,
          mutations,
          alcohol,

          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,

          main_address,

          genpassport_exist,
        } = data.patient;

        let masIndex = parseFloat((weight / Math.pow(growth / 100, 2)).toFixed(2));

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
          labparams,
          co_disease,
          driving,
          gestation,
          growth,
          lactation,
          pregnancy,
          sex,
          trimester,
          weight,
          masIndex,
          mutations,

          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,
          main_address,

          genpassport_exist,
        };

        Object.assign(this.stores.actions.drugStructure.patient, {
          id,
          email,
          fio,
          miscode,
          misid,
          name,
          birthdate,
          sex,
          growth,
          weight,
          disease,
          co_disease,
          pregnancy,
          gestation,
          trimester,
          lactation,
          driving,
          alcohol,
          allergy,
          mutations,
          labparams,

          genpassport_exist,

          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,

          main_address,
        });
        // this.stores.actions.drugStructure.patient = {
        //   id,
        //   key: id,
        //   email,
        //   fio,
        //   miscode,
        //   misid,
        //   name,
        //   allergy,
        //   birthdate,
        //   disease,
        //   disease2,
        //   co_disease,
        //   driving,
        //   gestation,
        //   growth,
        //   lactation,
        //   pregnancy,
        //   sex,
        //   trimester,
        //   weight,
        // };
        this.stores.actions.patientPassport = {
          id,
          email,
          fio,
          miscode,
          misid,
          name,

          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,

          main_address,
        };

        let { drugs, liquids } = data;
        co_disease = co_disease || [];

        liquids.forEach(async (liquid, i) => {
          if (liquid.group != null) {
            await this.stores.drugs.liquid.set(liquid.group, liquid);
          } else {
            this.stores.drugs.deletedLiquids.push(liquid);
          }
        });

        // console.log("drugs: ", drugs);
        drugs = drugs.map((d) => {
          if (d.helpers) return d;
          let { dosage } = d;
          dosage = _.isArray(dosage.dosage) ? dosage.dosage : [dosage.dosage];
          // console.log({ dosage });
          const { names, nameshort } = this.stores.tools.unitsPharm;
          let helpers = {
            dosage: {
              short: "",
              full:
                (dosage[0] && dosage[0]?.id_1
                  ? `${_.map(dosage, "value_1").join(" + ")} ${nameshort[dosage[0].id_1]}`
                  : "") || "",
              id: null,
            },
            pack: { short: "", full: "", id: null },
            type: _.isArray(dosage) && dosage.length > 1 ? "multi" : "simple",
            // url: "",
            key: null,
            way: "lf",
            step: "4",
            // mnn: false,
            // drugCache: null,
          };
          return {
            ...d,
            helpers,
          };
        });
        // console.log("drugs with helpers: ", drugs);

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
      always: (data) => {
        this.stores.actions.makeAlerts(data);
        if (this.stores?.actions?.miskey) {
          setTimeout(() => {
            this.stores.warnings.check();
          });
        }
      },
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
          mutations,
          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,

          main_address,
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
          mutations,
          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,

          main_address,
        };
        // this.stores.actions.drugStructure.patient = {
        //   id,
        //   key: id,
        //   email,
        //   fio,
        //   miscode,
        //   misid,
        //   name,
        //   allergy,
        //   birthdate,
        //   disease,
        //   disease2,
        //   co_disease,
        //   driving,
        //   gestation,
        //   growth,
        //   lactation,
        //   pregnancy,
        //   sex,
        //   trimester,
        //   weight,
        // };
        this.stores.actions.patientPassport = {
          id,
          email,
          fio,
          miscode,
          misid,
          name,
          lastname,
          patronymic,
          firstname,

          snils,
          policy_num,
          medcard_num,

          main_address,
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
    let arr = [
      {
        id: null,
        name: null,
        key: null,
      },
    ];
    arr = arr.concat(Array.from(this.patient.values()));

    return arr;
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
      doctor_id: (this.stores.actions.doctor && this.stores.actions.doctor.id) || null,
      // lib: '62, 52', //'61, 25' - заболевания
      // service: "43",
      // chain: 0
      active_language,
    };

    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    this[`${saveTo}Rows`] = observable([]);

    return POST({
      path: `search/Patients`,
      data,
      success: async (data) => {
        if (data.patients && data.patients.length > 0 && _.isArray(data.patients)) {
          await data.patients.forEach((concept, i) => {
            data.patients[i].key = "concept" + i;
            data.patients[i].title = data.patients[i].name;
          });

          this[`${saveTo}Rows`] = await _.unionWith(data.patients, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
          this.searchReady = true;
        } else {
          this.searchReady = true;
          this.stores.actions.makeAlerts(data);
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
    let patient = await _.assignIn({ ...this.current }, { ...this.stores.actions.patientPassport });
    data.patient = patient;
    data.doctorId = this.stores.actions.drugStructure.doctor_id;
    data.clinicId = this.stores.actions.default_clinic_id;
    if (data.patient.birthdate) {
      data.patient.birthdate = moment(data.patient.birthdate, "x").utc().format("x");
    }
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    // console.log(data.patient);
    this.stores.actions.loading = true;
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
        if (data.patient) {
          let { id } = data.patient;
          await this.request(id);
        }
        return data;
      },
      fail: (alerts) => {},
      always: (data) => {
        this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
    });
  }
}
export default Patients;
