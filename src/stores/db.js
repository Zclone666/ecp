import { observable, action, autorun, computed } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";
// import { colors } from '../components/Charts/colorPallette'

const colorPallette = ["#007b2b", "#b0d512", "#03529b", "#fff42b", "#ffca2f", "#fc7301", "#f42a03"];

class DB {
  @observable ready = false;

  @observable searchReady = true;

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    autorun(() => {});
  }
  clearData(withSelects, withWarnings) {
    this.stores.actions.selectedDrug = null;
    this.stores.actions.selectedConflict = null;
    this.stores.actions.activeConflicts = [];
    this.stores.actions.activeDrugs = [];
    this.stores.actions.stepsData = {
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
    this.stores.drugs.searchRows = observable([]);

    if (withWarnings) {
      this.stores.warnings.warning.clear();
      this.stores.warnings.icons = observable({});
      this.stores.warnings.groups = observable({});
      this.stores.warnings.info.names = observable({});
      this.stores.warnings.info.description = observable({});
      this.stores.warnings.info.literature = observable({});
      this.stores.warnings.info.outcome = observable({});
      this.stores.warnings.info.urls = observable({});
    }

    if (withSelects) {
      this.stores.drugs.deletedRows = observable([]);
      this.stores.drugs.deletedLiquids = observable([]);
      this.stores.drugs.selectedRows = observable([]);
      this.diseaseRows = observable([]);
      this.allergyRows = observable([]);
      // this.stores.dosages.dosage.clear();
      this.stores.drugs.drug.clear();
    }
  }
}
export default DB;
