import { observable, action, autorun } from 'mobx';
import { GET, POST, PUT, PROJECT_TITLE } from '../lib/connect'
import _ from 'lodash';
import moment from 'moment'

export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
export const RESET_PASS_KEY = "9152ea8756f8f2b3";
export const REQUEST_PASS_KEY = "c47ee7e666d6be7e";
//export const AUTH_REG_KEY = "c47ee7e666d6be7e";
class Actions {

  @observable view = false;
  @observable device = null;
  @observable mobilewarning = false;
  @observable height = 0;

  @observable projectTitle = PROJECT_TITLE;

  @observable authorized = false;
  @observable loading = false;
  @observable dataLoading = false;
  @observable authkey = null;
  @observable privateKey = null;

  @observable active_language = 'ru';

  @observable pages = {}
  @observable currentPage = null

  @observable filtersChanged = false

  @observable alerts = {};

  @observable elements = {}
  @observable buttonTexts = {}
  @observable UIText = {}

  @observable makeLiquids = false
  @observable isLiquidsOk = false

  @observable checkData = {
    lpu: [],
    doctor: []
  }

  @observable doctor = {
    id: null,
    name: null
  }

  @observable loginForm = {
    email: '',
    password: '',
    privateKey: '',
    remember: true,
    hidden: true
  }

  @observable signinForm = {
    email: "",
    password: "",
    lastName: "",
    firstName: "",
    middleName: "",
    lpuName: '',
    department: '',
    hidden: true
  }

  @observable confirmForm = {
    email: "",
    code: "",
    service: ''
  }

  @observable getConfirmForm = {
    email: ""
  }

  @observable resetPassForm = {
    email: "",
    key: ''
  }

  @observable newPassForm = {
    email: "",
    recoveryCode: "",
    newPassword: "",
    key: ''
  }

  @observable clinrecCheckerData = {

  }
  @observable clinrecCheckerStep = 1

  @observable stepsData = {
    key: null,
    way: null,
    step: null,
    form: null,
    method: null,
    pack: {},
    dosage: [],
    value: null,
    helpers: {}
  }

  @observable patientForm = {
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
    allergy: []
  }

  @observable patientPassport = {
    id: null,
    name: null,
    email: null,
    miscode: null,
    misid: null,
    fio: null
  }

  @observable scheduleForm = {
    dateStart: null,
    dateFinish: null,
    finishAlternate: null,
    clarifications: null, //уточнения
    interval: null,
    once: null,
    week: null,
    calendar: null,
    specials: null,
    format: 'interval'
  }

  @observable calculatorForm = {
    dosage: [0],
    count: 1,
    dosageUnit: '248',
    dayCount: 1,
    fullDosage: [0],
    weightDosage: [0],
    dayDosage: [0],
    dayWeightDosage: [0]
  }

