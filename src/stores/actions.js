import { observable, action, autorun, makeObservable } from "mobx";
import { GET, POST, PUT, PROJECT_TITLE, CREATE_API_URL } from "../lib/connect";
import _ from "lodash";
import moment from "moment";
import { LOGIN, SERVER } from "../constants";

import { StructureScheme, ProfileScheme } from "../schemes";

import i18n from "../i18n";

export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
export const RESET_PASS_KEY = "9152ea8756f8f2b3";
export const REQUEST_PASS_KEY = "c47ee7e666d6be7e";
export const CHECK_REG_KEY = "340f725c9ccb9779";
//export const AUTH_REG_KEY = "c47ee7e666d6be7e";
const privateKeyOnly = LOGIN == "privateKeyOnly";

const createCsServerUrl = (url) => {
  if (
    // window.location.host.includes("localhost") ||
    window.location.host.includes("178.176.38.245:9031")
    // || window.location.host.includes("socmedica.dev")
  ) {
    return "http://84.23.32.38:8999" + url;
  }
  if (window.location.host.includes("84.23.32.38:9031")) {
    return "http://84.23.32.38:9000" + url;
  }
  //--------------------
  return SERVER == "dev" ? "https://csdev.socmedica.com" + url : "https://cs.socmedica.com" + url;
};
// !window.location.href.includes(["socmedica"]) && !window.location.href.includes(["localhost"])
//   ? "http://" + window.location.hostname + ":9999" + url
//   : "https://" + (window.location.href.includes(["socmedica.com"]) ? "cs" : "csdev") + ".socmedica.com" + url;

class Actions {
  view = false;
  device = null;
  mobilewarning = false;
  height = 0;

  projectTitle = PROJECT_TITLE;

  authorized = false;
  loading = false;
  dataLoading = false;
  authkey = null;
  privateKey = null;

  disabled = false;
  miskey = null;
  misurl = null;

  active_language = "ru";

  pages = {};
  currentPage = null;

  filtersChanged = false;

  alerts = {};

  elements = {};
  buttonTexts = {};
  UIText = {};
  recipeData = {};

  makeLiquids = false;
  isLiquidsOk = false;

  protocol = null;
  misLinkLogin = false;
  resultChecking = false;
  topview_disabled = false;
  bottomview_disabled = false;

  checkData = {
    lpu: [],
    doctor: null,
  };

  doctor = {
    id: null,
    name: null,
  };

  loginForm = {
    email: "",
    password: "",
    privateKey: "",
    remember: true,
    hidden: true,
  };

  profile = _.cloneDeep(ProfileScheme);

  signinForm = {
    email: "",
    password: "",
    lastName: "",
    firstName: "",
    middleName: "",
    lpuName: "",
    department: "",
    hidden: true,
    isEmailReg: false,
    // relationCode: null,
    // clinicEncryptedId: "",
    showUserAlreadyExistsDialog: false,
  };

  confirmForm = {
    email: "",
    code: "",
    service: "",
  };

  getConfirmForm = {
    email: "",
  };

  resetPassForm = {
    email: "",
    key: "",
  };

  newPassForm = {
    email: "",
    recoveryCode: "",
    newPassword: "",
    key: "",
  };

  clinrecCheckerData = {};
  clinrecCheckerStep = 1;

  stepsData = {
    key: null,
    way: null,
    step: null,
    form: null,
    method: null,
    pack: {},
    dosage: [],
    value: null,
    helpers: {},
  };

  patientForm = {
    id: null,
    email: null,
    fio: null,
    miscode: null,
    misid: null,
    name: null,
    birthdate: null,
    sex: null,
    growth: null,
    weight: null,
    disease: [],
    co_disease: [],
    lab_data: [],
    pregnancy: false,
    gestation: null,
    trimester: null,
    lactation: false,
    driving: false,
    alcohol: false,
    masIndex: null,
    allergy: [],
  };

  patientPassport = {
    id: null,
    name: null,
    email: null,
    miscode: null,
    misid: null,
    fio: null,
    lastname: null,
    patronymic: null,
    firstname: null,
    snils: null,
    policy_num: null,
    medcard_num: null,
  };

  resetPatientPassport = () => {
    this.patientPassport = {
      id: null,
      name: null,
      email: null,
      miscode: null,
      misid: null,
      fio: null,
      lastname: null,
      patronymic: null,
      firstname: null,
      snils: null,
      policy_num: null,
      medcard_num: null,
    };
  };

