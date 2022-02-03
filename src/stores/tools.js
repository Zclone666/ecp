import { observable, action, autorun, computed, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";

class Tools {
  ready = false;
  searchReady = true;

  loadingCounter = 0;

  searchClinicRows = [];

  names = {};
  shortnames = {};

  units = {};
  unitarrs = {};

  unitsPharm = {};
  unitsPrimary = {};
  unitsComplex = {};
  unitsSchedule = {
    freq: {},
    duration: {},
  };

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      searchReady: observable,
      loadingCounter: observable,
      searchClinicRows: observable,
      names: observable,
      shortnames: observable,
      units: observable,
      unitarrs: observable,
      unitsPharm: observable,
      unitsPrimary: observable,
      unitsComplex: observable,
      unitsSchedule: observable,
    });

    this.stores = stores;
    this.router = stores.router;
    autorun(() => {});
  }

  async getUnitsPharm(units) {
    units = units || [];

    if (units.length > 0 && units.every((unit) => _.keys(this.units).includes(unit))) {
      return;
    }

    let { active_language } = this.stores.actions;
    let data = {
      units,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `tools/UnitsPharm`,
      data,
      success: async (data) => {
        // console.log(data);
        let { names, nameshort, units, unitrefs, unitpharm } = data;
        this.unitsPharm = data;
        // kostyl
        // if(units[99])
        if (units[250 || units[99]]) {
          names[99] = this.stores.actions.t("percent");
          nameshort[99] = "%";
          unitpharm.push(99);
          units[99] = _.cloneDeep(units[250]);
          units[99][0].value = 10000;
        }
        // end kostyl

        await this.setNames(names, nameshort);
        this.setUnits(units, unitrefs, unitpharm);
        this.stores.actions.loading = false;
      },
      fail: (alerts) => {},
      always: (data) => {
        this.stores.actions.loading = false;
      },
    });
  }

  async stepByStepLoading(fn, arr) {
    if (this.loadingCounter < arr.length) {
      this.loading = true;
      // console.log(arr[this.loadingCounter]);
      await fn(arr[this.loadingCounter]);
      this.loadingCounter++;
      return this.stepByStepLoading(fn, arr);
    } else {
      this.loadingCounter = 0;
      this.loading = false;
      return true;
    }
    // return this.stepByStepLoading( fn, arr )
  }

  async getUnitsPrimary() {
    let { active_language } = this.stores.actions;
    let data = {
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `tools/UnitsPrimary`,
      data,
      success: async (data) => {
        let { names, nameshort, units, unitrefs } = data;
        if (units) this.unitsPrimary = units;
        //this.setNames(names, nameshort)
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  convertFromBaseUnitToUnit(baseUnitId, unitId, value) {
    const units = this.unitsPrimary;
    // console.log({ baseUnitId, unitId, value, units });
    if (baseUnitId == unitId || !units || !baseUnitId || !unitId) return value;
    const convertedValue =
      value *
      units[baseUnitId].find((u) => {
        // console.log({ "u.id": u.id, unitId }, u.id == unitId);
        return u.id == unitId;
      }).value;
    // console.log({ convertedValue });
    return convertedValue;
  }

  convertFromUnitToBaseUnit(unitId, baseUnitId, value) {
    const units = this.unitsPrimary;
    // console.log({ baseUnitId, unitId, value, units });
    if (baseUnitId == unitId || !units || !baseUnitId || !unitId) return value;
    const convertedValue =
      value /
      units[baseUnitId].find((u) => {
        // console.log({ "u.id": u.id, unitId }, u.id == unitId);
        return u.id == unitId;
      }).value;
    // console.log({ convertedValue });
    return convertedValue;
  }

  async getUnitsComplex(units) {
    let { active_language } = this.stores.actions;
    let data = {
      units: units,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `tools/UnitsComplex`,
      data,
      success: async (data) => {
        console.log("DATA", data);
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  async getUnitsSchedule() {
    let { active_language } = this.stores.actions;
    let data = {
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `info/Schedule`,
      data,
      success: async (data) => {
        // console.log('DATA', data);
        let { freq, duration } = data;
        this.unitsSchedule.freq = freq;
        this.unitsSchedule.duration = duration;
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  getBaseUnit = (unitId) => {
    let unit = this.units[unitId];
    // console.log({ unit });
    return unit.arr;
  };

  setUnits = (units, unitrefs, unitpharm) => {
    // console.log("units: ", this.units);
    // _.keys(unitrefs).forEach( refkey => {
    //   this.unitarrs.push([ refkey, ...unitrefs[refkey] ])
    // })
    // console.log({ unitpharm });
    _.keys(units).forEach((unitkey) => {
      let unit = units[unitkey];
      let newunit = {
        name: this.names[unitkey],
        shortname: this.shortnames[unitkey],
        contains: unit,
        id: unitkey,
        type: "simple",
        arr: null,
        show: unitpharm.includes(unitkey) || false,
      };

      if (unitrefs[unitkey])
        this.unitarrs[unitkey] = newunit.show ? [unitkey, ...unitrefs[unitkey]] : unitrefs[unitkey];
      if (unit.length < 1) {
        newunit.type = "base";

        newunit.arr = unitkey;
      } else if (unit.length > 1) {
        newunit.type = "complex";
        _.keys(unitrefs).forEach((refkey) => {
          if (unitrefs[refkey].includes(unitkey)) newunit.arr = refkey;
        });
      } else {
        _.keys(unitrefs).forEach((refkey) => {
          if (unitrefs[refkey].includes(unitkey)) newunit.arr = refkey;
        });
      }

      if (unitrefs[unitkey]) {
        // this.unitarrs[unitkey] = (newunit.show ? [ unitkey, ...unitrefs[unitkey] ] : unitrefs[unitkey])
        this.unitarrs[unitkey] = [unitkey, ...unitrefs[unitkey]];
      }
      // if(unitkey === '42'){
      //   console.log(newunit);
      // }
      // if(unitkey === '42') console.log(this.unitarrs[unitkey]);
      this.units[unitkey] = newunit;
    });
    //console.log(this.units);
  };

  getUnitArr = (unitId) => {
    let result = {};
    // console.log({unitId});
    // console.log('unitarrs', this.unitarrs);
    // console.log(this.units[unitId]);
    if (this.units[unitId] && this.units[unitId].arr && this.unitarrs[this.units[unitId].arr]) {
      // console.log('here', this.unitarrs[this.units[unitId].arr]);
      this.unitarrs[this.units[unitId].arr].forEach((arrKey) => {
        // console.log({ type1: this.units[unitId].type, type2: this.units[arrKey].type});
        if (this.units[unitId].type === this.units[arrKey].type || this.units[arrKey].type !== "complex") {
          result[arrKey] = this.units[arrKey];
        }
      });
    }
    // console.log(result);
    return result;
  };

  async searchClinic(text) {
    this.searchReady = false;
    let { active_language } = this.stores.actions;
    let data = {
      text,
      // lib: '62, 52', //'61, 25' - заболевания
      // service: "43",
      // chain: 0
      active_language,
      limit: 20,
    };

    // "key": "string",
    // "text": "string",
    // "lib": "string",
    // "chain": 0,
    // "security_key": "string",
    // "authkey": "string",
    // "limit": 0

    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    this.searchClinicRows = observable([]);

    return POST({
      path: `search/Clinics`,
      data,
      success: async (data) => {
        // console.log(data);
        if (data && data.concepts) {
          data.concepts.forEach((item, i) => {
            this.searchClinicRows.push(item);
          });
        }
        this.searchReady = true;
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

  async setNames(names, shortnames) {
    this.names = await _.extend(this.names, names);
    if (shortnames) this.shortnames = await _.extend(this.shortnames, shortnames);
  }

  async loadGenPassport(idPatient, mutations) {
    this.stores.actions.loading = true;
    let { active_language, authkey, privateKey } = this.stores.actions;
    const data = {
      authkey,
      active_language,
      idPatient,
      mutations,
      key: privateKey,
    };
    return POST({
      path: "Tools/PatientNewMutations",
      data,
      success: async (res) => {
        // this.stores.actions.makeAlerts(res);
        this.stores.actions.loading = false;
        if (this.stores.patients.current) this.stores.patients.current.genpassport_exist = true;
        if (this.stores.actions.drugStructure?.patient)
          this.stores.actions.drugStructure.patient.genpassport_exist = true;
      },
      fail: (res) => {
        // this.stores.actions.makeAlerts(res);
        this.stores.actions.loading = false;
      },
      always: (res) => {
        this.stores.actions.makeAlerts(res);
        this.stores.actions.loading = false;
      },
    });
  }

  async ReportError(message) {
    this.stores.actions.loading = true;
    let { active_language, authkey, makeAlerts } = this.stores.actions;

    const data = {
      authkey,
      active_language,
      message,
    };

    data.key = this.stores.actions.privateKey;
    return POST({
      path: "Tools/ReportError",
      data,
      success: async (data) => {
        this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
      fail: (alerts) => {
        this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
      always(data) {},
    });
  }

  round = (val, dec = 3) => {
    let delimiter = Math.pow(10, dec);
    return Math.floor(val * delimiter) / delimiter;
  };

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
export default Tools;
