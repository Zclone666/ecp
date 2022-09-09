import { observable, action, autorun, computed, makeObservable } from "mobx";
import moment from "moment";
import _ from "lodash";

// import { DrugModel } from "../models";

class Drug {
  //start-decorators
  current = {};
  calcValues = {
    dosage: "",
    count: "",
    fullDosage: "",
    weightDosage: "",
    freq: "",
    dayWeightDosage: "",
  };
  calcNames = {
    dosageUnit: "",
    countUnit: "",
    fullDosageUnit: "",
    weightDosageUnit: "",
    freqUnit: "",
    dayWeightDosageUnit: "",
  };
  concentration: {
    numerator: null, // числитель
    denominator: null, // знаменатель
  };
  //end-decorators

  constructor({ drug, model, stores }) {
    this.stores = stores;
    // Object.assign(this, { _names: names, _units: units, _model: model, _shortnames: shortnames });
    makeObservable(this, {
      current: observable,
      calcValues: observable,
      calcNames: observable,
      calc: computed,
    });
    this._validateAndSet(drug);
  }
  _validateAndSet(drug) {
    const validationContext = this.model.schema.newContext();
    validationContext.validate(drug);
    const errs = validationContext.validationErrors();
    errs = errs.filter((err) => {
      return err.type !== "keyNotInSchema";
    });
    if (errs.length) {
      console.log(`${drug.name} has errors: `, errs);
    } else {
      this.current = _.cloneDeep(this.model.obj);
      Object.assign(this.current, drug);
    }
  }
  //{type: "ratio"||"value", value_1: 100, value_2: 5,(if ratio) id_1: "250"}
  dosageItemFactory(dosageItem) {
    let { getFromBase, units, unitarrs, getUnitWithComponents } = this.stores.tools;
    let value = 0;
    let unit = null;
    if (dosageItem.id_2) {
      // FIXME: // id_2 ?????
    } else {
      unit = getUnitWithComponents(dosageItem.id_1);
    }

    if (dosageItem.type === "value") {
      value = dosageItem.value_1;
    } else if (dosageItem.type === "ratio") {
      value = dosageItem.value_1 / dosageItem.value_2;
    }
  }

  calcCache() {}

  get calc() {
    let { dosage, dosageUnit, dosageBaseUnit, count, countUnit, countBaseUnit } = this.current.calc;
    let { dosage: packDosage } = this.current.dosage;
    let { calcValues, calcNames } = this;
  }

  get concentration() {}
  get count() {}
  get dosage() {}
}
export default Drug;