  scheduleForm = {
    dateStart: null,
    dateFinish: null,
    finishAlternate: null,
    clarifications: null, //уточнения
    interval: null,
    once: null,
    week: null,
    calendar: null,
    specials: null,
    format: "interval",
  };

  calculatorForm = {
    dosage: [0],
    count: 1,
    dosageUnit: "248",
    dayCount: 1,
    fullDosage: [0],
    weightDosage: [0],
    dayDosage: [0],
    dayWeightDosage: [0],
  };

  liquidForm = {
    name: "", // Название ДВ или ТН
    group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
    specials: null,
    freq: null,
    duration: null,
    calc: {
      dosage: [0],
      count: 1,
      dosageUnit: null,
      dayCount: 1,
      fullDosage: [0],
      weightDosage: [0],
      dayDosage: [0],
      dayWeightDosage: [0],
      durationCount: 0,
      durationUnit: "75",
      fullSpeed: [0],
      weightSpeed: [0],
      tintSpeed: [0],
      liquidSpeed: [0],
    },
    schedule: {
      dateStart: null,
      dateFinish: null,
      finishAlternate: null,
      clarifications: null, //уточнения
      interval: null,
      once: null,
      week: null,
      calendar: null,
    },
  };

  selectedDrug = null;
  selectedConflict = null;
  activeDrugs = [];
  activeConflicts = [];

  selectedDrugFg = null;
  selectedConflictFg = null;
  activeDrugsFg = [];
  activeConflictsFg = [];

  checkedFg = [];
  openForFg = null;

  drugStructure = _.cloneDeep(StructureScheme);

  default_clinic_id = null;
  // {
  //   key: "key",
  //   device_id: null,
  //
  //   clinic_id: null,
  //   clinic_code: null,
  //   clinic_name: null,
  //   dep_id: null,
  //   dep_code: null,
  //   dep_name: null,
  //   doctor_id: null,
  //   doctor_code: null,
  //   doctor_name: null,
  //
  //   patient: {
  //     id: null,
  //     email: null,
  //     fio: null,
  //     miscode: null,
  //     misid: null,
  //     name: null,
  //     birthdate: null,
  //     sex: null,
  //     growth: null,
  //     weight: null,
  //     disease: [],
  //     co_disease: [],
  //     pregnancy: false,
  //     gestation: null,
  //     trimester: null,
  //     lactation: false,
  //     driving: false,
  //     alcohol: false,
  //     allergy: [],
  //   },
  //   active_language: "ru",
  //   liquids: [],
  //   drugs: [],
  //   text: null,
  // };

  constructor({ stores }) {
    makeObservable(this, {
      view: observable,
      device: observable,
      mobilewarning: observable,
      height: observable,
      projectTitle: observable,
      authorized: observable,
      loading: observable,
      dataLoading: observable,
      authkey: observable,
      privateKey: observable,
      disabled: observable,
      miskey: observable,
      active_language: observable,
      pages: observable,
      currentPage: observable,
      filtersChanged: observable,
      alerts: observable,
      elements: observable,
      buttonTexts: observable,
      UIText: observable,
      recipeData: observable,
      makeLiquids: observable,
      isLiquidsOk: observable,
      protocol: observable,
      misLinkLogin: observable,
      resultChecking: observable,
      topview_disabled: observable,
      bottomview_disabled: observable,
      checkData: observable,
      doctor: observable,
      loginForm: observable,
      profile: observable,
      signinForm: observable,
      confirmForm: observable,
      getConfirmForm: observable,
      resetPassForm: observable,
      newPassForm: observable,
      clinrecCheckerData: observable,
      clinrecCheckerStep: observable,
      stepsData: observable,
      patientForm: observable,
      patientPassport: observable,
      scheduleForm: observable,
      calculatorForm: observable,
      liquidForm: observable,
      selectedDrug: observable,
      selectedConflict: observable,
      activeDrugs: observable,
      activeConflicts: observable,
      selectedDrugFg: observable,
      selectedConflictFg: observable,
      activeDrugsFg: observable,
      activeConflictsFg: observable,
      checkedFg: observable,
      openForFg: observable,
      drugStructure: observable,
      default_clinic_id: observable,
      resetAll: action,
      selectPatient: action,
      unselectPatient: action,
    });

    this.stores = stores;
    this.autologin();
    autorun(() => {
      if (this.stepsData.dosage && this.stepsData.dosage.length > 0) {
        // console.log({ stepsData: this.stepsData });
        this.stores.drugs.setBaseDosages(this.stores.drugs.current.key);
      }
    });

    autorun(() => {
      // console.log("loading: ", this.loading);
      // if (this.loading) {
      //   setTimeout(() => {
      //     this.loading = false;
      //   }, 5000);
      // }
    });
  }

