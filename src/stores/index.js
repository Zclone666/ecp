import Router from '../router';
import routes from '../router/routes';
import DB from './db';
import Actions from './actions';

let stores = {};
stores.actions = new Actions({stores});
stores.db = new DB({stores});
stores.router = new Router({stores, routes});
window.stores = stores;
export default stores;
