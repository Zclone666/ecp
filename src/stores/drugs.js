import { observable, action, autorun, computed, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";

import { DrugModel, LiquidModel } from "../models";

import { DrugScheme, LiquidScheme } from "../schemes";

const colorPallette = ["#007b2b", "#b0d512", "#03529b", "#fff42b", "#ffca2f", "#fc7301", "#f42a03"];

class Drugs {
  //start-decorators
  ready = false;
  searchRows = [];

  unselectedRows = [];
  unselectedLiquids = [];

  deletedRows = [];
  deletedLiquids = [];

  fdForSearch = {};

  drugsForFG = {};
  fds = [];
  fgs = [];

  searchReady = true;

  listChanged = true;
  drugsRemoved = false;

  selectedRows = [];

  current = _.cloneDeep(DrugScheme);
  currLiquid = _.cloneDeep(LiquidScheme);
  //end-decorators

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      searchRows: observable,
      unselectedRows: observable,
      unselectedLiquids: observable,
      deletedRows: observable,
      deletedLiquids: observable,
      fdForSearch: observable,
      fds: observable,
      fgs: observable,
      searchReady: observable,
      listChanged: observable,
      drugsRemoved: observable,
      selectedRows: observable,
      current: observable,
      currLiquid: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    this.drug = observable.map({}, "drug");
    this.liquid = observable.map({}, "liquid");

    autorun(() => {
      // console.log({
      //   drugs: Array.from(this.drug.values()),
      //   liquids: Array.from(this.liquid.values()),
      //   deletedRows: Array.from(this.deletedRows),
      //   deletedLiquids: Array.from(this.deletedLiquids),
      // });
      // console.log(Array.from(this.liquid.values()));
    });
  }

  get validateCurrentDrug() {
    const validationContext = DrugModel.schema.newContext();
    validationContext.validate(this.current);
    return validationContext.validationErrors();
  }

  /**
  // метод устанавливает выбранный драг при работе с дозировками и расписанием приема
  * @param drug - драг
  * @param key - идентификатор драга
  * @param id - айди ДВ или ТН
  */
  setCurrent = async ({ drug, key, id }) => {
    let drugTpl = _.cloneDeep(DrugScheme);
    drugTpl.key = key;
    drugTpl.id = id;
    await _.assignIn(this.current, drugTpl);
    if (!drug && !!key) drug = await this.drug.get(key);
    await _.assignIn(this.current, drugTpl, drug);
  };

  /**
  // метод убирает выбранный драг
  */
  unsetCurrent = () => {
    _.assignIn(this.current, DrugScheme);
  };

  /**
  // метод получения клонированного объекта выбранного драга
  */
  getCurrent = () => {
    return _.cloneDeep(this.current);
  };

  /**
  // метод получения клонированного объекта драга по ключу
  * @param key - идентификатор драга
  */
  getClone = async (key) => {
    let drug = await this.drug.get(key);
    return _.cloneDeep(drug);
  };

  /**
  // метод получения пустого объекта драга
  */
  getNew = () => {
    return _.cloneDeep(DrugScheme);
  };

  /**
  // метод устанавливает дозировки к драгу в базовых единицах из того, что выбрано в степпере и калькуляторе
  * @param key - идентификатор драга
  */
  setBaseDosages = async (key) => {
    let drug = await this.drug.get(key);
    // console.log("setBaseDosages: ", { drug }, drug.calc.countBaseUnit);

    // console.log({ key, drug });
    if (!drug || !drug.calc || !drug.calc.dosageUnit) return;
    let { units } = this.stores.tools;
    const stepsData = this.stores.actions.stepsData;
    // console.log("steps: ", { stepsData });
    let count =
      (drug.helpers.pack && units[drug.helpers.pack.id]) ||
      units[stepsData?.pack?.dosage?.id_1] ||
      units[stepsData?.helpers?.pack?.id]; //|| units[248];

    let dosageBaseUnit = this.stores.tools.getBaseUnit(drug.calc.dosageUnit);
    drug.calc.dosageBaseUnit = dosageBaseUnit;
    if (count) {
      let countBaseUnit = this.stores.tools.getBaseUnit(count.id);
      // console.log({ countBaseUnit });

      drug.calc = { ...drug.calc, countBaseUnit, countUnit: count.id };
      // drug.calc.countBaseUnit = countBaseUnit;
      // drug.calc.countUnit = count.id;
      return;
    }
    drug.calc.countBaseUnit = drug.calc.countBaseUnit || units[248].arr;
    drug.calc.countUnit =
      drug.calc.countUnit || Object.values(units).find((u) => u.arr == drug.calc.countBaseUnit).id || units[248].id;

    //const countUnit = Object.values(units).find((unit) => unit.arr == drug.calc.countBaseUnit).id;
  };

  // service functions

  /**
  // метод очищает назначенную терапию (то, что пришло с бэка с заполненным полем proto)
  */
  async clearProto() {
    await this.drug.forEach((drugObj, key) => {
      if (drugObj.proto) {
        // console.log(drugObj);
        this.unselectDrug(drugObj);
        // this.listChanged = true;
        // return true;
      }
    });
  }

  /**
  // метод очищает весь лист назначений
  */
  async clearList() {
    await this.drug.forEach((drugObj, key) => {
      // if (drugObj.proto) {
      // console.log(drugObj);
      this.unselectDrug(drugObj, false);
      // this.listChanged = true;
      // return true;
      // }
    });
    this.stores.actions.makeLiquids = false;
  }

  /**
  // метод возвращает удаленный лист назначений
  */
  async returnList() {
    this.unselectedLiquids.forEach(async (liquid, i) => {
      if (liquid.group != null) {
        await this.liquid.set(liquid.group, liquid);
      } else {
        this.unselectedLiquids.push(liquid);
      }
    });

    this.unselectedRows.forEach(async (drug, i) => {
      await this.selectFromSearch(drug, false, false);
    });

    await this.stores.tools.stepByStepLoading(this.stores.dosages.get, this.deletedRows);
    this.unselectedRows = observable([]);
    this.unselectedLiquids = observable([]);
  }

  /**
  // метод окончательно очищает удаленную терапию
  */
  async clearDeleted() {
    this.unselectedRows.forEach((item, i) => {
      this.deletedRows.push(item);
    });
    this.unselectedLiquids.forEach((item, i) => {
      this.deletedLiquids.push(item);
    });

    this.unselectedRows = observable([]);
    this.unselectedLiquids = observable([]);
    this.drugsRemoved = true;
  }

  /**
  // метод получает и устанавливает МНН для драга, и создает кэш с исходным драгом
  * @param drug - объект драга
  */
  async MNNfromTN(drug) {
    let { active_language } = this.stores.actions;
    let data = {
      drug,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    let current = this.drug.get(drug.key);
    if (current.helpers.mnn) {
      current = _.assignIn(current, current.helpers.drugCache);
      current.helpers.mnn = false;
      current.recipenameid = null;
      current.helpers.drugCache = null;
    } else {
      return POST({
        path: `drugs/MNNfromTN`,
        data,
        success: async (data) => {
          current = _.assignIn(current, data.mnn);
          current.helpers.mnn = true;
          current.recipenameid = data.mnn.id;
          current.helpers.drugCache = _.cloneDeep(drug);
          this.stores.drugs.drug.set(drug.key, current);
          // console.log('DATA', data);
        },
        fail: (alerts) => {},
        always: (data) => {},
      });
    }
  }

  /**
  // метод превращает ДВ или ТН в ФП, после чего запрашивает и устанавливает необходимые параметры дозировки
  * @param drugKey - идентификатор драга
  * @param fpid - айди ФП
  */
  setFP = async (drugKey, fpid) => {
    let currentDrug = (await this.drug.get(drugKey)) || {};
    currentDrug = await _.assignIn(currentDrug, { fpid });
    await this.drug.set(drugKey, currentDrug);
    this.stores.dosages.get(currentDrug, true);
  };

  /**
  // метод сохраняет данные к драгу при закрытии степпера дозировок
  */
  setDosageParams = async () => {
    let drugData = this.stores.actions.stepsData;
    let calcData = this.stores.actions.calculatorForm;
    // console.log("setDosageParams this.stores.actions.calculatorForm", this.stores.actions.calculatorForm);
    let scheduleData = this.stores.actions.scheduleForm;
    let {
      router: { values },
    } = this.stores;

    let drug = this.getCurrent();
    let currentDrug = this.drug.get(drug.key) || {};
    let currentDosages = this.stores.dosages.dosage.get(drug.id) || {};

    let { calcValues, getFromBase } = this.stores.dosages;
    let def =
      (calcValues.dosage.firstUnit && calcValues.dosage.firstUnit.id) ||
      (calcValues.dosage.unit && calcValues.dosage.unit.id);

    let { freq, freq_id, duration, duration_id } = drug;

    currentDrug.edit = true;
    // console.log({ freq, duration });
    currentDrug.freq = freq || null;
    currentDrug.freq_id = freq_id || null;
    currentDrug.duration = duration || null;
    currentDrug.duration_id = duration_id || null;
    currentDrug.specials = this.stores.actions.drugStructure.specials;

    let {
      key,
      form,
      method,
      pack,
      dosage,
      value,
      helpers: { dosage: hdosage, pack: hpack },
    } = drugData;

    let { way, step } = values;

    let {
      dateStart,
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    } = scheduleData;

    let { dosage: dos, count, dayCount, dosageUnit, fullDosage, weightDosage, dayDosage, dayWeightDosage } = calcData;

    let { countUnit, countBaseUnit } = currentDrug.calc;
    // console.log("\n setting dosages params: \n", { countUnit, countBaseUnit });
    count = this.stores.tools.convertFromUnitToBaseUnit(countUnit, countBaseUnit, count);
    // console.log({ count });

    currentDrug.solute =
      currentDosages.form && currentDosages.form[form] ? currentDosages.form[form].solute : currentDrug.solute;
    // console.log({dosageUnit, fullDosage})
    // console.log({currentDrug})
    currentDrug.dosage = {
      form,
      method,
      pack,
      dosage,
      value,
    };
    currentDrug.helpers = {
      key,
      way,
      step,
      dosage: hdosage,
      pack: hpack,
    };
    currentDrug.schedule = {
      dateStart: parseInt(dateStart),
      dateFinish: parseInt(dateFinish),
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    };

    currentDrug.calc = {
      ...currentDrug.calc,
      dosage: dos,
      count,
      dosageUnit: dosageUnit == 999999 ? "248" : dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
    };
    // await this.drug.set(drug.key, currentDrug);
    console.log(this.validateCurrentDrug);
    this.listChanged = true;
    await this.stores.dosages.dosage.set(drug.key, currentDosages);
    this.setBaseDosages(drug.key);
    this.stores.db.clearData();
  };

  /**
  // метод зполняет служебные объекты для калькулятора и степпера при нажатии на каплю
  */
  getDosageParams = async () => {
    // console.log("\n getting dosage params \n");
    let drugData = this.stores.actions.stepsData;

    let drug = this.current;
    let currentDrug = (await this.drug.get(drug.key)) || {};
    let currentDosages = (await this.stores.dosages.dosage.get(drug.id)) || {};

    if (currentDosages.form) {
      await _.forEach(currentDosages.form, (item) => {
        if (item.solute) {
          currentDosages.solute = true;
          currentDrug.solute = true;
        }
      });
    }

    let { freq, freq_id, duration, duration_id } = drug;

    let { specials } = currentDrug;
    // console.log({currentDrug});
    let { form, method, pack, dosage, value } = currentDrug.dosage;
    let { key, way, step, dosage: hdosage, pack: hpack } = currentDrug.helpers;
    let {
      dateStart,
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    } = currentDrug.schedule;
    let {
      dosage: dos,
      count,
      countUnit,
      countBaseUnit,
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
    } = currentDrug.calc;

    this.stores.actions.stepsData = {
      key,
      way,
      step,
      form,
      method,
      pack,
      dosage,
      value,
      helpers: {
        dosage: hdosage,
        pack: hpack,
      },
    };
    // console.log({dosageUnit});
    this.stores.actions.calculatorForm = {
      dosage: dos,
      count: this.stores.tools.convertFromBaseUnitToUnit(countBaseUnit, countUnit, count),
      dosageUnit,
      dayCount,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
    };
    this.stores.actions.scheduleForm = {
      dateStart: dateStart || moment(moment().format("DD.MM.YYYY"), "DD.MM.YYYY").format("x"),
      dateFinish,
      finishAlternate,
      clarifications, //уточнения
      interval,
      once,
      week,
      calendar,
    };
    this.stores.actions.drugStructure.specials = specials;
    this.listChanged = true;
  };

  // liquids and groups

  /**
  // метод возвращает пустой объект раствора
  */
  getNewLiquid = () => {
    return _.cloneDeep(LiquidScheme);
  };

  /**
  // метод устанавливает выбранный раствор при работе с дозировками и расписанием приема
  * @param liquid - объект раствора
  * @param key - идентификатор раствора
  */
  setCurrentLiquid = async ({ liquid, key }) => {
    await _.assignIn(this.currLiquid, LiquidScheme);
    if (!liquid && !!key) liquid = await this.liquid.get(key);
    _.assignIn(this.currLiquid, liquid);
  };

  /**
  // метод получения клонированного объекта выбранного раствора
  */
  getCurrentLiquid = () => {
    return _.cloneDeep(this.currLiquid);
  };

  /**
  // метод получения клонированного объекта раствора по ключу
  * @param key - идентификатор драга
  */
  getCloneLiquid = async (key) => {
    let liquid = await this.liquid.get(key);
    return _.cloneDeep(liquid);
  };

  /**
  // метод убирает выбранный раствор
  */
  unsetCurrentLiquid = () => {
    _.assignIn(this.currLiquid, LiquidScheme);
  };

  /**
  // метод добавляет драги в раствор по списку ключей и помечает как изменненные все затронутые драги
  * @param keys - мссив ключей
  * @param group - идентификатор раствора
  */
  async setGroup(keys, group) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }

    let currGroup = null;
    await keys.forEach(async (key, i) => {
      let drug = await this.drug.get(key);
      currGroup = drug.group;

      drug.group = group;
      drug.edit = true;

      this.drug.set(key, drug);
    });

    await this.drug.forEach(async (drug, key) => {
      if (drug.group == group && group !== 0) {
        drug.edit = true;
      }
      if (drug.group == currGroup && group == 0) {
        drug.edit = true;
      }
    });

    let currLiquid = (await this.liquid.get(currGroup)) || this.getNewLiquid();

    if (currLiquid.key) {
      currLiquid.edit = true;
      // await this.liquid.set( currGroup, currLiquid )
    }

    if (group == 0) {
      if (currLiquid.proto) {
        this.deletedLiquids.push(currLiquid);
      }
      this.liquid.delete(currGroup);
    }

    this.stores.actions.makeLiquids = true;
    setTimeout(() => {
      this.checkLiquidsOk();
    }, 300);
  }

  /**
  // метод сбрасывает все растворы
  */
  async resetGroups() {
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        item.group = 0;
      }
    });
  }

  /**
  // геттер проверки что во всех растворах не менее 2 элементов
  */
  get checkLiquids() {
    let isOk = true;
    let obj = {};
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        obj[item.group] = !!obj[item.group] ? obj[item.group] + 1 : 1;
      }
    });
    _.forEach(obj, (counter) => {
      if (counter < 2 && counter !== 0) {
        isOk = false;
      }
    });
    return isOk;
  }

  /**
  // метод проверки что во всех растворах не менее 2 элементов
  */
  async checkLiquidsOk() {
    let isOk = true;
    let obj = {};
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        obj[item.group] = !!obj[item.group] ? obj[item.group] + 1 : 1;
      }
    });
    _.forEach(obj, (counter) => {
      if (counter < 2 && counter !== 0) {
        isOk = false;
      }
    });
    // console.log(obj)
    this.stores.actions.isLiquidsOk = isOk;
  }

  /**
  // геттер расчета исходных данных для калькулятора раствора
  */
  get calcLiquid() {
    let {
      drug: drugs,
      stores: {
        tools: { unitarrs },
        router: { values: route },
      },
    } = this;

    //hardcode!!!
    let liquidUnits = unitarrs[112];
    let dryUnits = unitarrs[42];

    let counts = {};
    let weights = {};
    let weight = []; // list of weights
    let count = 0; //full value of liquid
    let unit = null; //dosage unit
    let liqUnit = null; //liquid unit
    let liqCountUnit = null; //liquid count unit
    let liqCountBaseUnit = null; //liquid count base unit
    let id = (route && route.liquid) || null;
    let ready = true;

    drugs.forEach((drugObj, key) => {
      let drug = { ...drugObj };

      if (drug.group == id) {
        if (drug.calc.dosage && drug.calc.dosage[0] > 0) {
          if (dryUnits.includes(drug.calc.dosageUnit)) {
            weights[drug.key] = {
              count: drug.calc.fullDosage,
              unit: drug.calc.dosageUnit,
            };
            if (!drug.calc.fullDosage) {
              drug.calc.fullDosage = [];
            } else if (!Array.isArray(drug.calc.fullDosage)) {
              drug.calc.fullDosage = [drug.calc.fullDosage];
            }
            weight = [...weight, ...drug.calc.fullDosage];
            unit = unit || drug.calc.dosageUnit;
          } else if (liquidUnits.includes(drug.calc.dosageUnit)) {
          }
          if (drug.dosage && drug.dosage.pack && drug.dosage.pack.dosage) {
            if (dryUnits.includes(drug.dosage.pack.dosage.id_1)) {
            } else if (liquidUnits.includes(drug.dosage.pack.dosage.id_1)) {
              counts[drug.key] = {
                count: drug.calc.count,
                unit: drug.dosage.pack.dosage.id_1,
              };
              count += drug.calc.count;
              liqUnit = liqUnit || drug.dosage.pack.dosage.id_1;
              liqCountUnit = liqCountUnit || drug.calc.countUnit;
              liqCountBaseUnit = liqCountBaseUnit || drug.calc.countBaseUnit;
            }
          }
        } else {
          ready = false;
        }
      }
    });
    // console.log({
    //   weight, count, weights, counts, ready, unit, liqUnit, liquidUnits, dryUnits, id
    // });
    // this.listChanged = true
    // console.log({ liqCountUnit, liqCountBaseUnit });
    return {
      weight,
      count,
      weights,
      counts,
      ready,
      unit,
      liqUnit,
      liquidUnits,
      liqCountUnit,
      liqCountBaseUnit,
      dryUnits,
      id,
    };
  }

  /**
  // метод удаляет растворы по списку ключей
  * @param keys - мссив ключей
  */
  removeLiquids = async (keys) => {
    if (!keys) return;
    if (!Array.isArray(keys)) keys = [keys];
    keys.forEach((item, i) => {
      let currLiquid = this.liquid.get(item) || {};
      if (currLiquid.proto) {
        this.unselectedLiquids.push(currLiquid);
        // this.deletedLiquids.push(currLiquid);
      }
      this.liquid.delete(item);
    });
    this.listChanged = true;
  };

  /**
  // метод создает растворы для всех драгов в листе назначений исходя из поля group
  */
  makeLiquids = async () => {
    let obj = {};
    this.drug.forEach((item, i) => {
      if (item.group !== 0) {
        obj[item.group] = !!obj[item.group] ? obj[item.group] + 1 : 1;
      }
    });

    _.forEach(obj, async (counter, key) => {
      if (counter > 1 && counter != 0 && key != 0) {
        if (!this.liquid.get(key)) {
          await this.makeLiquid(key);
        }
      } else {
        let maybeLiquid = this.liquid.get(key);
        if (maybeLiquid) {
          this.deletedLiquids.push(maybeLiquid);
          this.liquid.delete(key);
        }
      }
    });

    this.listChanged = true;
  };

  /**
  // метод создает раствор или помечает как измененный
  * @param key - идентификатор раствора
  */
  makeLiquid = async (key) => {
    key = parseInt(key);
    let current = this.liquid.get(key) || {};

    current.edit = true;
    if (current.group && current.group !== 0) return;
    current.group = key;

    let liquid = this.getNewLiquid();
    current = _.assignIn(liquid, current);

    await this.liquid.set(key, current);

    await this.getLiquidParams(key);
    return true;
  };

  /**
  // метод сохраняет данные к раствору при закрытии калькулятора дозировок
  * @param id - идентификатор раствора
  */
  setLiquidParams = async (id = null) => {
    let {
      stores: {
        router: { values: route },
      },
    } = this;
    id = id || (route && route.liquid) || null;
    if (!id) return;
    id = parseInt(id);
    this.drug.forEach((drug, i) => {
      if (drug.group == id) drug.edit = true;
    });

    let current = (await this.liquid.get(id)) || {};
    let {
      name, // Название ДВ или ТН
      group, // группа раствора (0 - нет раствора, больше 0 - раствор)
      specials,
      freq,
      edit,
      freq_id,
      duration,
      duration_id,
      calc: {
        dosageBaseUnit,
        dosage,
        count,
        dosageUnit,
        dayCount,
        fullDosage,
        weightDosage,
        dayDosage,
        dayWeightDosage,
        durationCount,
        durationUnit,
        fullSpeed,
        weightSpeed,
        tintSpeed,
        liquidSpeed,
      },
      schedule: {
        dateStart,
        dateFinish,
        finishAlternate,
        clarifications, //уточнения
        interval,
        once,
        week,
        calendar,
      },
    } = this.stores.actions.liquidForm;

    edit = true;
    current.edit = true;

    this.liquid.set(
      id,
      _.assignIn(current, {
        name,
        group,
        specials,
        freq,
        edit,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosageBaseUnit,
          dosage,
          count,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed,
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar,
        },
      })
    );
    this.listChanged = true;
    // console.log(this.liquid.get(id));
  };

  /**
  // метод пересчитывает данные калькулятора раствора при изменении одного из значений
  * @param id - идентификатор раствора
  */
  recalcLiquidParams = (id = null) => {
    let {
      stores: {
        router: { values: route },
        dosages: { getToBase, getFromBase },
      },
    } = this;
    id = id || (route && route.liquid) || null;
    if (!id) return;
    id = parseInt(id);

    let patientWeight = this.stores.patients.current.weight;
    let {
      dosage,
      count,
      countUnit,
      countBaseUnit,
      dosageUnit,
      dayCount,
      durationCount,
      durationUnit,
    } = this.stores.actions.liquidForm.calc;
    //.reduce((a, b) => a + b)
    console.log({ countUnit, count });
    // count = getToBase(countUnit, count);
    // console.log({ countUnit, count });
    let fullDosage = _.map(dosage, (dos) => {
      return dos * count;
    });
    let weightDosage = _.map(fullDosage, (dos) => {
      return patientWeight ? dos / patientWeight : 0;
    });
    let dayDosage = _.map(fullDosage, (dos) => {
      return dos * dayCount;
    });
    let dayWeightDosage = _.map(weightDosage, (dos) => {
      return patientWeight ? dos * dayCount : 0;
    });
    let fullSpeed = _.map(fullDosage, (dos) => {
      return dos / durationCount;
    });
    let weightSpeed = _.map(fullSpeed, (dos) => {
      return patientWeight ? dos / patientWeight : 0;
    });
    let tintSpeed = getToBase(168, getFromBase(799, count)) / durationCount;
    let liquidSpeed = count / durationCount;

    this.stores.actions.liquidForm.calc = {
      dosage,
      count,
      dosageUnit,
      dayCount,
      countUnit,
      countBaseUnit,
      fullDosage,
      weightDosage,
      dayDosage,
      dayWeightDosage,
      durationCount,
      durationUnit,
      fullSpeed,
      weightSpeed,
      tintSpeed,
      liquidSpeed,
    };
    this.listChanged = true;
  };

  /**
  // метод зполняет служебные объекты для калькулятора дозировок раствора
  * @param id - идентификатор раствора
  */
  getLiquidParams = async (id = null) => {
    let {
      stores: {
        router: { values: route },
        dosages: { getToBase, getFromBase },
      },
    } = this;
    id = id || (route && route.liquid) || null;
    if (!id) return;
    id = parseInt(id);

    let current = await this.liquid.get(id);

    if (!current) return;

    let flag = false; //if dosages changed set true

    let { ready, weights, counts, weight, count: calcCount, unit, liqCountUnit, liqCountBaseUnit } = this.calcLiquid;

    let arr = [];
    this.drug.forEach((drug, key) => {
      if (drug.group === id) {
        arr.push(drug.key);
      }
    });

    if (current.calc.dosage && current.calc.dosage[0] === 0) flag = true;
    if (weight.length != current.calc.dosage.length || calcCount != current.calc.count) flag = true;
    if (!_.isEqual(_.keys(weights), arr)) flag = true;
    if (!_.isEqual(weight, current.calc.dosage)) flag = true;
    if (!ready) return;

    // console.log('HEREs');

    //
    let { name, group, specials, freq, edit, freq_id, duration, duration_id } = current;
    // console.log('HERE 1');
    if (flag) {
      let patientWeight = this.stores.patients.current.weight;
      let dosage = _.map(weight, (dos) => {
        return dos / calcCount;
      });
      // let fullDosage = weight
      //console.log({fullDosage});
      this.stores.actions.liquidForm = {
        name, // Название ДВ или ТН
        group, // группа раствора (0 - нет раствора, больше 0 - раствор)
        specials,
        freq,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosageBaseUnit: "248",
          dosage: dosage,
          count: calcCount,
          countUnit: current.calc.countUnit || liqCountUnit,
          countBaseUnit: current.calc.countBaseUnit || liqCountBaseUnit,
          dosageUnit: unit,
          dayCount: 1,
          fullDosage: weight,
          weightDosage: [0], //_.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          dayDosage: [0], // fullDosage,
          dayWeightDosage: [0], // _.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          durationCount: 1,
          durationUnit: "75",
          fullSpeed: [0], // fullDosage,
          weightSpeed: [0], // _.map( fullDosage, (dos) => { return patientWeight ? getToBase((unit || 248), dos)/patientWeight : 0 } ),
          tintSpeed: 0, // getFromBase( 799, fullDosage ),
          liquidSpeed: 0, //calcCount
        },
        schedule: {
          dateStart: null,
          dateFinish: null,
          finishAlternate: null,
          clarifications: null, //уточнения
          interval: null,
          once: null,
          week: null,
          calendar: null,
        },
      };
      setTimeout(this.recalcLiquidParams, 200);
      // console.log({
      //   dosage: weight,
      //   count: calcCount,
      //   dosageUnit: unit,
      //   dayCount: 1,
      //   fullDosage: fullDosage,
      //   weightDosage: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   dayDosage: fullDosage,
      //   dayWeightDosage: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   durationCount: 1,
      //   durationUnit: 75,
      //   fullSpeed: fullDosage,
      //   weightSpeed: _.map( fullDosage, (dos) => { return getToBase((unit || 248), dos)/patientWeight } ),
      //   tintSpeed: getFromBase( 799, fullDosage ),
      //   liquidSpeed: calcCount
      // });
    } else {
      // console.log('HERE 3');
      let {
        calc: {
          dosageBaseUnit,
          dosage,
          count,
          countUnit,
          countBaseUnit,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed,
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar,
        },
      } = current;
      this.stores.actions.liquidForm = {
        name, // Название ДВ или ТН
        group, // группа раствора (0 - нет раствора, больше 0 - раствор)
        specials,
        freq,
        freq_id,
        duration,
        duration_id,
        calc: {
          dosageBaseUnit,
          dosage,
          count,
          countUnit: countUnit || liqCountUnit,
          countBaseUnit: countBaseUnit || liqCountBaseUnit,
          dosageUnit,
          dayCount,
          fullDosage,
          weightDosage,
          dayDosage,
          dayWeightDosage,
          durationCount,
          durationUnit,
          fullSpeed,
          weightSpeed,
          tintSpeed,
          liquidSpeed,
        },
        schedule: {
          dateStart,
          dateFinish,
          finishAlternate,
          clarifications, //уточнения
          interval,
          once,
          week,
          calendar,
        },
      };
      if (this.stores.patients.current.weight && parseFloat(this.stores.patients.current.weight) > 0)
        this.recalcLiquidParams();
    }
    // this.liquid.set( group, _.assignIn(current, liquid) );
    this.listChanged = true;
    return true;
  };

  // search, creae and remove drugs
  /**
  // метод побуквенного поиска по ТН и ДВ
  * @param text - срока поиска
  * @param saveTo - в какой список сохранять овтет сервера
  */
  async search(text, saveTo = "search") {
    this.searchReady = false;
    let { active_language } = this.stores.actions;
    let data = {
      text,
      lib: "62, 52", //'61, 25' - заболевания
      service: "43",
      chain: 0,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `search/Drugs`,
      data,
      success: async (data) => {
        if (data.searched && data.searched !== text) {
          return;
        }
        if (data.concepts && data.concepts.length > 0 && _.isArray(data.concepts)) {
          await data.concepts.forEach((concept, i) => {
            data.concepts[i].key = "concept" + i;
            data.concepts[i].title = data.concepts[i].name;
          });
          this[`${saveTo}Rows`] = observable([]);
          this[`${saveTo}Rows`] = await _.unionWith(data.concepts, this[`${saveTo}Rows`], (a, b) => a.id === b.id);
          this.searchReady = true;
        } else if (data.concepts && data.concepts.length == 0 && _.isArray(data.concepts)) {
          this[`${saveTo}Rows`] = observable([]);
          this.searchReady = true;
        }
      },
      fail: (alerts) => {
        this.searchReady = true;
        // console.log('fail', alerts);
        this.stores.actions.makeAlerts(data);
      },
      always: (data) => {
        // this.stores.actions.makeAlerts(data)
      },
    });
  }

  // concept from search, flag - if true, do not clear data
  /**
  // метод создания драга при выборе из побуквенного поиска и добавления в лист назначения
  * @param concept - концепт из поиска
  * @param flag - если true, не сбрасывать проверки на варнинги
  * @param getDosages - если false, не запрашивать дозировки для драга
  * @param names - дополнительные строки наименований из метода Parse
  */
  selectFromSearch = async (concept, flag = false, getDosages = true, names) => {
    let drug = this.getNew();
    if (!concept.calc) concept.calc = drug.calc;
    if (!concept.dosage) concept.dosage = drug.dosage;
    if (!concept.schedule) concept.schedule = drug.schedule;
    if (!concept.helpers) concept.helpers = drug.helpers;
    drug = _.assignIn(drug, concept);

    drug.key = concept.key && concept.key.substring(0, 7) !== "concept" ? concept.key : moment().format("x").toString();

    await this.drug.set(drug.key, drug);

    // _.assignIn(this.current, drug);

    if (getDosages) {
      await this.stores.dosages.get(drug, false, names);
    }

    if (!flag) {
      await this.stores.db.clearData(false, true);
    }
    this.listChanged = true;
    return true;
  };

  /**
  // метод убирает драг из листа назанчения и при необходимости удаляет раствор, содержавший этот драг
  * @param drug - объект драга
  * @param onlyProto - если false, добавит в список удаленных не только текущую терапию, но и не сохраненные на бэке
  */
  async unselectDrug(drug, onlyProto = true) {
    if (drug.proto || !onlyProto) {
      // this.deletedRows.push(drug);
      this.unselectedRows.push(drug);
    }
    if (drug.group && drug.group != 0) {
      this.stores.actions.makeLiquids = true;
      this.removeLiquids([drug.group]);
    }
    await this.drug.delete(drug.key);
    // await this.stores.dosages.dosage.delete(drug.key)
    this.selectedRows = await _.xorWith(this.selectedRows, [drug], (a, b) => a.id === b.id);
    this.stores.db.clearData(false, true);
    this.checkLiquidsOk();
    this.listChanged = true;
    return true;
  }

  /**
  // метод отправляет произвольный текст с препаратами, дозировками и расписанеим приема на парсинг на бэк
  // и получает обратно список драгов с дозировками в нашем формате, после чего добавляет в лист назанчений
  * @param text - текст для парсинга
  */
  async Parse(text) {
    const texts = text.split("\n");
    const data = { texts };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    data.active_language = this.stores.actions.active_language;

    const saveTo = "parser";

    this.stores.actions.loading = true;
    return POST({
      path: `Drugs/Parse`,
      data,
      success: async (data) => {
        // console.log({ data });
        const { names } = data;
        if (data.drugs?.length === 0) this.stores.actions.makeAlerts(data);
        const filteredDrugs = data.drugs.filter((drug) => !!drug);
        // if (filteredDrugs && filteredDrugs.length > 0 && _.isArray(filteredDrugs)) {
        // await filteredDrugs.forEach((concept, i) => {
        // filteredDrugs[i].key = String(Math.floor(10000000000 * Math.random())); //moment().format("x").toString();
        // filteredDrugs[i].title = filteredDrugs[i].name;
        // });
        // }
        // const { drugs } = data;
        // console.log(
        //   { filteredDrugs },
        //   "asdasd: ",
        //   filteredDrugs.map((d) => ({
        //     ...d,
        //     helpers: this.getNew().helpers,
        //   }))
        // );
        // console.log("new drug: ", this.getNew());
        const drugs = filteredDrugs.map((d) => {
          let { dosage } = d;
          dosage = _.isArray(dosage.dosage) ? dosage.dosage : [dosage.dosage];
          // console.log({ dosage });
          let helpers = {
            dosage: {
              short: "",
              full:
                dosage[0] && dosage[0]?.id_1
                  ? `${_.map(dosage, "value_1").join(" + ")} ${data.shortnames[dosage[0].id_1]}`
                  : "",
              id: null,
            },
            pack: { short: "", full: "", id: null },
            type: _.isArray(dosage) && dosage.length > 1 ? "multi" : "simple",
            // url: "",
            key: null,
            way: "lf",
            step: 4,
            // mnn: false,
            // drugCache: null,
          };
          // } else if (_.isArray(dosage) && dosage.length === 1) {
          //   let val = dosage[0].value_2 ? dosage[0].value_1 / dosage[0].value_2 : dosage[0].value_1;
          //   currPack.dosage.full += val + " " + names[dosage[0].id_1];
          //   currPack.dosage.small += val + " " + (nameshort[dosage[0].id_1] || names[dosage[0].id_1]);
          //   currPack.value = [val];
          // }
          // currPack.pack.full +=
          //   names[packname] + ((pack && ", " + pack.value_1 + " " + (nameshort[pack.id_1] || names[pack.id_1])) || "");
          // currPack.pack.small +=
          //   (nameshort[packname] || names[packname]) +
          //   ((pack && ", " + pack.value_1 + " " + (nameshort[pack.id_1] || names[pack.id_1])) || "");
          return {
            ...d,
            helpers,
          };
        });
        // helpers: {
        //   dosage: {
        //     short: `${d.dosage[0].value_1} ${shortnames[d[0].id_1]}`,
        //   },
        // },
        // calc: this.getNew().calc,
        // }));
        drugs.forEach(async (drug, i) => {
          // console.log({ drug });
          await this.selectFromSearch(drug, false, true, names);
        });

        this.stores.actions.loading = false;
        // await this.stores.tools.stepByStepLoading(this.stores.dosages.get, filteredDrugs);
      },
      fail: (alerts) => {
        // this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
    });
  }

  /**
  // метод поиска драгов по фармгруппе, используется для отображения драгов внутри фармгруппы в строке поиска
  * @param drug - концепт из строки поиска
  */
  async searchByFG(drug) {
    let { active_language } = this.stores.actions;
    let data = {
      drug,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: "Drugs/ByFG",
      data,
      success: async (data) => {
        return [...data.childs, ...data.concepts];
      },
      fail: () => [],
    });
  }

  /**
  // метод поиска драгов по нозологии, используется для отображения драгов внутри нозологии в строке поиска
  * @param drug - концепт из строки поиска
  */
  async searchByNZ(drug) {
    let { active_language } = this.stores.actions;
    let data = {
      drug,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: "Drugs/ByNZ",
      data,
      success: async (data) => {
        return [...data.childs, ...data.concepts];
      },
      fail: () => [],
    });
  }

  /**
  // метод замены препарата в листе назнчения на один или несколько из формы подбора замены
  // а после запускает проверку на взаимодействия
  * @param drugKey - идентификатор драга в листе назначений
  */
  async choseNewDrugs(drugKey) {
    let concepts = [];
    let del = this.stores.drugs.drug.get(drugKey);
    this.unselectDrug(del);
    let length = this.stores.actions.checkedFg.length;
    await this.stores.actions.checkedFg.forEach(async (key, i) => {
      await this.selectFromSearch(this.drugsForFG[key]);
      // console.log({ i: i + 1, length });
      if (i + 1 == length) {
        // console.log("HERE");
        setTimeout(() => {
          this.stores.warnings.check();
        }, 200);
      }
    });
  }

  /**
  // метод поиска драгов по фармдействию, используется для формы подбора замены
  * @param key - идентификатор драга в листе назначений
  */
  async drugsByFD(key) {
    let { active_language } = this.stores.actions;
    let concepts = [];
    let concept = this.stores.drugs.drug.get(key);
    this.fdForSearch[concept.key].forEach((item, i) => {
      if (item.main) concepts.push({ id: item.id, name: item.name });
    });

    let data = {
      drug: concept,
      active_language,
      concepts,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    this.fds = [];
    this.fgs = [];
    this.drugsForFG = {};
    return POST({
      path: "Drugs/DrugsByFD",
      data,
      success: async (data) => {
        if (data.factions) {
          data.factions.forEach((fd, i) => {
            let { id, name, fgroups, drugs } = fd;
            this.fds.push({ id, name });
            fgroups.forEach((fg, i) => {
              this.fgs.push({
                fd: fd.id,
                id: fg.id,
                name: fg.name,
                drugs: fg.drugs,
              });
              fg.drugs.forEach((drug, x) => {
                this.drugsForFG[drug.id] = { key: `fgkey-${x}-${i}`, ...drug };
              });
            });
          });

          // this.drugsForFD = data.factions;
        }
        // console.log(data);
      },
      fail: () => [],
    });
  }

  /**
  // метод поиска фармдействий по драгу, используется для подбора замены препарата по фармдействию
  * @param concept - концепт драга
  */
  async FDbyDrug(concept) {
    let { active_language } = this.stores.actions;
    let data = {
      drug: concept,
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    if (this.fdForSearch[concept.key]) return;
    return POST({
      path: "Drugs/FDByDrug",
      data,
      success: async (data) => {
        if (data.concepts) {
          this.fdForSearch[concept.key] = data.concepts;
          if (data.concepts.length == 1) {
            this.stores.router.push(`/fgreplace/chosedv/${concept.key}`);
            this.drugsByFD(concept.key);
          }
          // data.concepts.forEach((item, i) => {
          //   this.fdForSearch.push(item);
          // });
        }
      },
      fail: () => [],
    });
  }
}
export default Drugs;
