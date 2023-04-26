import { observable, autorun, makeObservable } from "mobx";
import { POST } from "../lib/connect";
import { checkDouble } from "../lib/helpers";

import _ from "lodash";

class Tools {
  ready = false;
  searchReady = true;

  loadingCounter = 0;

  searchClinicRows = [];

  names = {};
  shortnames = {};
  latnames = {};
  latshortnames = {};

  units = {};
  unitarrs = {};

  unitsPharm = {};
  unitsPrimary = {};
  unitsComplex = {};
  unitsSchedule = {
    freq: {},
    duration: {},
  };

  techReady = false;
  functional = [];
  functionalReady = false;


  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      searchReady: observable,
      loadingCounter: observable,
      searchClinicRows: observable,
      names: observable,
      shortnames: observable,
      latnames: observable,
      latshortnames: observable,
      units: observable,
      unitarrs: observable,
      unitsPharm: observable,
      unitsPrimary: observable,
      unitsComplex: observable,
      unitsSchedule: observable,
      techReady: observable,
      functional: observable,
      functionalReady: observable,
    });

    this.stores = stores;
    this.router = stores.router;
    autorun(() => { });
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
          unitrefs[248].push("99");
          unitpharm.push("99");
          units[99] = _.cloneDeep(units[250]);
          units[99][0].value = 10;

          names[999999] = this.stores.actions.t("percent");
          nameshort[999999] = "%";
          // unitrefs[248].push("999999");
          unitpharm.push("999999");
          units[999999] = [
            { action: "division", id: "248", value: 1000 },
            // { action: "multiplication", id: "168", value: 0.1 },
          ];
          // units[99][0].value = 10;
          // units[99][1].value = 10;
          // console.log({ "%": units[99] });
        }
        // end kostyl

        await this.setNames(names, nameshort);
        this.setUnits(units, unitrefs, unitpharm);
        this.stores.actions.loading = false;
      },
      fail: (alerts) => { },
      always: (data) => {
        this.stores.actions.loading = false;
      },
    });
  }

  async getLatinNames(units) {
    units = units || [];
    this.stores.actions.loading = true;
    if (units.length > 0 && units.every((unit) => _.keys(this.units).includes(unit))) {
      return;
    }

    let arr = [];
    this.stores.drugs.drug.forEach((drug, i) => {
      drug.id && arr.push(drug.id);
      drug.freq_id && arr.push(drug.freq_id);
      drug.duration_id && arr.push(drug.duration_id);
      drug.calc.countUnit && arr.push(drug.calc.countUnit);
      drug.calc.dosageUnit && arr.push(drug.calc.dosageUnit);
      drug.dosage.method && arr.push(drug.dosage.method);
      drug.dosage.form && arr.push(drug.dosage.form);
      drug.dosage?.dosage && drug.dosage?.dosage[0]?.id_1 && arr.push(drug.dosage.dosage[0].id_1);
    });

    let data = {
      active_language: "la",
      ids: arr,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `info/Names`,
      data,
      success: async (data) => {
        // console.log(data);
        Object.assign(this.latnames, data.names);
        Object.assign(this.latshortnames, data.shortnames);
        // await this.setNames(names, nameshort);
        this.stores.actions.loading = false;
      },
      fail: (alerts) => { },
      always: (data) => {
        this.stores.actions.loading = false;
      },
    });
  }

  async setUnitsPharm(data) {
    // console.log(data);
    let { names, nameshort, units, unitrefs, unitpharm } = data;
    this.unitsPharm = data;
    // kostyl
    // if(units[99])
    if (units[250 || units[99]]) {
      names[99] = this.stores.actions.t("percent");
      nameshort[99] = "%";
      unitrefs[248].push("99");
      unitpharm.push("99");
      units[99] = _.cloneDeep(units[250]);
      units[99][0].value = 10;

      names[999999] = this.stores.actions.t("percent");
      nameshort[999999] = "%";
      // unitrefs[248].push("999999");
      unitpharm.push("999999");
      units[999999] = [
        { action: "division", id: "248", value: 1000 },
        // { action: "multiplication", id: "168", value: 0.1 },
      ];
      // units[99][0].value = 10;
      // units[99][1].value = 10;
      // console.log({ "%": units[99] });
    }
    // end kostyl

    await this.setNames(names, nameshort);
    this.setUnits(units, unitrefs, unitpharm);
    this.stores.actions.loading = false;
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
        let { units } = data;
        if (units) this.unitsPrimary = units;
        //this.setNames(names, nameshort)
      },
      fail: (alerts) => { },
      always: (data) => { },
    });
  }

  async setUnitsPrimary(data) {
    let { units } = data;
    if (units) this.unitsPrimary = units;
  }

  convertFromBaseUnitToUnit(baseUnitId, unitId, value) {
    const units = this.unitsPrimary;
    // console.log({ baseUnitId, unitId, value, units });
    if (baseUnitId === unitId || !units || !baseUnitId || !unitId || !units[baseUnitId]) return value;

    const convertedValue =
      value *
      units[baseUnitId].find((u) => {
        // console.log({ "u.id": u.id, unitId }, u.id == unitId);
        return u.id === unitId;
      }).value;
    // console.log({ convertedValue });
    return convertedValue;
  }

  convertFromUnitToBaseUnit(unitId, baseUnitId, value) {
    const units = this.unitsPrimary;
    // console.log({ baseUnitId, unitId, value, units });
    if (baseUnitId === unitId || !units || !baseUnitId || !unitId) return value;
    const convertedValue =
      value /
      units[baseUnitId].find((u) => {
        // console.log({ "u.id": u.id, unitId }, u.id == unitId);
        return u.id === unitId;
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
      fail: (alerts) => { },
      always: (data) => { },
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
      fail: (alerts) => { },
      always: (data) => { },
    });
  }

  async getAllService() {
    let { active_language } = this.stores.actions;
    let data = {
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `info/Tech`,
      data,
      success: async (data) => {
        // console.log("DATA", data);
        let {
          elements, //
          names,
          recipedata, //
          schedule,
          uitext, //
          unitspharm,
          unitsprimary,
        } = data;

        this.stores.actions.setObject("elements", elements);
        this.stores.actions.setObject("UIText", uitext);
        this.stores.actions.setObject("recipeData", recipedata);
        this.stores.actions.setObject("buttonTexts", names.text);

        this.setUnitsPharm(unitspharm);
        this.setUnitsPrimary(unitsprimary);

        this.unitsSchedule.freq = schedule.freq;
        this.unitsSchedule.duration = schedule.duration;

        this.setNames(schedule.names);

        this.techReady = true;
      },
      fail: (alerts) => {
        this.stores.actions.makeAlerts({ alerts });
      },
      always: (data) => { },
    });
  }

  hasFunctional(functionalCode) {
    if (!this) {
      console.log("Для разработчика - Не нужно экстрактить функцию hasFunctional. Теряется контекст.");
      return true;
    }

    // Если не из миса и не интеграционная версия (вход по ключу), то разрешены все функции
    if (this.stores.actions.misLinkLogin || this.stores.actions.privateKey) {
      return this.functional.includes(functionalCode);
    }

    return true;
  }

  async getFunctional() {
    let { active_language } = this.stores.actions;
    let data = {
      active_language,
    };
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: `auth/functional`,
      data,
      success: async (data) => {
        console.log("DATA", data);

        if (data.result && data.result.length) {
          this.functional = data.result;
        }

        /**
         * @todo Это заглушка, нужно удалить, когда с сервера придут данные
         * @description
        
        + Поиск, добавление и удаление ЛС    FindAddDeleteDrugs
        + Подбор дозировки и способа применения ЛС   SelectDosageMethodUsingDrugs
        + Подбор аналога ЛС     SelectAnalogDrugs
        + Инструкции по медицинскому применению ЛС    InstructionMedicalUseDrugs
        + Проверка списка препаратов (интерфейс)     CheckListDrugsInterface     
        + Замены препарата SelectReplacementDrug
        + Назначение фармакотерапии     AppointmentTherapy
        + Выписка документов    ExtractDocuments
        + Выписка рецепта   ExtractPrescription
        + Выписка протокола консилиума   ExtractProtocolCouncil
        + Выписка амбулаторного листа назначений    ExtractOutpatientAppointmentSheet
        + Выписка электронного рецепта   ExtractPrescriptionEDS
        + Поиск пациента    PatientSearch
        + Автоматическая загрузка генетического паспорта   AutomaticLoadingGenPassport
        + Ручное добавление мутаций гена    ManuallyAddGenMutations
        + Добавление и редактирование пациента    AddAndEditPatient
        + Подбор терапии по клиническим рекомендациям    SelectTherapyToClinicalRecommendations
        + Последние выбранные пациенты     LatestSelectedPatients
        - Возможность заполнять/изменять паспортные данные пациента EditPassportData
        - Проверка списка препаратов (прямой запрос, без формирования интерфейса)   CheckListDrugsNoInterface  


        + кнопки добавить, редактировать пациента
        + имя сдвинул вместо поиска
        + логику кнопки выписать

        - обработку ошибки при емейле и затем проверку емейла
        - крестики убрать в карточке пациента
        - уведомление Редактирование недоступно

         */

        // this.functional = [
        //   "FindAddDeleteDrugs", // строка поиска; кнопка Удалить препарат; кнопка Удалить раствор; кнопка "Убрать из раствора"; функция "Перетащить в раствор"; кнопка "Сбросить"; сообщение о том, что нужно внести препараты, если список пустой
        //   "SelectDosageMethodUsingDrugs", // кнопка Капля у препата; кнопка Капля у раствора; 
        //   "SelectAnalogDrugs", // кнопка Аналоги;
        //   "CheckListDrugsInterface", // Кпопки Проверить и Назначить/Выписать
        //   "InstructionMedicalUseDrugs", // клик по препарату
        //   "SelectReplacementDrug", // Кнопка Подобрать замену
        //   "AppointmentTherapy", // Кнопка Назначить
        //   "ExtractDocuments", // кнопка Выписать
        //   "ExtractPrescription", // кнопка Выписать рецепт
        //   "ExtractProtocolCouncil", // кнопка Протокол консилиума
        //   "ExtractOutpatientAppointmentSheet", // кнопка Выписка амбулаторного листа назначений
        //   "ExtractPrescriptionEDS", // кнопка Подписать 
        //   "AutomaticLoadingGenPassport", // кнопка загрузка генетического паспорта
        //   "ManuallyAddGenMutations", // поля Мутация гена
        //   "SelectTherapyToClinicalRecommendations", // кнопка Клинические рекомендации
        //   "PatientSearch", // поле поиска пациентов
        //   "LatestSelectedPatients", // блок со списком Последний выбранных пациентов
        //   "AddAndEditPatient", // форма пациента накрывается слоем, для блокировки всех интерактивных элементов
        //   "ViewPatientCard", // просмотр карты пациента
        //   "EditPassportData", // Кнопка Заполнить/свернуть паспортные данные
        // ];

        // Если ни одного варианта выписки нету, то саму кнопку Выписать тоже убираем
        if (!data.result.includes("ExtractProtocolCouncil") && !data.result.includes("ExtractPrescription") && !data.result.includes("ExtractOutpatientAppointmentSheet")) {
          this.functional = this.functional.filter(key => key !== "ExtractDocuments");
        }

        // Если хотя бы один вариант выписки есть, активируем кнопку Выписать (при этом, должна быть доступна проверка препаратов)
        if (data.result.includes("ExtractProtocolCouncil") || data.result.includes("ExtractPrescription") || data.result.includes("ExtractOutpatientAppointmentSheet")) {
          if (!this.functional.includes("ExtractDocuments") && data.result.includes("CheckListDrugsInterface")) {
            this.functional.push("ExtractDocuments");
          }
        }

        console.log(this.functional);
        this.functionalReady = true;
      },
      fail: (alerts) => {
        this.stores.actions.makeAlerts({ alerts });
      },
      always: (data) => { },
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

      if (Number(unitkey) === 99) {
        newunit.arr = "248";
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
    data.doctor_id = (this.stores.actions.doctor && this.stores.actions.doctor.id) || null;
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
    let { active_language, authkey } = this.stores.actions;

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
        this.stores.actions.makeAlerts(alerts);
        this.stores.actions.loading = false;
      },
      always(data) { },
    });
  }

  round = (val, dec = 4) => {
    let delimiter = Math.pow(10, dec);
    return Math.round(val * delimiter) / delimiter;
  };

  getFromBase = (unitId, value, double = 6, name = null) => {
    let { round } = this;

    let unit = this.units[unitId];
    if (!unit) return [0];

    if (!_.isArray(value)) value = [value];
    let checked = false;

    value.forEach((item, i) => {
      if (!checkDouble(item, false)) checked = true;
    });
    if (checked) return value;

    unit.contains.forEach((contain) => {
      if (contain.action === "division") {
        value = _.map(value, (dos) => round(dos * contain.value, double));
      } else {
        value = _.map(value, (dos) => round(dos / contain.value, double));
      }
    });

    return value || [];
  };

  getToBase = (unitId, value) => {
    if (!value) return "";
    if (
      value === "" ||
      value === 0 ||
      value === "0" ||
      value === "." ||
      (value.split && (value.split(",")[1] === "" || value.split(".")[1] === ""))
    )
      return value;

    let unit = this.units[unitId];
    if (!unit) return 0;
    let dosage = value;

    unit.contains.forEach((contain) => {
      if (contain.action === "division") {
        dosage = dosage / contain.value;
      } else {
        dosage = dosage * contain.value;
      }
    });

    return dosage;
  };

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async waitForTech(fn) {
    if (this.techReady) {
      return fn();
    } else {
      await this.timeout(200);
      return this.waitForTech(fn);
    }
  }


  async waitForFunctional(fn) {
    if (this.functionalReady) {
      return fn();
    } else {
      await this.timeout(200);
      return this.waitForFunctional(fn);
    }
  }
}
export default Tools;
