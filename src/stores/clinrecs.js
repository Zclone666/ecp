import { observable, action, autorun, computed, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";

class Clinrecs {
  ready = false;
  checker = {};
  clinrec = {};
  names = {};
  shortnames = {};
  druglist = [];
  drugToClinrecHashset = {};
  collectorAvailable = false;
  clinicalGuidelinesExist = {};

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      checker: observable,
      clinrec: observable,
      names: observable,
      shortnames: observable,
      druglist: observable,
      drugToClinrecHashset: observable,
      collectorAvailable: observable,
      clinicalGuidelinesExist: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    autorun(() => {});
  }

  resetClinrecs() {
    this.ready = false;
    this.checker = {};
    this.clinrec = {};
    this.names = {};
    this.shortnames = {};
    this.druglist = [];
    this.stores.actions.clinrecCheckerData = {};
    this.stores.actions.clinrecCheckerStep = 1;
    this.drugToClinrecHashset = {};
    this.clinicalGuidelinesExist = [];
  }

  async check(flag = false) {
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    this.stores.db.clearData(false, true);
    let data = _.cloneDeep(this.stores.actions.drugStructure);
    let drugsFull = Array.from(this.stores.drugs.drug.values());
    let liquidsFull = Array.from(this.stores.drugs.liquid.values());
    drugsFull.forEach((drugFull, i) => {
      let { helpers, ...drug } = drugFull;
      data.drugs.push(drug);
    });
    liquidsFull.forEach((liquidFull, i) => {
      let { helpers, ...liquid } = liquidFull;
      data.liquids.push(liquid);
    });

    // if(flag){
    data.checker = _.cloneDeep(this.stores.actions.clinrecCheckerData);
    // }

    data.active_language = active_language;

    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: "tools/clinicalGuidelines",
      data,
      success: async (data) => {
        if (flag) {
          this.clinrec = _.assignIn(this.clinrec, data.ClinRec);
          this.names = _.assignIn(this.names, data.names);
          this.shortnames = _.assignIn(this.shortnames, data.shortnames);
          this.stores.actions.clinrecCheckerData = _.assignIn(this.stores.actions.clinrecCheckerData, data.checker);
        } else {
          let pages = {};
          if (data && data.checker) {
            this.stores.actions.clinrecCheckerData = _.assignIn(this.stores.actions.clinrecCheckerData, data.checker);
            _.keys(data.checker).forEach((id, i) => {
              let question = data.checker[id];
              this.stores.actions.clinrecCheckerData[id].value =
                question.type === "Binary" ? question.value || 0 : question.value;
              if (pages[question.page]) {
                pages[question.page].arr.push({
                  id,
                  name: data.names[id],
                  type: question.type,
                  unit: question.unitid
                    ? data.shortnames[question.unitid] || data.names[question.unitid] || null
                    : null,
                  unitid: question.unitid,
                  value: question.value,
                });
              } else {
                pages[question.page] = {
                  name: data.names[question.page],
                  isReady: true,
                  arr: [
                    {
                      id,
                      name: data.names[id],
                      type: question.type,
                      unit: question.unitid
                        ? data.shortnames[question.unitid] || data.names[question.unitid] || null
                        : null,
                      unitid: question.unitid,
                      value: question.value,
                    },
                  ],
                };
              }
            });
          }
          this.checker = _.assignIn(this.checker, pages);
        }
        // console.log('DATA', data);

        this.stores.actions.loading = false;
      },
      fail: (alerts) => {},
      always: (data) => {
        this.stores.actions.loading = false;
        this.stores.actions.makeAlerts(data);
      },
    });
  }

  async getClinicalGuidelinesExist() {
    const data = {};
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    const patient = _.cloneDeep(this.stores.patients.current);
    // console.log("patient: ", this.stores.patients.current);
    data.disease = patient?.disease;

    return POST({
      path: "tools/clinicalGuidelinesExist",
      data,
      success: async (data) => {
        // console.log(data);
        if (data.result) this.clinicalGuidelinesExist = data.result;
      },
      fail: (alerts) => {},
      always: (data) => {
        this.stores.actions.loading = false;
        this.stores.actions.makeAlerts(data);
      },
    });
  }

  async getByFG(child) {
    this.ready = false;
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    let data = {
      drug: child.concept,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: "Drugs/ByFG",
      data,
      success: async (data) => {
        // console.log('DATA', data);
        let fakeId = moment().format("x").toString();
        if (data.concepts && data.concepts.length) {
          this.clinrec[fakeId] = {
            check: true,
            childs: [],
            comment: "",
            concept: null,
            dosage: [],
            drug: null,
            efficiency: null,
            form: [],
            intervalpreset: [],
            method: [],
            name: "выберите одну из схем лечения", //"группировка признаков с условием - ИЛИ",
            parents: child.id,
            schedulepreset: [],
            trust: child.trust,
            type: "OR",
            warning: child.warning,
          };
          // console.log({
          //   'child.id': child,
          //   'this.clinrec[child.id]': this.clinrec[child.id]
          // });
          this.clinrec[child.id].childs = [fakeId];
          let first = true;
          data.concepts.forEach((item, i) => {
            this.clinrec[item.id] = {
              check: first ? true : false,
              childs: [],
              comment: "",
              concept: item,
              dosage: [],
              drug: item,
              efficiency: null,
              form: [],
              intervalpreset: [],
              method: [],
              name: item.name,
              parents: child.id,
              schedulepreset: [],
              trust: child.trust,
              type: "Drug",
              warning: child.warning,
            };
            if (first) first = false;
            this.clinrec[fakeId].childs.push(item.id);
          });
        }

        this.stores.actions.loading = false;
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {},
    });
  }
  iterator = 1;
  recursiveGetDrugs = (child = null, clinrecId = null) => {
    // console.log("checker: ", this.checker);
    // console.log("drugToClinrecHashset ", this.drugToClinrecHashset);
    // console.log({ child });
    this.iterator++;
    if (child && child.check === false) return;
    if (child && child.type == "Drug" && child.check) {
      let drug = {
        name: child.drug.name,
        id: child.drug.id,
        type: child.drug.type,
        level: child.drug.level,
        group: child.drug.group,
      };
      if (child.comment) {
        // console.log(child.comment);
        drug.specials = child.comment;
      }
      //drug.dosage.form
      // console.log(drug);
      // this.drugToClinrecHashset[drug.id] = clinrecId;
      _.keys(this.clinrec).forEach((id, i) => {
        if (this.clinrec[id]?.drug?.id == drug.id) this.drugToClinrecHashset[drug.id] = id;
      });
      setTimeout(() => this.stores.drugs.selectFromSearch(drug), this.iterator * 10);
      return;
    }

    if (child) {
      if (child.childs && child.childs.length > 0) {
        child.childs.forEach((id, i) => {
          let item = this.clinrec[id];
          item && this.recursiveGetDrugs(item, clinrecId);
        });
      }
    } else {
      // this.stores.db.clearData(true);
      this.druglist = observable([]);
      _.keys(this.clinrec).forEach((id, i) => {
        let item = this.clinrec[id];
        if (!item.parents) {
          item && this.recursiveGetDrugs(item, id);
        }
      });
    }
  };
}

export default Clinrecs;
