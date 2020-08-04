// import _forEach from 'lodash/forEach';
// import _merge from 'lodash/merge';
// import _template from 'lodash/template';
// import moment from 'moment';
import axios from 'axios';

import SERVER from '../constants'

export const PROJECT_TITLE = "ЭКФ";
export const PRE_PATH  = '';
export const PRODUCTION = false;
export const API_SERVER = SERVER === 'prod' ? "https://prod.socmedica.com/version/api/stats" : "https://ecp2.socmedica.dev/api";

export const SERVICE = "4";//43
export const AUTH_SERVICE_KEY = "7e649ecb733d2af1";
export const AUTH_REG_KEY = "fe2ddc03f0c34724";

// export const SERVICE_KEY = "be1fe504f12126fd";
export const CREATE_API_URL = ({ path }) => {
  if (path.includes('://')) {
    return path;
  }
  // if (process.env.REACT_APP_IS_LOCAL === true) {
  //   const pathArray = path.split('?');
  //   return `/proxy/${pathArray[0]}.json`;
  // }
  // if (process.env.NODE_ENV === 'production') {
  //   return `/proxyAPI.php?path=${path}`;
  // }
  return `${API_SERVER}/${path}`;
};

export const serialize = (obj, prefix) => {
  let str = [];
  let p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      let k = prefix ? prefix : p;
      let v = obj[p]; // prefix + "[" + p + "]"
      str.push(v !== null && typeof v === "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  if (str.length) {
    return '?' + str.join("&").replace('?', '');
  }
  return '';
};

const FETCH = ({ data, success, fail, always, method, path, headers, options }) => {
  // const isChild = isChildWindow();
  let authkey = localStorage.getItem('authkey') || '';
  let data2 = {
    ...data,
    service: SERVICE,
    //key: AUTH_SERVICE_KEY
  };
  if (authkey) {
      // data2.authkey = authkey;
  }
  if(!options) options = {}
  return axios({
    method,
    ...options,
    // withCredentials: true,
    url: CREATE_API_URL({ path }),
    data: data2,
    headers: headers || { 'Content-Type': 'application/json;charset=UTF-8' },
  }).then(response => {
      let alerts = [];
      if (response.data.alert || response.data.alerts || response.data.message || (response.data[0] && response.data[0].message)) {
        if (response.data.alert) {
          alerts = [response.data.alert];
          delete response.data.alert;
        }
        if (response.data.message) {
          alerts = [response.data.Message];
        }
        if (response.data.alerts) {
          alerts = [...response.data.alerts];
        }
        if (response.data[0] && response.data[0].message) {
          alerts = [...response.data];
        }
        alerts = alerts.length ? alerts : [{ message: response.data.toString() }];
        alerts = alerts.filter(alert => alert.message || alert.title);
      }
      response.data.alerts = alerts;
      let isError = false;
      response.data.alerts.forEach(alert => {
        if (alert.level === 'error') {
            isError = true;
        }
      });
      always && always(response.data)
      if (isError) {
        return (fail && fail(response.data.alerts))
        // return false
        // return;
      } else {
        return (success && success(response.data))
        // return true
      }
      // return (always && always(response.data))
      // return true
    }).catch(error => {
      console.log("axios error");
      console.log(error);
      // return false
    });
};
export function isChildWindow(checkWindow = window) {
    return checkWindow.parent !== checkWindow;
}
export const GET = params => FETCH({ ...params, method: 'get', path: `${params.path}${serialize(params.data)}` });
export const DELETE = params => FETCH({ ...params, method: 'delete' });
export const POST = params => FETCH({ ...params, method: 'post' });
export const PUT = params => FETCH({ ...params, method: 'put' });