  async setLang(lang) {
    if (lang !== this.active_language) {
      // this.drugStructure.active_language =
      this.active_language = lang;
      await localStorage.setItem("lang", lang);
      window.location.reload(false);
    }
  }

  onResize() {
    // console.log('resize');
    let h = window.innerHeight;
    let w = window.innerWidth;
    let v = h > w ? "portrait" : "landscape";
    let d =
      (w < 480 && v === "portrait") || (w < 1024 && v === "landscape")
        ? "mobile"
        : (w < 1280 && v === "portrait") || (w < 1280 && v === "landscape")
        ? "tablet"
        : "pc";
    this.mobilewarning = d === "mobile" || d === "tablet";
    this.view = v;
    this.device = d;
    // console.log(d);
    this.height = h;
  }

  makeAlerts(data) {
    if (data.alerts && data.alerts.length > 0) {
      data.alerts.forEach((item, i) => {
        let key = Math.floor(Math.random() * 10000);
        this.alerts[key] = item;
      });
    }
  }

  /*
  // создает и возвращает полную структуру пациента с назначениями для отправки
  */
  get structure() {
    let { patients, drugs } = this.stores;
    let structure = _.cloneDeep(this.drugStructure);
    structure.patient = patients.current;
    structure.drugs = Array.from(this.stores.drugs.drug.values());
    structure.liquids = Array.from(this.stores.drugs.liquid.values());
    structure.deletedDrugs = _.cloneDeep(this.stores.drugs.deletedRows);
    structure.deletedLiquids = _.cloneDeep(this.stores.drugs.deletedLiquids);
    return structure;
  }

  /**
  // сбрасывает введенные/загруженные данные в зависимости от выбранного параметра
  * @param flag == patient - сбрасывает введенного пациента и его лист назначений
                == list - сбрасывает лист назначений
                == all - сбрасывает все данные
  */
  async resetAll(flag = "patient") {
    let structure = await _.cloneDeep(StructureScheme);
    this.stores.clinrecs.collectorAvailable = false;

    switch (flag) {
      case "patient_only":
        this.stores.patients.unsetCurrent();
        structure.clinic_id = this.clinic.id;
        structure.clinic_name = this.clinic.name;
        structure.doctor_id = this.doctor.id;
        structure.doctor_name = this.doctor.name;

        _.assignIn(this.drugStructure, structure);
        _.assignIn(this.patientPassport, {
          id: null,
          name: null,
          email: null,
          miscode: null,
          misid: null,
          fio: null,
        });
        this.stores.clinrecs.resetClinrecs();
        this.stores.db.clearData(false, true);
        break;
      case "patient":
        this.stores.patients.unsetCurrent();
        structure.clinic_id = this.clinic.id;
        structure.clinic_name = this.clinic.name;
        structure.doctor_id = this.doctor.id;
        structure.doctor_name = this.doctor.name;

        _.assignIn(this.drugStructure, structure);
        _.assignIn(this.patientPassport, {
          id: null,
          name: null,
          email: null,
          miscode: null,
          misid: null,
          fio: null,
        });
        this.stores.clinrecs.resetClinrecs();
        this.stores.db.clearData(true, true);
        break;
      case "all":
        this.stores.patients.unsetCurrent();
        this.stores.clinrecs.resetClinrecs();
        structure.doctor_id = this.doctor.id;
        structure.doctor_name = this.doctor.name;
        _.assignIn(this.drugStructure, structure);
        this.clinic = observable({ id: null, name: null });
        // this.doctor = observable({ id: null, name: null });
        this.stores.db.clearData(true, true);
        break;
      case "list":
        await this.stores.drugs.clearList();
        // this.stores.drugs.deletedRows = observable([]);
        // this.stores.drugs.deletedLiquids = observable([]);
        // this.stores.drugs.selectedRows = observable([]);
        // this.stores.drugs.drug.clear();
        break;
      default:
    }

    // if (flag == "patient") {
    //   structure.clinic_id = this.clinic.id;
    //   structure.clinic_name = this.clinic.name;
    //   structure.doctor_id = this.doctor.id;
    //   structure.doctor_name = this.doctor.name;
    // }
    //
    // _.assignIn(this.drugStructure, structure);
    // // this.drugStructure = structure;
    //
    // if (flag == "patient") {
    //   await this.stores.drugs.clearProto();
    //   this.stores.drugs.deletedRows = observable([]);
    //   this.stores.drugs.deletedLiquids = observable([]);
    //   this.stores.drugs.selectedRows = observable([]);
    // } else {
    //   await this.stores.db.clearData(true, true);
    // }
  }

