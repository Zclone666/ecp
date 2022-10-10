import { observable, autorun, makeObservable } from "mobx";
import { POST } from "../lib/connect";
import moment from "moment";

import { PatientScheme } from "../schemes";

import _ from "lodash";

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
    this.last = observable.map({}, "last");

    autorun(() => { });
  }

  /**
  // метод устанавливает текущего пациента
  * @param patient - объект пациента
  */
  setCurrent = async (patient) => {
    let {
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
      squareIndex,
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
    } = patient || {};
    let patientTpl = _.cloneDeep(PatientScheme);
    masIndex = parseFloat((weight / Math.pow(growth / 100, 2)).toFixed(2));
    squareIndex = parseFloat((0.007184 * Math.pow(growth, 0.725) * Math.pow(weight, 0.425)).toFixed(2));
    //parseFloat((weight / Math.pow(growth / 100, 2)).toFixed(2));
    Object.assign(this.current, patientTpl, {
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
      squareIndex,
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
      // disease2,
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
      squareIndex,
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
    // console.log(this.current);
  };

  /**
  // метод очищает объект текущего пациента
  */
  unsetCurrent = () => {
    this.stores.actions.resetPatientPassport();
    _.assignIn(this.current, PatientScheme);
  };

  /**
  // метод возвращает клонированный объект текущего пациента
  */
  getCurrent = () => {
    return _.cloneDeep(this.current);
  };

  /**
  // метод возвращает клонированный объект пациента по ключу
  * @param key - ключ пациента
  */
  getClone = async (key) => {
    let patient = await this.patient.get(key);
    return _.cloneDeep(patient);
  };

  /**
  // метод возвращает пустой объект пациента
  */
  getNew = () => {
    return _.cloneDeep(PatientScheme);
  };

  /**
  // метод получает данные и терапию пациента по айди
  * @param id - айди пациента
  */
  async request(id) {
    this.stores.actions.loading = true;
    await this.stores.actions.resetAll("patient_only");
    let { active_language } = this.stores.actions;
    let data = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      id,
      active_language,
      doctor_id: (this.stores.actions.doctor && this.stores.actions.doctor.id) || null,
    };
    await this.stores.db.clearData(false, true);
    await this.stores.drugs.clearProto();

    return POST({
      path: `prescript/Actual`,
      data,
      success: async (data) => {
        console.time('FirstWay');
        if (data.patient && data.patient.id) {
          await this.setCurrent(data.patient);
        }

        if (data.lang && this.stores.actions.active_language !== data.lang) {
          this.stores.actions.active_language = data.lang;
          await localStorage.setItem("lang", data.lang);
          this.stores.tools.getAllService();
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


        // FIO PARSING

        if (!lastname && !firstname && !patronymic) {
          const patronymicTest = /^.+(ич|вна|чна)$/i;
          // name = " Иван  Васильевич Петров-Водкин";
          name = name.trim();
          name = name.replace(/\s+/g, ' ');
          const nameArray = name.split(" ");

          if (nameArray.length === 3) {
            if (patronymicTest.test(nameArray[1])) {
              lastname = nameArray[2];
              firstname = nameArray[0];
              patronymic = nameArray[1];
            } else {
              lastname = nameArray[0];
              firstname = nameArray[1];
              patronymic = nameArray[2];
            }
          }
        }

        // <== FIO PARSING

        let masIndex = parseFloat((weight / Math.pow(growth / 100, 2)).toFixed(2));
        let squareIndex = parseFloat((0.007184 * Math.pow(growth, 0.725) * Math.pow(weight, 0.425)).toFixed(2));
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
          squareIndex,
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
        console.log("patient 1");
        liquids.forEach(async (liquid, i) => {
          if (liquid.group != null) {
            await this.stores.drugs.liquid.set(liquid.group, liquid);
          } else {
            this.stores.drugs.deletedLiquids.push(liquid);
          }
        });
        console.log("patient 2");
        // console.log("drugs: ", drugs);
        drugs = drugs.map((d) => {
          if (d.helpers) return d;
          let { dosage } = d;
          dosage.dosage = _.isArray(dosage.dosage) ? dosage.dosage : [dosage.dosage];
          // console.log({ dosage });
          // KOSTYL
          if (!dosage.pack || !dosage.pack.id) {
            dosage.pack = {
              id: "",
              dosage: {
                id_1: d.calc?.countUnit,
                type: "value",
                value_1: 1,
              },
            };
          }
          // END KOSTYL
          const { nameshort } = this.stores.tools.unitsPharm;
          nameshort[99] = "%";
          // console.log({ d });
          let helpers = {
            dosage: {
              short: "",
              full:
                (dosage.dosage[0] && dosage.dosage[0]?.id_1
                  ? `${_.map(dosage.dosage, "value_1").join(" + ")} ${nameshort[dosage.dosage[0].id_1]}`
                  : "") || "",
              id: dosage.dosage[0]?.id_1,
            },
            pack: { short: "", full: "", id: d?.dosage?.pack?.dosage?.id_1 || d?.calc?.countUnit },
            type: _.isArray(dosage.dosage) && dosage.dosage.length > 1 ? "multi" : "simple",
            // url: "",
            key: null,
            way: "lf",
            step: d?.dosage?.method && d?.dosage?.form ? "4" : "1",
            // mnn: false,
            // drugCache: null,
          };
          return {
            ...d,
            helpers,
            dosage,
          };
        });
        // console.log("drugs with helpers: ", drugs);
        console.log("patient 3");

        
        // let namesToStore = {};

        drugs.forEach(async (drug, i) => {
          /**
           * @todo тормоза
           */
          await this.stores.drugs.selectFromSearch(drug, false, false);
          if (drug.dosage && drug.dosage.form && drug.dosage.form_name) {
            // console.log("this.stores.tools.unitsPharm.names");
            this.stores.tools.unitsPharm.names[drug.dosage.form] = drug.dosage.form_name;

            // namesToStore[drug.dosage.form]=drug.dosage.form_name;
          }
          if (drug.dosage && drug.dosage.method && drug.dosage.method_name) {
            this.stores.tools.unitsPharm.names[drug.dosage.method] = drug.dosage.method_name;
            // namesToStore[drug.dosage.method]=drug.dosage.method_name;
          }
        });

        // this.stores.tools.unitsPharm.names = {
        //   ...this.stores.tools.unitsPharm.names,
        //   ...namesToStore
        // };

        console.log("patient 4");
        this.stores.tools.stepByStepLoading(this.stores.dosages.get, drugs);
        console.log("patient 5");
        this.stores.actions.makeLiquids = false;
        console.timeEnd('FirstWay');
        this.stores.actions.loading = false;

        // this.stores.drugs.listChanged = false;

        return data.patient || {};
      },
      fail: (alerts) => { },
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

  /**
  // метод устанавливает поля формы редактирования пациента
  * @param patient - объект пациента
  */
  setPatient(patient) {
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
    } = patient;
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
    return patient || {};
  }

  /**
  // метод сохраняет пациента из формы редактирования пациента
  * @param id - айди пациента
  */
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

        return this.setPatient(data.patient);
      },
      fail: (alerts) => { },
      always: (data) => { },
    });
  }

  //Tools/GetLastPatients
  /**
  // метод получает концепты последних 30 измененных пациентов для врача
  */
  async getList() {
    this.searchReady = false;
    let { active_language } = this.stores.actions;
    if (!(this.stores.actions.doctor && this.stores.actions.doctor.id)) return;
    let data = {
      count: 30,
      doctor_id: (this.stores.actions.doctor && this.stores.actions.doctor.id) || null,
      // lib: '62, 52', //'61, 25' - заболевания
      // service: "43",
      // chain: 0
      active_language,
    };

    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    if (!(data.authkey && data.authkey.length) && !(data.key && data.key.length)) return;

    // this[`${saveTo}Rows`] = observable([]);

    return POST({
      path: `Tools/GetLastPatients`,
      data,
      success: async (data) => {
        if (data.patients && data.patients.length > 0 && _.isArray(data.patients)) {
          await data.patients.forEach((patient, i) => {
            this.last.set(patient.id, patient);
          });

          // let pat = await _.unionWith(data.patients, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
          // this.last.set(data.patients)
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

  /**
  // метод сохраняет в нужном формате список пациентов, полученный в методе getList
  * @param patients - список айди пациентов
  * @param names - объект айди => имя пациента
  */
  async makeList({ patients, names }) {
    if (patients && _.isArray(patients)) {
      patients.forEach(async (patientId, i) => {
        let key = patientId || (moment().format("x") + i).toString();

        // let current = await this.patient.get(key) || {}
        // let patient = await _.extend(current, { name: names[patientId], id: patientId, key });
        // console.log(patient);
        await this.patient.set(key, { name: names[patientId], id: patientId, key });
      });
      this.ready = true;
    }
  }

  /**
  // геттер возвращает массив пациентов для выпадашки с первым пустым элементом (чтоыб не выбирался первый по дефолту)
  */
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

  /**
  // метод ищет возвращает объект пациента по айди
  * @param id - айди пациента
  */
  getById(id) {
    let res = {};
    Array.from(this.patient.values()).forEach((item, i) => {
      if (item.id === id) res = item;
    });
    return res;
  }

  /**
  // метод побуквенного поиска пациента
  * @param text - строка поиска
  * @param saveTo - куда положить ответ
  */
  async search(text, saveTo = "search") {
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

  /**
  // метод сохранения пациента на бэк
  */
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
        // console.log({ data });
        if (data.patients) {
          let { patients, names } = data;
          await this.makeList({ patients, names });
          await this.request(patients[0]);
          await this.getPatient(patients[0]);
          return this.getById(patients[0]);
        }
        if (data.patient) {
          this.setCurrent(data.patient);
          // await this.request(id);
        }

        /**
         * @todo Можно оптимизировать, если запрашивать не каждый раз при изменение пациента, а только если изменились ФИО или емайл
         */
        this.stores.patients.getList();
        return data;
      },
      fail: (alerts) => {
        this.stores.actions.makeAlerts({ alerts });
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
    });
  }
}
export default Patients;
