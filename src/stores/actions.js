import { observable, action, autorun } from 'mobx';
import { GET, POST, PUT, PROJECT_TITLE } from '../lib/connect'
import _ from 'lodash';

export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
class Actions {
  @observable projectTitle = PROJECT_TITLE;

  @observable authorized = false;
  @observable loading = false;
  @observable dataLoading = false;
  @observable authkey = null;
  @observable privateKey = null;

  @observable pages = {}
  @observable currentPage = null

  @observable filtersChanged = false

  @observable alerts = {};

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

  @observable filterForm = {
    authkey: "",
    //key: "",
    //SecurityKey: "4vvqd9zcewdc2a",
    page: 0,
    limitonpage: 1000,
    filters: observable({})
  }
  @observable filterTpl = {

  }

  @observable user = {
    oldPassword: '',
    password: '',
    newPassword: '',
    confirm_password: '',
    email: '',
    firstname: '',
    lastname: '',
    patronymic: '',
    reset_token: '',
    company_id: '',
    roles: [],
    phones: [],
    avatar: {},
    gender: false
  };

  @observable view = false;
  @observable device = false;
  @observable mobilewarning = false;

  constructor({ stores }) {
    this.stores = stores;

    this.autologin()

    autorun(() => {
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
    });
    // autorun(() => {
    //   console.log(this.currentPage);
    //   if(this.currentPage && _.keys(this.pages).length > 0){
    //     this.stores.db.clearData()
    //     this.stores.db.getFilters()
    //   }
    // });

  }
  clearFilters(){
    // this.filterForm = observable({
    //   authkey: "",
    //   //key: "",
    //   //SecurityKey: "4vvqd9zcewdc2a",
    //   page: 0,
    //   limitonpage: 1000,
    //   filters: observable({})
    // })
    // console.log('HEREs');
    this.filterForm.authkey = ''
    this.filterForm.page = 0
    this.filterForm.limitonpage = 1000
    this.filterForm.filters = observable({})
  }
  setCurrentPage(page){
    if(page){
      this.currentPage = page
      if(this.currentPage && _.keys(this.pages).length > 0){
        this.stores.db.clearData()
        this.stores.db.getFilters()
      }

    }

  }

  makeAlerts(data){
    if(data.alerts && data.alerts.length > 0){
      data.alerts.forEach((item, i) => {
        let key = Math.floor(Math.random() * 10000)
        this.alerts[key] = item
      })
    }

  }
  async autologin(){
    this.loading = true
    this.authkey = await localStorage.getItem('authkey') || '';

    if(!this.authkey && this.stores.router.match.name !== 'auth') {
      this.loading = false
      this.stores.router.push('/login')
      return
    }
    if(!this.authkey) {
      this.loading = false
      return
    }

    return GET({
      path: `https://cs.socmedica.com/api/user/authCheck`,
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
      fail: () => {
        // console.log('FAIL');
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
    let data = {
      key: privateKey,
      authkey: this.authkey
    }
    return POST({
      path: `CheckAuth`,
      data,
      success: async (data) => {
        // console.log('SUCCESS', data);
        if( data && data.level == 'success' ){
          this.privateKey = this.loginForm.privateKey
          this.stores.router.push('/')
          this.authorized = true
          this.loading = false
          this.stores.db.getPages()
          //this.stores.db.getFilters()
          if(remember){
            await localStorage.setItem('authkey', this.authkey);
            await localStorage.setItem('privateKey', this.loginForm.privateKey);
          }
        }else{
          this.makeAlerts({ alerts:[{
            title: "Неверный персональный ключ.",
            message: "проверьте правильность ключа.",
            level: "error",
            sticky: false
          }]})
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
      },
      fail: alerts => {
        // console.log('FAIL', alerts);
      },
      always: (data) => {
        this.makeAlerts(data)
        // console.log('ALWAYS', data);
      }
    });
  }
  async fakelogin() {
    this.loginForm.key = AUTH_SERVICE_KEY;
    let { privateKey, remember, ...data } = this.loginForm
    return await POST({
      path: `https://cs.socmedica.com/api/user/authorization`,
      data,
      success: async (data) => {
         //console.log('SUCCESS', data);
         this.makeAlerts({ alerts:[{
           title: "Введите ключ.",
           message: "Для входа в систему необходимо ввести ваш персональный ключ. Если у вас его нет, обратитесь к поставщику ПО.",
           level: "info",
           sticky: false
         }]})
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