  /**
  // выбор данных для пациента из выпадающего списка (аллергия, заболевание)
  * @param row - концепт из выпадающего списка строки поиска
  * @param from - название списка, по которому был поиск (disease, allergy)
  */
  async selectPatient(row, from) {
    row.key = moment().format("x").toString();
    this.stores.patients.current[from] = await _.unionWith(
      this.stores.patients.current[from],
      [row],
      (a, b) => a.id === b.id
    );
    this.patientForm[from] = _.cloneDeep(this.stores.patients.current[from]);
    this.stores.db.clearData();
    return true;
  }
  /**
  // удаление данных для пациента (аллергия, заболевание)
  * @param row - концепт для удаления
  * @param from - название параметра для удаления (disease, allergy)
  */
  async unselectPatient(row, from) {
    this.stores.patients.current[from] = await _.xorWith(
      this.stores.patients.current[from],
      [row],
      (a, b) => a.id === b.id
    );
    this.patientForm[from] = _.cloneDeep(this.stores.patients.current[from]);
    this.stores.db.clearData();
    return true;
  }

  /**
  // получене служебных данных (списки единиц измерения, тексовых строк на нужном языке и т.п.)
  * @param name - название списка (и апи для него)
  */
  async getObject(name) {
    let { active_language } = this;
    return POST({
      path: `info/${name}`,
      data: {
        active_language,
      },
      success: async (data) => {
        let { alert, ...values } = data;
        //this[name]
        Object.assign(this[name], { ...values });
        // console.log(this[name]);
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // сохранегие служебных данных (списки единиц измерения, тексовых строк на нужном языке и т.п.)
  * @param name - название списка (и апи для него)
  * @param data - объект (и апи для него)
  */
  async setObject(name, data) {
    Object.assign(this[name], { ...data });
  }

  /**
  // получене названия элемнта для вкладки варнинга (опасность и доказательность)
  * @param name - название списка
  * @param value - значение
  */
  getWarnElement = (name, value) => {
    // console.log({ el: this.elements, name, value });
    let text = "";
    this.elements[name].forEach((item, i) => {
      if (Math.abs(item.to) > Math.abs(item.from)) {
        if (item.from < value && value <= item.to) {
          text = item.name;
        }
      } else {
        if (item.from <= value && value < item.to) {
          text = item.name;
        } else if (item.from == 0 && item.to == 0 && value == 0) {
          text = item.name;
        }
      }
      // if (item.to > 0) {
      //   if ((item.from < value && value <= item.to) || item.to === value) {
      //     text = item.name;
      //   }
      // } else if (item.to <= 0) {
      //   if ((item.from < value && value <= item.to) || item.to === value) {
      //     text = item.name;
      //   }
      // }
    });
    // console.log({ text });
    return text;
  };

  /**
  // проверка, что заполнены все поля для сохранения назначения
  */
  get isPrescriptFilled() {
    let { doctor_id, clinic_id } = this.drugStructure;
    let patient = this.stores.patients.current;
    return (patient.key || patient.id) && doctor_id && clinic_id;
  }

  /**
  // метод автоматической авторизации при открытии страницы. также загружает служебные данные
  // работает как для обычной авторизации, так и для авторизации по ссылке из МИСа
  */
  async autologin() {
    // this.drugStructure.active_language =
    this.active_language = (await localStorage.getItem("lang")) || null;
    if (!this.active_language) {
      // this.drugStructure.active_language =
      this.active_language = "ru";
      await localStorage.setItem("lang", "ru");
    }
    this.stores.tools.getAllService();
    await this.stores.tools.waitForTech(() => {});

    // this.getObject("buttonTexts");
    // this.getObject("elements");
    // this.getObject("UIText");
    // this.getObject("recipeData");

    this.loading = true;
    //------------PRIVATE KEY-------
    if (privateKeyOnly && localStorage.getItem("privateKey")) {
      await this.fakePrivateKeylogin(localStorage.getItem("privateKey"));
      return;
    }
    //------------MIS---------------
    if (this.stores.router.values.miskey) {
      const misKey = this.stores.router.values.miskey;
      //----- getting query parameters ------------
      const queryParams = new URLSearchParams(window.location.search);
      const SETTING_bottomview_disabled = queryParams.get("SETTING_bottomview") == 0;
      const SETTING_topview_disabled = queryParams.get("SETTING_topview") == 0;
      // console.log({
      //   SETTING_bottomview_disabled,
      //   SETTING_topview_disabled,
      // });
      this.topview_disabled = SETTING_topview_disabled;
      this.bottomview_disabled = SETTING_bottomview_disabled;
      //-------------------------------------------
      this.miskey = misKey;
      // console.log({ misKey });
      const misAuthSuccess = await fetch(CREATE_API_URL({ path: "Mis/ActualArguments" }), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: misKey }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.alert.code == "200" && data.alert.level == "success") {
            this.fakeMisLogin(data);
            return true;
          } else {
            this.makeAlerts({ data: { alerts: data.alert } });
          }
        });
      if (misAuthSuccess) return;
    }

    //------------AUTHKEY-----------
    this.authkey = (await localStorage.getItem("authkey")) || "";
    // return;
    if (this.stores.router.values.protocol) {
      if (this.stores.router.match.name == "protocol") {
        await this.stores.warnings.protocol(this.stores.router.values.protocol);
        this.login();
        this.loading = false;
        return;
      }
      if (this.stores.router.match.name == "resultchecking") {
        await this.stores.warnings.checkMisWarnings(this.stores.router.values.protocol);
        this.resultChecking = true;
        this.misLinkLogin = true;
        this.login();
        this.loading = false;
        return;
      }
    }

    if (this.stores.router.values.code) {
      // this.stores.warnings.protocol(this.stores.router.values.protocol);
      this.loading = false;
      return;
    }

    if (!this.authkey && this.stores.router.match.name !== "auth") {
      this.loading = false;
      this.stores.router.push("/login");
      return;
    }
    if (!this.authkey || this.authkey == null || this.authkey == "null") {
      this.loading = false;
      this.stores.router.push("/login");
      return;
    }
    //// FIXME: for safari fucking shit
    return GET({
      path: createCsServerUrl(`/api/user/authCheck`), //'https://dev.socmedica.com/2/api/stats/CheckAuthTrue', //
      data: {
        authkey: this.authkey,
        key: AUTH_SERVICE_KEY,
      },
      success: async (data) => {
        //console.log('logged', data);
        this.loginForm.privateKey = this.privateKey = (await localStorage.getItem("privateKey")) || "";
        this.login();
        // this.authorized = true
        // this.loading = false

        // this.stores.router.push('/')
        // this.stores.db.getFilters()
      },
      fail: async () => {
        // console.log('FAIL');
        // if(this.stores.router && this.stores.router.route !== '/confirm'){
        //   this.stores.router.push('/login')
        // }
        await localStorage.setItem("authkey", null);
        this.stores.router.push("/login");
        this.authorized = false;
        this.loading = false;
      },
      always: (data) => {
        this.makeAlerts(data);
        this.loading = false;
      },
    });
  }

  /**
  // метод проверки авторизации
  */
  async login() {
    //this.loginForm.key = AUTH_SERVICE_KEY;
    this.loading = true;
    let { privateKey, remember } = this.loginForm;
    let { active_language } = this;
    let data = {
      key: privateKey || this.privateKey,
      authkey: this.authkey,
      active_language,
    };
    return POST({
      path: `auth/Check`,
      data,
      success: async (data) => {
        //----------------------------
        // console.log('SUCCESS', data);
        // if( data && data.level == 'success' ){
        let { doc, id, lpu, patients, names } = data;
        this.stores.patients.makeList({ patients, names });

        lpu &&
          lpu.forEach((item, i) => {
            this.checkData.lpu.push({ id: item, name: names[item] });
          });

        if (lpu) this.default_clinic_id = lpu[0];

        if (lpu && lpu.length == 1) {
          this.drugStructure.clinic_id = (lpu && lpu[0]) || null;
          this.drugStructure.clinic_name = (lpu && lpu[0] && names[lpu[0]]) || null;
          this.clinic = {
            id: (lpu && lpu[0]) || null,
            name: (lpu && lpu[0] && names[lpu[0]]) || null,
          };
        } else {
          this.clinic = {
            id: null,
            name: null,
          };
        }

        this.checkData.doctor = (doc && doc[0]) || null;
        // doc &&
        //   doc.forEach((item, i) => {
        //     this.checkData.doctor.push({ id: item, name: names[item] });
        //   });

        this.doctor = {
          id: (doc && doc[0]) || null,
          name: (doc && doc[0] && names[doc[0]]) || null,
        };

        this.drugStructure.doctor_id = (doc && doc[0]) || null;
        this.drugStructure.doctor_name = (doc && doc[0] && names[doc[0]]) || null;

        if (doc && doc[0] && !this.bottomview_disabled) {
          this.makeAlerts({
            alerts: [
              {
                title: `${this.t("welcome")}, ${this.doctor.name}`,
                message: "",
                level: "info",
                sticky: false,
              },
            ],
          });
        } else {
          this.makeAlerts({
            alerts: [
              {
                title: this.t("attention_doctor_not_specified"),
                message: this.t("contact_administrator"),
                level: "warning",
                sticky: false,
              },
            ],
          });
        }

        // console.log(this.doctor);

        this.privateKey = this.loginForm.privateKey;
        this.stores.router.push("/");
        this.authorized = true;
        this.loading = false;
        //this.stores.db.getPages()
        //this.stores.db.getFilters()
        if (remember) {
          await localStorage.setItem("authkey", this.authkey);
          await localStorage.setItem("privateKey", this.loginForm.privateKey);
        }
        // this.stores.tools.getAllService();
        // this.stores.tools.getUnitsPrimary();
        // this.stores.tools.getUnitsPharm();
        // this.stores.tools.getUnitsSchedule();

        this.stores.patients.getList();
        // this.stores.patients.request()
        // }else{
        //   this.makeAlerts({ alerts:[{
        //     title: "Неверный персональный ключ.",
        //     message: "проверьте правильность ключа.",
        //     level: "error",
        //     sticky: false
        //   }]})
        // }
        // if (data.authkey) {
        //   if(remember){
        //     await localStorage.setItem('authkey', data.authkey);
        //     await localStorage.setItem('privateKey', this.loginForm.privateKey);
        //   }
        //
        //   this.privateKey = this.loginForm.privateKey
        //   this.stores.router.push('/')
        //   this.authkey = data.authkey
        //   this.authorized = true
        //   this.loading = false
        //   this.stores.db.getFilters()
        // }
      },
      fail: (alerts) => {
        // if (!alerts) return;
        // console.log("FAIL", alerts);
        if (!alerts.forEach) return;
        alerts.forEach((alert) => {
          if (alert.code != 200) {
            setTimeout(() => {
              this.logout();
            }, 3000);
          }
        });
        this.loading = false;
      },
      always: (data) => {
        this.loading = false;
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод получения профиля врача
  */
  async getProfile() {
    let data = {
      // key: AUTH_SERVICE_KEY,
      authkey: this.authkey,
      active_language: this.active_language,
    };

    return POST({
      path: `tools/DoctorGet`,
      data,
      success: async (data) => {
        // console.log(data);
        let { id, fio, firstname, lastname, patronymic, sex, snils, diploms, licenses, emails, phone } = data;
        await _.assignIn(this.profile, {
          id,
          fio,
          firstname,
          lastname,
          patronymic,
          sex,
          snils,
          // diploms,
          // licenses,
          // emails,
          // phone,
        });
        diploms.forEach((item, i) => {
          this.profile.diploms.push(item);
        });
        licenses.forEach((item, i) => {
          this.profile.licenses.push(item);
        });
        emails.forEach((item, i) => {
          this.profile.emails.push(item);
        });
        phone.forEach((item, i) => {
          this.profile.phone.push(item);
        });
      },
      fail: (alerts) => {
        // console.log("FAIL", alerts);
      },
      always: (data) => {
        this.loading = false;
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод получения ключа (authkey)
  */
  async fakelogin() {
    this.loginForm.key = AUTH_SERVICE_KEY;
    let { privateKey, remember, ...data } = this.loginForm;
    // data.active_language = active_language
    return await POST({
      path: createCsServerUrl(`/api/user/authorization`),
      data,
      success: async (data) => {
        // console.log('SUCCESS', data);
        // this.makeAlerts({ alerts:[{
        //   title: "Введите ключ.",
        //   message: "Для входа в систему необходимо ввести ваш персональный ключ. Если у вас его нет, обратитесь к поставщику ПО.",
        //   level: "info",
        //   sticky: false
        // }]})
        if (data.authkey) {
          // console.log('HERE');
          // if(remember){
          //   await localStorage.setItem('authkey', data.authkey);
          //   await localStorage.setItem('privateKey', this.loginForm.privateKey);
          // }

          this.privateKey = this.loginForm.privateKey;
          // this.stores.router.push('/')
          this.authkey = data.authkey;
          // this.authorized = true
          this.loading = false;
          this.login();
          return true;
          // this.stores.db.getFilters()
        }
        // if (data.authkey) {
        //   if(remember){
        //     await localStorage.setItem('authkey', data.authkey);
        //     await localStorage.setItem('privateKey', this.loginForm.privateKey);
        //   }
        //
        //   this.privateKey = this.loginForm.privateKey
        //   this.stores.router.push('/')
        //   this.authkey = data.authkey
        //   this.authorized = true
        //   this.loading = false
        //   this.stores.db.getFilters()
        // }
        return true;
      },
      fail: (alerts) => {
        this.loading = false;
        return false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        //console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод получения данных при входе по ссылке из МИСа
  * @param data - данные, полученные методом autologin
  */
  async fakeMisLogin(data) {
    this.loginForm.key = AUTH_SERVICE_KEY;
    this.loginForm.privateKey = data.args.key;
    const args = data.args;
    // this.stores.router.push("/");

    this.drugStructure = {
      ...this.drugStructure,
      clinic_code: args.clinic_code,
      clinic_id: args.clinic_id,
      clinic_name: args.clinic_name,
      dep_id: args.dep_id,
      dep_code: args.dep_code,
      dep_name: args.dep_name,
      doctor_code: args.doctor_code,
      doctor_id: args.doctor_id,
      doctor_name: args.doctor_name,
    };
    this.doctor.id = args.doctor_id;
    this.doctor.name = args.doctor_name;
    this.authkey = args.authkey;
    this.key = args.key;
    this.clinic = observable({ id: args.clinic_id, name: args.clinic_name });
    if (!this.bottomview_disabled) {
      this.makeAlerts({
        alerts: [
          {
            title: `${this.t("welcome") || "Здравствуйте"}, ${this.doctor.name}`,
            message: "",
            level: "info",
            sticky: false,
          },
        ],
      });
    }
    this.authorized = true;
    this.privateKey = this.loginForm.privateKey;
    // return this.login();
    // data.active_language = active_language
    this.misLinkLogin = true;
    // this.stores.tools.getUnitsPrimary();
    // this.stores.tools.getUnitsPharm();
    // this.stores.tools.getUnitsSchedule();

    await this.stores.patients.request(args.patient_id);
    await this.stores.patients.getList();
    this.loading = false;
  }

  /**
  // метод входа по персональному ключу (для кробки)
  * @param privateKey - персональный ключ пользователя
  */
  async fakePrivateKeylogin(privateKey) {
    this.loginForm.key = AUTH_SERVICE_KEY;
    if (privateKey == undefined) privateKey = this.loginForm.privateKey;
    if (privateKey && !this.loginForm.privateKey) this.loginForm.privateKey = privateKey;
    let data = {
      application: 108,
      key: privateKey,
    };
    await fetch(createCsServerUrl(`/api/umkb/checkRights`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if ((data.level = "success")) {
          this.privateKey = this.loginForm.privateKey;
          localStorage.setItem("privateKey", privateKey);
          // this.stores.router.push('/')
          // this.authorized = true
          this.loading = false;
          return this.login();
        }
      });

    // data.active_language = active_language
    return;
    return await POST({
      path: `https://cs.socmedica.com/api/umkb/checkRights`,
      data,
      success: async (data) => {
        alert();
        // this.makeAlerts({ alerts:[{
        //   title: "Введите ключ.",
        //   message: "Для входа в систему необходимо ввести ваш персональный ключ. Если у вас его нет, обратитесь к поставщику ПО.",
        //   level: "info",
        //   sticky: false
        // }]})
        if ((data.level = "success")) {
          // console.log('HERE');
          // if(remember){
          //   await localStorage.setItem('authkey', data.authkey);
          //   await localStorage.setItem('privateKey', this.loginForm.privateKey);
          // }
          this.privateKey = this.loginForm.privateKey;
          // this.stores.router.push('/')
          this.authkey = data.authkey;
          // this.authorized = true
          this.loading = false;
          return this.login();
          // this.stores.db.getFilters()
        }
        // if (data.authkey) {
        //   if(remember){
        //     await localStorage.setItem('authkey', data.authkey);
        //     await localStorage.setItem('privateKey', this.loginForm.privateKey);
        //   }
        //
        //   this.privateKey = this.loginForm.privateKey
        //   this.stores.router.push('/')
        //   this.authkey = data.authkey
        //   this.authorized = true
        //   this.loading = false
        //   this.stores.db.getFilters()
        // }
        return true;
      },
      fail: (alerts) => {
        alert("fail");
        this.loading = false;
        return false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        //console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод регистрации пользователя
  */
  async signin() {
    this.signinForm.key = AUTH_SERVICE_KEY;

    return POST({
      path: createCsServerUrl(`/api/registration/send`),
      data: this.signinForm,
      success: async (data) => {
        // console.log('SUCCESS', data);
        this.stores.router.push("/login");
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // проверка наличия пользователя в системе (по email)
  */
  async checkUserUmkb() {
    // this.signinForm.key = AUTH_SERVICE_KEY;
    let dataSend = {
      key: CHECK_REG_KEY,
      email: this.signinForm.email,
    };
    return POST({
      path: createCsServerUrl(`/api/user/getUserInfoByEmail`),
      data: dataSend,
      success: async (data) => {
        // console.log(data);
        if (data && data.alerts && data.alerts[0].code == "200") {
          this.loginForm.email = _.cloneDeep(this.signinForm.email);
          this.signinForm.isEmailReg = false;
          this.signinForm.showUserAlreadyExistsDialog = true;
          // this.stores.router.push("/login");
        } else {
          this.signinForm.isEmailReg = true;
        }
        // console.log('SUCCESS', data);
        // this.loading = false
        // this.signinForm.isEmailReg = true
        // this.stores.router.push('/login')
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: (alerts) => {
        this.loading = false;
        this.signinForm.isEmailReg = true;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        if (data && data.alerts && data.alerts[0].code == "200") {
          this.makeAlerts({
            alerts: [
              {
                title: this.t("attention"),
                message: this.t("you_already_registered") + " " + this.t("go_to_login"),
                button: {
                  text: this.t("jump"),
                  action: () => {
                    this.stores.router.push("/login");
                    // this.loginForm.email = this.signinForm.email;
                    this.signinForm.email = "";
                  },
                  closeByClick: true,
                },
                level: "warning",
                sticky: true,
              },
            ],
          });
        } else {
          // this.makeAlerts(data);
        }

        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод подтверждения email
  */
  async confirm() {
    this.confirmForm.key = AUTH_SERVICE_KEY;
    return POST({
      path: createCsServerUrl(`/api/registration/confirmemail`),
      data: this.confirmForm,
      success: async (data) => {
        // console.log("SUCCESS", data);
        this.stores.router.push("/login");
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод запроса письма для подтвержления email
  */
  async getConfirm() {
    this.getConfirmForm.key = AUTH_SERVICE_KEY;
    return POST({
      path: createCsServerUrl(`/api/registration/getconfirmemail`),
      data: this.getConfirmForm,
      success: async (data) => {
        this.stores.router.push("/confirm");
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: (alerts) => {
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод запроса письма для сброса пароля
  */
  async resetPass() {
    this.resetPassForm.key = REQUEST_PASS_KEY;
    return POST({
      path: createCsServerUrl(`/api/user/recovery`),
      data: this.resetPassForm,
      success: async (data) => {
        // console.log({ data });
        this.stores.router.push("/newpass");
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: (alerts) => {
        // console.log({ alerts });
        this.loading = false;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        // console.log({ data });
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод задания нового пароля
  */
  async newPass() {
    this.newPassForm.key = RESET_PASS_KEY;
    return POST({
      path: createCsServerUrl(`/api/user/resetPassword`),
      data: this.newPassForm,
      success: async (data) => {
        // console.log("SUCCESS", data);
        this.stores.router.push("/login");
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
        return true;
      },
      fail: (alerts) => {
        // console.log({ alerts });
        this.loading = false;
        if (alerts && alerts[0] && alerts[0].code == "403") return false;
        return true;
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        // console.log({ data });
        this.makeAlerts(data);
        // console.log('ALWAYS', data);
      },
    });
  }

  /**
  // метод разлогинивания (уничтожает authkey)
  */
  async logout() {
    let authkey = await localStorage.getItem("authkey");
    return GET({
      path: createCsServerUrl(`/api/user/authexit`),
      data: {
        authkey,
      },
      always: async (data) => {
        this.makeAlerts(data);
        await localStorage.setItem("authkey", "");
        await localStorage.setItem("privateKey", "");
        this.authkey = null;
        this.stores.router.push("/login");
        window.location.reload(false);
      },
    });
  }

  /**
  // метод для отображения текстовой страки на нужном языке
  * @param k - текстовый ключ строки
  */
  t = (k) => {
    const defaultTexts = i18n.res;
    const ecptext = this?.UIText?.ecptext || {};
    // console.log({ defaultTexts, ecptext });
    const translation = { ...defaultTexts, ...ecptext };
    return translation[k];
  };
}
export default Actions;
