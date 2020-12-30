import Router from '../router';
import routes from '../router/routes';
import DB from './db';
import Actions from './actions';
import Warnings from './warnings';
import Diseases from './diseases';
import Patients from './patients';
import Recipes from './recipes';
import Drugs from './drugs';
import Dosages from './dosages';
import Tools from './tools';
import Analogs from './analogs';
import DrugInfo from './druginfo';
import Clinrecs from './clinrecs';


let stores = {};
stores.actions = new Actions({stores});
stores.db = new DB({stores});

stores.warnings = new Warnings({stores});
stores.diseases = new Diseases({stores});
stores.patients = new Patients({stores});
stores.recipes = new Recipes({stores});
stores.drugs = new Drugs({stores});
stores.dosages = new Dosages({stores});
stores.tools = new Tools({stores});
stores.analogs = new Analogs({stores});
stores.druginfo = new DrugInfo({stores});
stores.clinrecs = new Clinrecs({stores});

stores.router = new Router({stores, routes});
window.stores = stores;
export default stores;