  @observable liquidForm = {
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
      durationUnit: '75',
      fullSpeed: [0],
      weightSpeed: [0],
      tintSpeed: [0],
      liquidSpeed: [0]
    },
    schedule: {
      dateStart: null,
      dateFinish: null,
      finishAlternate: null,
      clarifications: null, //уточнения
      interval: null,
      once: null,
      week: null,
      calendar: null
    }
  }

  @observable selectedDrug = null
  @observable selectedConflict = null
  @observable activeDrugs = []
  @observable activeConflicts = []

  @observable drugStructure = {
    key: "key",
    device_id: null,
    clinic: {
      key: null,
      val: null,
    },
    department: {
      key: null,
      val: null
    },
    doctor: {
      key: null,
      val: null
    },
    patient: {
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
      pregnancy: false,
      gestation: null,
      trimester: null,
      lactation: false,
      driving: false,
      alcohol: false,
      allergy: []
    },
    // save_recipe: false,
    active_language: "ru",
    liquids: [],
    drugs: [],
    text: null
  }



  constructor({ stores }) {
    this.stores = stores;

    this.autologin()
    autorun(() => {
      // if(this.stepsData.dosage && this.stepsData.dosage[0] && this.stepsData.dosage[0].value_1){
      //
      //   this.stores.dosages.setStepDosage()
      // }
    })

    autorun(() => {
      if(this.loading){
        setTimeout(() => {
          this.loading = false
        }, 5000)
      }
    });
    // autorun(() => {
    //   console.log(this.currentPage);
    //   if(this.currentPage && _.keys(this.pages).length > 0){
    //     this.stores.db.clearData()
    //     this.stores.db.getFilters()
    //   }
    // });
    // this.onResize()
    // window.onresize = this.onResize
  }
  async setLang(lang){
    if(lang !== this.active_language){
      this.drugStructure.active_language = this.active_language = lang
      await localStorage.setItem('lang', lang)
      window.location.reload(false);
    }
  }
  onResize(){
    // console.log('resize');
    let h = window.innerHeight;
    let w = window.innerWidth;
    let v = h > w ? 'portrait' : 'landscape';
    let d = (w < 480 && v === 'portrait') || (w < 1024 && v === 'landscape') ?
      'mobile' : (
        (w < 1280 && v === 'portrait') || (w < 1280 && v === 'landscape') ?
          'tablet' : 'pc'
        );
    this.mobilewarning = (d === 'mobile' || d === 'tablet');
    this.view = v;
    this.device = d;
    // console.log(d);
    this.height = h;
  }


  clearSteps(step){
    if( step === 1 ){

    }
    if( step == 2 ){

    }
    // stepsData = {
    //   way: null,
    //   step: null,
    //   lf: null,
    //   dosage: null,
    //   method: null,
    //
    // }
  }

  makeAlerts(data){
    if(data.alerts && data.alerts.length > 0){
      data.alerts.forEach((item, i) => {
        let key = Math.floor(Math.random() * 10000)
        this.alerts[key] = item
      })
    }

  }

  @action async selectPatient(row, from){
    row.key = moment().format('x').toString()
    this.patientForm[from] = await _.unionWith(this.patientForm[from], [row], (a, b) => a.id === b.id);
    this.stores.db.clearData()
    return true
  }
  @action async unselectPatient(row, from){
    this.patientForm[from] = await _.xorWith(this.patientForm[from], [row], (a, b) => a.id === b.id);
    this.stores.db.clearData()
    return true
  }

  async getObject(name) {
    let { active_language } = this
    return POST({
      path: `info/${name}`,
      data: {
        active_language
      },
      success: async (data) => {
        let { alert, ...values } = data
        //this[name]
        Object.assign(this[name], { ...values });
        // console.log(this[name]);
      },
      fail: alerts => {
        this.loading = false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }

  getElement = (name, value) => {
    // console.log({ el: this.elements, name, value});
    let text = ''
    this.elements[name].forEach(( item, i ) => {
      if( (item.from < value && value <= item.to) || item.to === value ){
        text = item.name
      }
    })
    return text
  }

  async autologin(){

    this.drugStructure.active_language = this.active_language = await localStorage.getItem('lang') || null;
    if(!this.active_language){
      this.drugStructure.active_language = this.active_language = 'ru'
      await localStorage.setItem('lang', 'ru')
    }

    this.getObject('buttonTexts')
    this.getObject('elements')
    this.getObject('UIText')

    this.loading = true
    this.authkey = await localStorage.getItem('authkey') || '';

    if(this.stores.router.values.protocol) {
      this.stores.warnings.protocol(this.stores.router.values.protocol)
      this.loading = false
      return
    }


    if(!this.authkey && this.stores.router.match.name !== 'auth') {
      this.loading = false
      this.stores.router.push('/login')
      return
    }
    if(!this.authkey || this.authkey == null || this.authkey == 'null') {
      this.loading = false
      this.stores.router.push('/login')
      return
    }
    //// FIXME: for safari fucking shit
    return GET({
      path: `https://cs.socmedica.com/api/user/authCheck`, //'https://dev.socmedica.com/2/api/stats/CheckAuthTrue', //
      data: {
        authkey: this.authkey,
        key: AUTH_SERVICE_KEY
      },
      success: async data => {
        //console.log('logged', data);
        this.loginForm.privateKey = this.privateKey = await localStorage.getItem('privateKey') || '';
        this.login()
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
        await localStorage.setItem('authkey', null);
        this.stores.router.push('/login')
        this.authorized = false
        this.loading = false
      },
      always: (data) => {
        this.makeAlerts(data)

        this.loading = false
      }
    });
  }

  async login() {
    //this.loginForm.key = AUTH_SERVICE_KEY;
    let { privateKey, remember } = this.loginForm
    let { active_language } = this
    let data = {
      //key: privateKey,
      authkey: this.authkey,
      active_language
    }
    return POST({
      path: `auth/Check`,
      data,
      success: async (data) => {
        // console.log('SUCCESS', data);
        // if( data && data.level == 'success' ){
          let { doc, id, lpu, patients, names } = data
          this.stores.patients.makeList({ patients, names })

          lpu && lpu.forEach((item, i) => {
            this.checkData.lpu.push({id: item, name: names[item]})
          });
          doc && doc.forEach((item, i) => {
            this.checkData.doctor.push({id: item, name: names[item]})
          });


          this.doctor = {
            id: (doc && doc[0]) || null,
            name: ((doc && doc[0]) && names[doc[0]]) || null
          }

          this.privateKey = this.loginForm.privateKey
          this.stores.router.push('/')
          this.authorized = true
          this.loading = false
          //this.stores.db.getPages()
          //this.stores.db.getFilters()
          if(remember){
            await localStorage.setItem('authkey', this.authkey);
            await localStorage.setItem('privateKey', this.loginForm.privateKey);
          }
          this.stores.tools.getUnitsPrimary()
          this.stores.tools.getUnitsPharm()
          this.stores.tools.getUnitsSchedule()
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
      fail: alerts => {
        console.log('FAIL', alerts);
        alerts.forEach((alert) => {
          if(alert.code != 200) this.logout()
        })
      },
      always: (data) => {
        this.loading = false
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }
  async fakelogin() {
    this.loginForm.key = AUTH_SERVICE_KEY;
    let { privateKey, remember, ...data } = this.loginForm
    // data.active_language = active_language
    return await POST({
      path: `https://cs.socmedica.com/api/user/authorization`,
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

           this.privateKey = this.loginForm.privateKey
           // this.stores.router.push('/')
           this.authkey = data.authkey
           // this.authorized = true
           this.loading = false
           return this.login()
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
        return true
      },
      fail: alerts => {
        this.loading = false
        return false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        //console.log('ALWAYS', data);
      }
    });
  }
  async signin() {
    this.signinForm.key = AUTH_SERVICE_KEY;

    return POST({
      path: `https://cs.socmedica.com/api/registration/send`,
      data: this.signinForm,
      success: async (data) => {
        // console.log('SUCCESS', data);
        this.stores.router.push('/login')
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: alerts => {
        this.loading = false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }

  async confirm() {
    this.confirmForm.key = AUTH_SERVICE_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/registration/confirmemail`,
      data: this.confirmForm,
      success: async (data) => {
        console.log('SUCCESS', data);
        this.stores.router.push('/login')
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: alerts => {
        this.loading = false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }

  async getConfirm() {
    return POST({
      path: `https://cs.socmedica.com/api/registration/getconfirmemail`,
      data: this.getConfirmForm,
      success: async (data) => {
        console.log('SUCCESS', data);
        this.stores.router.push('/confirm')
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: alerts => {
        this.loading = false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }

  async resetPass() {
    this.resetPassForm.key = REQUEST_PASS_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/user/recovery`,
      data: this.resetPassForm,
      success: async (data) => {
        console.log('SUCCESS', data);
        this.stores.router.push('/newpass')
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: alerts => {
        this.loading = false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }

  async newPass() {
    this.newPassForm.key = RESET_PASS_KEY;
    return POST({
      path: `https://cs.socmedica.com/api/user/resetPassword`,
      data: this.newPassForm,
      success: async (data) => {
        console.log('SUCCESS', data);
        this.stores.router.push('/login')
        // if (data.authkey) {
        //   await localStorage.setItem('authkey', data.authkey);
        //   this.authkey = data.authkey
        // }
      },
      fail: alerts => {
        this.loading = false
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }

  async logout() {
    return GET({
      path: `https://cs.socmedica.com/api/user/authexit`,
      data: {
        authkey: localStorage.getItem('authkey')
      },
      always: async (data) => {
        this.makeAlerts(data)
        await localStorage.setItem('authkey', '');
        await localStorage.setItem('privateKey', '');
        this.authkey = null
        this.stores.router.push('/login')
        window.location.reload(false);
      }
    });
  }
}
export default Actions;
