import { observable, action, autorun, computed, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import { checkDouble, clearDouble } from "../lib/helpers";

import _ from "lodash";

const colorPallette = ["#007b2b", "#b0d512", "#03529b", "#fff42b", "#ffca2f", "#fc7301", "#f42a03"];

class Dosages {
  ready = false;

  current = {
    //drugDosage
    drug: {},
    form: {},
    methodform: {},
    names: {},
    nameshort: {},
    units: {},
  };

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      current: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    this.dosage = observable.map({}, "dosage");

    autorun(() => {});
  }

  async calcDrug(key) {
    // here!
    // let currPack = {
    //   dosage: { small: '', full: '', id: dosage[0].id_1 },
    //   pack: { small: '', full: '', id: pack.id_1 },
    //   type: 'simple',
    //   value: 0,
    //   flag: false,
    //   obj: {
    //     dosages: dosage,
    //     pack: {
    //       dosage: pack,
    //       id: packname
    //     },
    //   }
    // }
    // if(_.isArray(dosage) && dosage.length > 1 ){
    //   currPack.dosage.full += _.map(dosage, 'value_1').join(' + ') + ' ' + names[dosage[0].id_1]
    //   currPack.dosage.small += _.map(dosage, 'value_1').join(' + ') + ' ' + (nameshort[dosage[0].id_1] || names[dosage[0].id_1])
    //   currPack.type = 'multi'
    //   currPack.value = Array.from(_.map(dosage, 'value_1'))
    // }else if(_.isArray(dosage) && dosage.length === 1 ){
    //   let val = dosage[0].value_2 ? dosage[0].value_1/dosage[0].value_2 : dosage[0].value_1
    //   currPack.dosage.full += val + ' ' + names[dosage[0].id_1]
    //   currPack.dosage.small += val + ' ' + (nameshort[dosage[0].id_1] || names[dosage[0].id_1])
    //   currPack.value = val
    // }
    // currPack.pack.full += names[packname] + (pack && (', ' + pack.value_1 + ' ' + (nameshort[pack.id_1] || names[pack.id_1])) || '')
    // currPack.pack.small += (nameshort[packname] || names[packname]) + (pack && (', ' + pack.value_1 + ' ' + (nameshort[pack.id_1] || names[pack.id_1])) || '')
    // // REFACTORING
    // let { obj, value, ...helpers } = currPack
  }

  //getLF
  async getFp(drug_obj) {
    let { active_language } = this.stores.actions;
    let data = {
      drug: drug_obj,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `drugs/FPDosage`,
      data,
      success: async (data) => {
        // console.log('DATA', data);
        let drugDosage = this.dosage.get(drug_obj.id);
        let { names, nameshort } = drugDosage;
        let { dosage, fp, lf, method, methodform, name, shortname, pack, packname } = data;
        await this.stores.tools.setNames(name, shortname);
        dosage = _.isArray(dosage) ? dosage : [dosage];
        let currPack = {
          dosage: { small: "", full: "", id: dosage[0].id_1 },
          pack: { small: "", full: "", id: pack.id_1 },
          type: "simple",
          value: 0,
          flag: false,
          obj: {
            dosages: dosage,
            pack: {
              dosage: pack,
              id: packname,
            },
          },
        };
        if (_.isArray(dosage) && dosage.length > 1) {
          currPack.dosage.full += _.map(dosage, "value_1").join(" + ") + " " + names[dosage[0].id_1];
          currPack.dosage.small +=
            _.map(dosage, "value_1").join(" + ") + " " + (nameshort[dosage[0].id_1] || names[dosage[0].id_1]);
          currPack.type = "multi";
          currPack.value = Array.from(_.map(dosage, "value_1"));
        } else if (_.isArray(dosage) && dosage.length === 1) {
          let val = dosage[0].value_2 ? dosage[0].value_1 / dosage[0].value_2 : dosage[0].value_1;
          currPack.dosage.full += val + " " + names[dosage[0].id_1];
          currPack.dosage.small += val + " " + (nameshort[dosage[0].id_1] || names[dosage[0].id_1]);
          currPack.value = [val];
        }
        currPack.pack.full +=
          names[packname] + ((pack && ", " + pack.value_1 + " " + (nameshort[pack.id_1] || names[pack.id_1])) || "");
        currPack.pack.small +=
          (nameshort[packname] || names[packname]) +
          ((pack && ", " + pack.value_1 + " " + (nameshort[pack.id_1] || names[pack.id_1])) || "");
        // REFACTORING
        let { obj, value, ...helpers } = currPack;
        //let { dosages, pack } = obj

        this.stores.actions.stepsData = {
          key: drug_obj.key,
          way: "lf",
          step: 4,
          form: lf,
          method,
          pack: obj.pack,
          dosage: obj.dosages,
          value,
          helpers,
        };
        // this.stores.actions.calculatorForm = {
        //   dosage: [0],
        //   count: 1,
        //   dosageUnit: '248',
        //   dayCount: 1,
        //   fullDosage: this.getToBase(pack.id_1, pack.value_1*currPack.value),
        //   weightDosage: [0],
        //   dayDosage: [0],
        //   dayWeightDosage: [0]
        // }
        // console.log(helpers);

        this.stores.drugs.current = drug_obj;

        await this.setStepDosage();

        await this.stores.drugs.setDosageParams(`/concept/dozes/lf/4`);
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  async checkDosage(id) {
    let flag = null;
    // console.log("here");
    // console.log(this.dosage.keys());
    await this.dosage.forEach((dose, i) => {
      // console.log(dose.drug.id, id);
      if (dose.drug && dose.drug.id === id) flag = dose;
    });
    return flag;
  }

  isSolute = async (key) => {
    let drug = await this.stores.drugs.drug.get(key);
    let dosages = await this.dosage.get(drug.id);
    if (!dosages) return;
    let { form } = dosages;
    if (!form) return;

    let solute = false;
    await _.forEach(form, (item) => {
      if (item.solute) {
        solute = true;
      }
    });
    drug.solute = solute;
  };

  get = async (drug_obj, flag = false, additionalNames) => {
    additionalNames = additionalNames ? additionalNames : {};
    // console.log(drug_obj);
    let currentDosages = await this.dosage.get(drug_obj.id);
    let { active_language } = this.stores.actions;
    // console.log('HERE, ' + drug_obj.key);
    // console.log({ "drug_obj.fpid": drug_obj.fpid });
    if (currentDosages && !flag && !drug_obj.fpid) {
      await this.isSolute(drug_obj.key);
      await this.stores.drugs.setBaseDosages(drug_obj.key);
      // await this.stores.drugs.getDosageParams()
      return true;
    }

    let data = {
      drug: drug_obj,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `drugs/Dosages`,
      data,
      success: async (data) => {
        //console.log('DATA', data);
        let { drug, form, methodform, names, nameshort, units } = data;

        if (drug == null) this.stores.actions.makeAlerts(data);

        names = { ...additionalNames, ...names };

        let solute = false;

        await _.forEach(form, (item) => {
          if (item.solute) {
            solute = true;
          }
        });

        let drugObj = (await this.stores.drugs.drug.get(drug.key)) || {};
        // console.log({ drugObj });
        drugObj.solute = solute;
        this.stores.drugs.drug.set(drug.key, drugObj);

        await this.stores.tools.setNames(names, nameshort);
        let current = (await this.dosage.get(drug.id)) || {};

        this.current = _.extend(current, { solute, drug, form, methodform, names, nameshort, units });

        await this.dosage.set(drug.id, this.current);
        if (units && units.length > 0) await this.stores.tools.getUnitsPharm(units);

        if (drug_obj.fpid && !drug_obj.proto) this.getFp(drug_obj);

        await this.stores.drugs.setBaseDosages(drug_obj.key);

        return this.stores.tools.timeout(50);
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  };

  get currDosagesArr() {
    let {
      actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, stepsData },
      drugs: { current },
      actions: { t },
    } = this.stores;

    let { dosage } = this;
    if (!current.id) return [];
    let drugDosage = this.dosage.get(current.id);
    // dosage.forEach((item, i) => {
    //   console.log({ item, i });
    // });

    // console.log({ current, drugDosage });
    if (!drugDosage) return [];
    let { drug, form, methodform, names, nameshort } = drugDosage;

    let arr = [];
    let noData = false;
    form[stepsData.form] &&
      form[stepsData.form].dosage.forEach((item, i) => {
        let itemDosage = null;
        if (_.isArray(item.dosage) && item.dosage.length > 0) itemDosage = item.dosage;
        if (_.isObject(item.dosage) && !_.isArray(item.dosage)) itemDosage = [item.dosage];

        if (!itemDosage) {
          if (_.findIndex(arr, (itm) => itm.dosage && itm.dosage.small == this.stores.actions.t("no_data")) == -1) {
            noData = true;
            arr.push({
              dosage: {
                small: this.stores.actions.t("no_data"),
                full: this.stores.actions.t("dosage_not_specified"),
                id: 248,
              },
              pack: {
                small: "",
                full: "",
                id: item.pack && item.pack[0] && item.pack[0].dosage ? item.pack[0].dosage.id_1 : null,
              },
              type: "simple",
              value: [0],
              obj: {
                dosages: null,
                pack: null,
              },
            });
          }
        } else {
          let currPack = {
            dosage: { small: "", full: "", id: itemDosage[0].id_1 },
            pack: { small: "", full: "", id: item?.pack[0]?.dosage ? item.pack[0].dosage.id_1 : null },
            type: "simple",
            value: [0],
            flag: false,
          };
          if (form[stepsData.form].solute && _.isArray(item.pack) && item.pack.length > 0) {
            item.pack.forEach((pack, x) => {
              if (!pack.dosage) pack.dosage = {};
              currPack = {
                dosage: { small: "", full: "", id: itemDosage[0].id_1 },
                pack: { small: "", full: "", id: pack.dosage.id_1 },
                type: "simple",
                value: [0],
                flag: !!(itemDosage[0] && itemDosage[0].id_2),
                obj: {
                  dosages: itemDosage,
                  pack: pack,
                },
              };
              if (_.isArray(itemDosage) && itemDosage.length > 1) {
                currPack.dosage.full += _.map(itemDosage, "value_1").join(" + ") + " " + names[itemDosage[0].id_1];
                currPack.dosage.small +=
                  _.map(itemDosage, "value_1").join(" + ") +
                  " " +
                  (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
                currPack.type = "multi";
                currPack.value = Array.from(_.map(itemDosage, "value_1"));
              } else if (_.isArray(itemDosage) && itemDosage.length === 1) {
                let val = itemDosage[0].value_2 ? itemDosage[0].value_1 / itemDosage[0].value_2 : itemDosage[0].value_1;
                currPack.dosage.full += val + " " + names[itemDosage[0].id_1];
                currPack.dosage.small += val + " " + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
                currPack.value = [val];
              }
              currPack.pack.full +=
                (names[pack.id] || "") +
                ((pack.dosage &&
                  ", " +
                    (pack.dosage.value_1 || "") +
                    " " +
                    (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1] || "")) ||
                  "");
              currPack.pack.small +=
                (nameshort[pack.id] || names[pack.id] || "") +
                ((pack.dosage &&
                  ", " +
                    (pack.dosage.value_1 || "") +
                    " " +
                    (nameshort[pack.dosage.id_1] || names[pack.dosage.id_1] || "")) ||
                  "");
              arr.push({ ...currPack });
            });
          } else {
            let pack = item.pack[0];
            if (_.isArray(itemDosage) && itemDosage.length > 1) {
              currPack.dosage.full += _.map(itemDosage, "value_1").join(" + ") + " " + names[itemDosage[0].id_1];
              currPack.dosage.small +=
                _.map(itemDosage, "value_1").join(" + ") +
                " " +
                (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
              currPack.type = "multi";
              currPack.value = Array.from(_.map(itemDosage, "value_1"));
            } else if (_.isArray(itemDosage) && itemDosage.length === 1) {
              let val = itemDosage[0].value_2 ? itemDosage[0].value_1 / itemDosage[0].value_2 : itemDosage[0].value_1;
              currPack.dosage.full += val + " " + names[itemDosage[0].id_1];
              currPack.dosage.small += val + " " + (nameshort[itemDosage[0].id_1] || names[itemDosage[0].id_1]);
              currPack.value = [val];
            }
            currPack.flag = !!(itemDosage[0] && itemDosage[0].id_2);
            currPack.obj = {
              dosages: itemDosage,
              pack: null, //item.pack[0]
            };
            arr.push({ ...currPack });
          }
        }
      });
    if (noData && arr.length > 1) {
      _.remove(arr, function (itm) {
        return itm.dosage && itm.dosage.small == t("no_data");
      });
    }
    return arr;
  }

  get calcValues() {
    let drug = this.stores.drugs.current;
    let dosages = this.current;
    let currDos = this.stores.actions.stepsData.helpers;
    let value = this.stores.actions.stepsData.value;
    let pack = this.stores.actions.stepsData.pack;
    let { units, getUnitArr } = this.stores.tools;

    // console.log({ stepsData: this.stores.actions.stepsData, pack });
    // console.log({ currDos, dosages, drug });
    const calcFromDrug = drug?.calc;
    // console.log({ calcFromDrug, pack });

    let unit = (currDos.dosage && units[currDos.dosage.id]) || 248;
    let packCountBaseUnit = pack && pack.dosage && pack.dosage.id_1 && units[pack.dosage.id_1]?.arr;
    // console.log({ packCountBaseUnit });
    let firstUnit = null;
    let secondUnit = null;

    if (unit && unit.type && unit.type === "complex") {
      unit.contains.forEach((item) => {
        if (item.action === "multiplication") firstUnit = units[item.id];
        if (item.action === "division") secondUnit = units[item.id];
      });
    }
    // console.log({firstUnit, unit});
    let unitsArr = ((firstUnit || unit) && getUnitArr((firstUnit && firstUnit.id) || (unit && unit.id))) || {};
    // console.log('pack',pack);

    const countIdFromHelpers = units[currDos?.pack?.id];
    // console.log({ countIdFromHelpers });

    return {
      dosage: {
        value,
        units: unitsArr,
        unit,
        firstUnit,
        secondUnit,
      },
      count: {
        value:
          (pack && pack.dosage && pack.dosage.value_1) || //&& this.stores.tools.convertFromBaseUnitToUnit(packCountBaseUnit, pack.dosage.id_1, pack.dosage.value_1)) ||
          (countIdFromHelpers &&
            this.stores.tools.convertFromBaseUnitToUnit(
              countIdFromHelpers.arr,
              countIdFromHelpers.id,
              calcFromDrug?.count
            )) ||
          this.stores.tools.convertFromBaseUnitToUnit(
            calcFromDrug?.countBaseUnit,
            calcFromDrug?.countUnit,
            calcFromDrug?.count
          ) ||
          1,
        unit:
          (currDos.pack && units[currDos.pack.id]) ||
          (calcFromDrug?.countUnit && units[calcFromDrug.countUnit]) ||
          units[248],
      },
    };
  }

  setStepDosage = () => {
    // console.log('this.calcValues', this.calcValues);
    let vals = this.calcValues;
    let weight = this.stores.patients.current.weight || null;

    if (!vals.dosage.value) return;

    // let baseDosage = vals.dosage.value
    let dosage = vals.dosage.value;

    if (!_.isArray(dosage)) dosage = [dosage];

    if (vals.dosage.firstUnit) {
      vals.dosage.firstUnit.contains.forEach((contain) => {
        if (contain.action === "division") {
          dosage = _.map(dosage, (dos) => dos / contain.value);
        } else {
          dosage = _.map(dosage, (dos) => dos * contain.value);
        }
      });
    }
    if (vals.dosage.unit?.contains) {
      vals.dosage.unit.contains.forEach((contain) => {
        if (contain.action === "division") {
          dosage = _.map(dosage, (dos) => dos / contain.value);
        } else {
          dosage = _.map(dosage, (dos) => dos * contain.value);
        }
      });
    }

    this.stores.actions.calculatorForm = {
      // baseDosage,
      type: dosage.length > 1 ? "multi" : "single", // single, multi, liquid
      dosage,
      count: vals.count.value,
      dosageUnit:
        (vals.dosage.firstUnit && vals.dosage.firstUnit.id) || (vals.dosage.unit && vals.dosage.unit.id) || "248",
      dayCount: 1,
      fullDosage: _.map(dosage, (dos) => dos * vals.count.value),
      weightDosage: weight ? _.map(dosage, (dos) => (dos * vals.count.value) / weight) : [0],
      dayDosage: _.map(dosage, (dos) => dos * vals.count.value),
      dayWeightDosage: weight ? _.map(dosage, (dos) => (dos * vals.count.value) / weight) : [0],
    };
  };

  getFromBase = (unitId, value, double = 4, name = null) => {
    let { round } = this.stores.tools;
    // console.log(0,{ value });

    let unit = this.stores.tools.units[unitId];
    if (!unit) return [0];
    //let dosage = value

    if (!_.isArray(value)) value = [value];
    let checked = false;
    // if( name == 'dosage' ) console.log(0, value );
    // if( name == 'dosage' ){
    value.forEach((item, i) => {
      if (!checkDouble(item, false)) checked = true;
    });
    // console.log({ checked });
    // }
    if (checked) return value;
    // if( name == 'dosage' ) console.log(1, value );

    unit.contains.forEach((contain) => {
      // console.log({ contain });
      if (contain.action === "division") {
        value = _.map(value, (dos) => round(dos * contain.value, double));
      } else {
        value = _.map(value, (dos) => round(dos / contain.value, double));
      }
    });
    // if( name == 'dosage' ) console.log(2, value );
    return value || [];
  };

  getToBase = (unitId, value) => {
    if (
      value === "" ||
      value === 0 ||
      value === "0" ||
      value === "." ||
      (value.split && (value.split(",")[1] === "" || value.split(".")[1] === ""))
    )
      return value;
    // console.log(typeof(value));
    // value = value.replace(',', '.')
    // if(value.split('.')[1] && value.split('.')[1] != ''){
    //   console.log(value);
    //   value = parseFloat(value)
    // }
    let unit = this.stores.tools.units[unitId];
    if (!unit) return 0;
    let dosage = value;
    // console.log(value/100);

    // console.log({ unit });
    unit.contains.forEach((contain) => {
      if (contain.action === "division") {
        dosage = dosage / contain.value;
      } else {
        dosage = dosage * contain.value;
      }
    });
    // console.log(dosage);
    return dosage;
  };
}
export default Dosages;
