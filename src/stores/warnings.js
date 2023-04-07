import { observable, autorun, makeObservable } from "mobx";
import { POST } from "../lib/connect";

import _ from "lodash";

const colorPallette = [
  "#007b2b",
  "#cccccc", //"#b0d512",
  "#54C8FF",
  "#fff42b",
  "#ffca2f",
  "#fc7301",
  "#f42a03",
  "#6435C9",
  "#A333C8",
];

class Warnings {
  ready = false;
  groups = {};
  cautionsTitle = null;
  cautions = [];
  icons = {};

  groupsFg = {};
  cautionsTitleFg = null;
  cautionsFg = [];
  iconsFg = {};

  warningInfo = {};
  info = {
    names: observable({}),
    description: observable({}),
    guidance: observable({}),
    literature: observable({}),
    outcome: observable({}),
    urls: observable({}),
    hinttype: observable({}),
  };
  infoFg = {
    names: observable({}),
    description: observable({}),
    guidance: observable({}),
    literature: observable({}),
    outcome: observable({}),
    urls: observable({}),
    hinttype: observable({}),
  };

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      groups: observable,
      cautionsTitle: observable,
      cautions: observable,
      icons: observable,
      warningInfo: observable,

      groupsFg: observable,
      cautionsTitleFg: observable,
      cautionsFg: observable,
      iconsFg: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    this.warning = observable.map({}, "warning");
    this.warningFg = observable.map({}, "warningFg");

    autorun(() => { });
  }

  getGroup(val) {
    let color = "#cccccc";
    let group = 0;
    switch (true) {
      case val === 2:
        color = colorPallette[8];
        group = 0;
        break;
      case val === 3:
        color = colorPallette[7];
        group = 0;
        break;
      case val === -1:
        color = colorPallette[0];
        group = 1;
        break;
      case val === 0:
        color = colorPallette[1];
        group = 2;
        break;
      case val > 0 && val <= 0.17:
        color = colorPallette[2];
        group = 3;
        break;
      // case val > 0.2 && val <= 0.4:
      //   color = colorPallette[3]
      //   group = 4
      //   break;
      case val > 0.17 && val <= 0.5:
        color = colorPallette[4];
        group = 5;
        break;
      case val > 0.5 && val <= 0.75:
        color = colorPallette[5];
        group = 6;
        break;
      case val > 0.75 && val <= 1:
        color = colorPallette[6];
        group = 7;
        break;
      default:
        color = "#cccccc";
        group = 0;
    }
    return { color, group };
  }

  /**
  // метод отправки измененных данных обратно в МИС
  */
  async backToMis() {
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
      if (Number(liquid.group) !== 0) {
        data.liquids.push(liquid);
      }
    });

    //data.service = "43"
    data.active_language = active_language;

    // data.return_subjects = false
    // data.authkey = this.stores.actions.authkey
    // data.key = this.stores.actions.privateKey
    return POST({
      path: this.stores.actions.misurl, //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => { },
      fail: (alerts) => { },
      always: (data) => { },
    });
  }

  //getInfoPrep
  /**
  // метод проверки взаимодействий
  */
  async check() {
    if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.backToMis();

    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    this.stores.db.clearData(false, true);
    let data = _.cloneDeep(this.stores.actions.drugStructure);
    let drugsFull = Array.from(this.stores.drugs.drug.values());
    let liquidsFull = Array.from(this.stores.drugs.liquid.values());
    drugsFull.forEach((drugFull, i) => {
      if (!data.drugs) data.drugs = [];
      let { helpers, ...drug } = drugFull;
      data.drugs.push(drug);
    });
    liquidsFull.forEach((liquidFull, i) => {
      let { helpers, ...liquid } = liquidFull;
      if (Number(liquid.group) !== 0) {
        data.liquids.push(liquid);
      }
    });

    //data.service = "43"
    data.active_language = active_language;

    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    console.log(this.stores.actions.privateKey);
    return POST({
      path: "check/Warnings", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        console.log("1 resive data");
        //console.log('DATA', data);
        if (data && data.warnings && _.isArray(data.warnings)) {
          this.info.names = _.clone(data.names);
          this.info.description = _.clone(data.description);
          this.info.guidance = _.clone(data.guidance);
          this.info.literature = _.clone(data.literature);
          this.info.outcome = _.clone(data.outcome);
          this.info.urls = _.clone(data.urls);
          this.info.hinttype = _.clone(data.hinttype);
          this.info.fields = _.clone(data.fields);

          this.cautionsTitle = data.cautiontitle && data.names[data.cautiontitle];
          this.cautions =
            data.cautionitems &&
            data.cautionitems.map((caut) => {
              return data.names[caut];
            });

          let warnGroups = {};
          let warnIcons = {};

          console.log("2 clone data");

          let warningsToStore = {};


          await data.warnings.forEach((item, i) => {
            // console.log("cycle");
            if (!item.id || item.id.length < 1) item.id = null; //moment().format('x').toString()
            item.key = "warnkey_" + i;

            let { group, color } = this.getGroup(item.value);

            // Тормоза в отдельный поток
            // Вынесено за цикл
            // setTimeout(()=>{
            let current = this.warning.get(item.id) || {};
            // this.warning.set(item.key, _.assignIn(current, { group, color, ...item }));
            // });
            warningsToStore[item.key] = _.assignIn(current, { group, color, ...item })


            let hint = data.hinttype[item.type] && data.names[data.hinttype[item.type]];

            //разбивка по Драгам
            if (item.subjects && _.isArray(item.subjects)) {
              item.subjects.forEach((subject, s) => {
                //создание варнингов по Драгам
                if (!warnGroups[item.type]) {
                  warnGroups[item.type] = {
                    type: item.type,
                    value: item.value,
                    valuecolor: color,
                    group,
                    hint,
                    hintarr: item.hint,
                  };
                } else {
                  if (group > warnGroups[item.type].group) {
                    warnGroups[item.type].value = item.value;
                    warnGroups[item.type].valuecolor = color;
                    warnGroups[item.type].group = group;
                    warnGroups[item.type].hintarr = _.unionWith(warnGroups[item.type].hintarr, item.hint, _.isEqual);
                  }
                }
                if (subject.type === "drug") {
                  //иконки к Драгам
                  if (!warnIcons[subject.drugkey] || group > warnIcons[subject.drugkey].group) {
                    warnIcons[subject.drugkey] = {
                      value: item.value,
                      color,
                      group,
                      // если нужен подбор по фармгруппе
                      needChange:
                        (warnIcons[subject.drugkey] && warnIcons[subject.drugkey].needChange) ||
                        (item.type === "interdrug" && item.value > 0.5),
                    };
                  }
                }
              });
            }
          });


          this.warning.replace(warningsToStore);
          console.log("3 warnings ready");
          this.icons = _.assignIn(this.warnIcons, warnIcons);
          this.groups = _.assignIn(this.groups, warnGroups);
        }

        this.stores.actions.loading = false;
        console.log("4 END");
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  }

  /**
  // метод проверки варнингов для формы подбора замены
  * @param drugsChecked - выбранные для замены препараты (проверка идет между ними и теми, что в листе назначений, кроме заменяемого)
  */
  async checkFg(drugsChecked) {
    // if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.backToMis();

    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    // this.stores.db.clearData(false, true);
    let data = _.cloneDeep(this.stores.actions.drugStructure);
    let drugsFull = Array.from(this.stores.drugs.drug.values());

    // drug we will change
    let myDrugKey = (this.stores.router.values && this.stores.router.values.drug) || null;

    // drugs from fd and fg
    let { drugsForFG } = this.stores.drugs;

    drugsChecked.forEach((drug, i) => {
      data.drugs.push(drugsForFG[drug]);
    });

    drugsFull.forEach((drugFull, i) => {
      if (myDrugKey === drugFull.key) {
        //maybe dosage
      } else {
        if (!data.drugs) data.drugs = [];
        let { helpers, ...drug } = drugFull;
        data.drugs.push(drug);
      }
    });
    // liquidsFull.forEach((liquidFull, i) => {
    //   let { helpers, ...liquid } = liquidFull;
    //   if (liquid.group != 0) {
    //     data.liquids.push(liquid);
    //   }
    // });

    //data.service = "43"
    data.active_language = active_language;

    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: "check/Warnings", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        console.log("DATA", data);
        if (data && data.warnings && _.isArray(data.warnings)) {
          this.infoFg.names = _.clone(data.names);
          this.infoFg.description = _.clone(data.description);
          this.infoFg.guidance = _.clone(data.guidance);
          this.infoFg.literature = _.clone(data.literature);
          this.infoFg.outcome = _.clone(data.outcome);
          this.infoFg.urls = _.clone(data.urls);
          this.infoFg.hinttype = _.clone(data.hinttype);
          this.infoFg.fields = _.clone(data.fields);

          this.cautionsTitleFg = data.cautiontitle && data.names[data.cautiontitle];
          this.cautionsFg =
            data.cautionitems &&
            data.cautionitems.map((caut) => {
              return data.names[caut];
            });

          let warnGroups = {};
          let warnIcons = {};
          await data.warnings.forEach((item, i) => {
            if (!item.id || item.id.length < 1) item.id = null; //moment().format('x').toString()
            item.key = "warnkey_" + i;

            let { group, color } = this.getGroup(item.value);
            let current = this.warningFg.get(item.id) || {};
            this.warningFg.set(item.key, _.assignIn(current, { group, color, ...item }));

            let hint = data.hinttype[item.type] && data.names[data.hinttype[item.type]];

            //разбивка по Драгам
            if (item.subjects && _.isArray(item.subjects)) {
              item.subjects.forEach((subject, s) => {
                //создание варнингов по Драгам
                if (!warnGroups[item.type]) {
                  warnGroups[item.type] = {
                    type: item.type,
                    value: item.value,
                    valuecolor: color,
                    group,
                    hint,
                    hintarr: item.hint,
                  };
                } else {
                  if (group > warnGroups[item.type].group) {
                    warnGroups[item.type].value = item.value;
                    warnGroups[item.type].valuecolor = color;
                    warnGroups[item.type].group = group;
                    warnGroups[item.type].hintarr = _.unionWith(warnGroups[item.type].hintarr, item.hint, _.isEqual);
                  }
                }
                if (subject.type === "drug") {
                  //иконки к Драгам
                  if (!warnIcons[subject.drugkey] || group > warnIcons[subject.drugkey].group) {
                    warnIcons[subject.drugkey] = {
                      value: item.value,
                      color,
                      group,
                      // если нужен подбор по фармгруппе
                      needChange:
                        (warnIcons[subject.drugkey] && warnIcons[subject.drugkey].needChange) ||
                        (item.type === "interdrug" && item.value >= 0.5),
                    };
                  }
                }
              });
            }
          });

          this.iconsFg = _.assignIn(this.warnIconsFg, warnIcons);
          this.groupsFg = _.assignIn(this.groupsFg, warnGroups);
        }

        this.stores.actions.loading = false;
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  }

  /**
  // метод получения протокола из МИСа
  * @param protocol - айди протокола
  */
  async protocol(protocol) {
    // console.log("HERE HERE");
    if (!protocol || protocol === "" || typeof protocol == "undefined") return;
    if (!this.stores.router) {
      return;
    }
    // console.log('HERE', protocol);
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    this.stores.router.push("/");
    return POST({
      path: "mis/Protocol",
      data: { key: protocol, active_language },
      success: async (data) => {
        if (!data.drugs) {
          this.stores.actions.loading = false;
          return;
        }

        if (data.authkey) this.stores.actions.authkey = data.authkey;
        if (data.key) this.stores.actions.privateKey = data.key;

        if (data.misurl) this.stores.actions.misurl = data.misurl;

        if (data && data.drugs && _.isArray(data.drugs)) {
          await data.drugs.forEach(async (drug, i) => {
            await this.stores.drugs.selectFromSearch(drug, true);
          });
        }

        if (data && data.warnings && _.isArray(data.warnings)) {
          this.info.names = _.clone(data.names);
          this.info.description = _.clone(data.description);
          this.info.guidance = _.clone(data.guidance);
          this.info.literature = _.clone(data.literature);
          this.info.outcome = _.clone(data.outcome);
          this.info.urls = _.clone(data.urls);
          this.info.hinttype = _.clone(data.hinttype);

          let warnGroups = {};
          let warnIcons = {};
          await data.warnings.forEach((item, i) => {
            if (!item.id || item.id.length < 1) item.id = null; //moment().format('x').toString()
            item.key = "warnkey_" + i;

            let { group, color } = this.getGroup(item.value);

            let current = this.warning.get(item.id) || {};
            this.warning.set(item.key, _.assignIn(current, { group, color, ...item }));

            let hint = data.hinttype[item.type] && data.names[data.hinttype[item.type]];

            //разбивка по Драгам
            if (item.subjects && _.isArray(item.subjects)) {
              item.subjects.forEach((subject, s) => {
                //создание варнингов по Драгам
                if (!warnGroups[item.type]) {
                  warnGroups[item.type] = {
                    type: item.type,
                    value: item.value,
                    valuecolor: color,
                    group,
                    hint,
                    hintarr: item.hint,
                  };
                } else {
                  if (group > warnGroups[item.type].group) {
                    warnGroups[item.type].value = item.value;
                    warnGroups[item.type].valuecolor = color;
                    warnGroups[item.type].group = group;
                    warnGroups[item.type].hintarr = _.unionWith(warnGroups[item.type].hintarr, item.hint, _.isEqual);
                  }
                }
                if (subject.type === "drug") {
                  //иконки к Драгам
                  if (!warnIcons[subject.drugkey] || group > warnIcons[subject.drugkey].group) {
                    warnIcons[subject.drugkey] = {
                      value: item.value,
                      color,
                      group,
                    };
                  }
                }
              });
            }
          });

          this.icons = _.assignIn(this.warnIcons, warnIcons);
          this.groups = _.assignIn(this.groups, warnGroups);
        }
        // this.stores.actions.loading = false

        // setTimeout(() => {

        this.stores.actions.loading = false;
        this.stores.actions.authorized = true;
        // }, 3000)
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
        this.stores.actions.authorized = true;
        this.stores.actions.makeAlerts({
          alerts: [
            {
              title: this.stores.actions.t("error"),
              message: this.stores.actions.t("protocol_request_error_occurred"),
              level: "error",
              sticky: true,
            },
          ],
        });
        this.stores.router.push("/login");
      },
      always: (data) => { },
    });
  }

  /**
  // метод дополнительного текста для варнинга
  * @param firstDrugId - айди первого драга в варнинге
  * @param lastDrugId - айди последнго драга
  * @param fieldId - айди поля в варнинге
  */
  async getWarningInfo(firstDrugId, lastDrugId, fieldId) {
    const data = {};

    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    data.active_language = this.stores.actions.active_language;
    data.warnings = [];
    firstDrugId &&
      data.warnings.push({
        fields: fieldId,
        id: firstDrugId,
      });
    lastDrugId &&
      data.warnings.push({
        fields: fieldId,
        id: lastDrugId,
      });
    return POST({
      path: `Check/WarningInfo`,
      data,
      success: async (data) => {
        data.warnings &&
          data.warnings.forEach((w) => {
            this.warningInfo[w.id] = w.text;
          });
      },
    });
  }

  // async checkMisWarnings() {
  //   let { active_language } = this.stores.actions;
  //   //https://ecp.socmedica.dev/ResultChecking/CvYBCgASGHM2MENzVHluSTFUbjN3MDdCZUphRlJkcBoYR0dxVUtBQThRVFdsdDZaelNIWFE1QT09IglRV0VSVFlfNDEqDiAgfDAxXzAzXzE5OTF8MhhXZ0dvd3RrL2hZR1F5WEFlSlNyVE9BPT06B1FXRVJUWV9CFdCc0L7RjyDQutC70LjQvdC40LrQsGIYUjd2U3N1Z3QzeUlYeXh5aFQwWnlqZz09aghRV0VSVFlfM3Ih0JDQudCx0L7Qu9C40YIg0J_QuNC70Y7Qu9GM0LrQuNC9ehg2MmNiZjVhZGUzNzExMzJmNjgyMWM2ZjWCAQcyMDIyXzA3
  //   return POST({
  //     path: "mis/ResultChecking",
  //     data: {
  //       key:
  //         "CvYBCgASGHM2MENzVHluSTFUbjN3MDdCZUphRlJkcBoYR0dxVUtBQThRVFdsdDZaelNIWFE1QT09IglRV0VSVFlfNDEqDiAgfDAxXzAzXzE5OTF8MhhXZ0dvd3RrL2hZR1F5WEFlSlNyVE9BPT06B1FXRVJUWV9CFdCc0L7RjyDQutC70LjQvdC40LrQsGIYUjd2U3N1Z3QzeUlYeXh5aFQwWnlqZz09aghRV0VSVFlfM3Ih0JDQudCx0L7Qu9C40YIg0J_QuNC70Y7Qu9GM0LrQuNC9ehg2MmNiZjVhZGUzNzExMzJmNjgyMWM2ZjWCAQcyMDIyXzA3",
  //       active_language,
  //     },
  //     success: async (data) => {
  //       console.log({ data });
  //     },
  //   });
  // }
  async checkMisWarnings({ key, authkey, protocol }) {
    // console.log("HERE ", protocol);
    if (!protocol || protocol === "" || typeof protocol == "undefined") return;
    if (!this.stores.router) {
      return;
    }

    let { active_language } = this.stores.actions;
    this.stores.actions.loading = true;
    this.stores.router.push("/");

    let path = "mis/ResultChecking";
    let data = {
      key: protocol,
      active_language,
    };

    if (key && authkey) {
      path = "Statistics/GetProtocol";
      data = {
        key,
        authkey,
        protocolId: protocol,
        active_language,
      };
    }


    // console.log('HERE', protocol);
    return POST({
      path,
      data,
      success: async (data) => {
        if (!data.drugs) {
          this.stores.actions.loading = false;
          return;
        }

        if (data.authkey) this.stores.actions.authkey = data.authkey;
        if (data.key) this.stores.actions.privateKey = data.key;

        if (data.lang && this.stores.actions.active_language !== data.lang) {
          this.stores.actions.active_language = data.lang;
          await localStorage.setItem("lang", data.lang);
          this.stores.tools.getAllService();
        }

        console.log(this.stores.actions.privateKey);

        if (data.misurl) this.stores.actions.misurl = data.misurl;
        if (data && data.liquids && _.isArray(data.liquids)) {
          data.liquids.forEach(async (liquid, i) => {
            if (liquid.group != null) {
              let errs = this.stores.drugs.validateDrug(liquid);
              if (errs.length > 0) console.log({ name: `раствор ${liquid.group}`, errs });
              await this.stores.drugs.liquid.set(liquid.group, liquid);
            } else {
              this.stores.drugs.deletedLiquids.push(liquid);
            }
          });
        }

        if (data && data.drugs && _.isArray(data.drugs)) {
          let { drugs } = data;
          drugs = drugs.map((d) => {
            if (d.helpers) return d;
            let { dosage } = d;
            dosage.dosage = _.isArray(dosage.dosage) ? dosage.dosage : [dosage.dosage];
            // console.log({ dosage });
            // KOSTYL
            dosage.pack = {
              id: "",
              dosage: {
                id_1: d.calc?.countUnit,
                type: "value",
                value_1: 1,
              },
            };

            // END KOSTYL
            const { nameshort } = this.stores.tools.unitsPharm;
            nameshort[99] = "%";
            // console.log({ d });
            let helpers = {
              dosage: {
                short: "",
                full:
                  (dosage.dosage[0] && dosage.dosage[0]?.id_1
                    ? `${_.map(dosage.dosage, "value_1").join(" + ")} ${nameshort[dosage.dosage[0].id_1]}`
                    : "") || "",
                id: dosage.dosage[0]?.id_1,
              },
              pack: { short: "", full: "", id: d?.dosage?.pack?.dosage?.id_1 || d?.calc?.countUnit },
              type: _.isArray(dosage.dosage) && dosage.dosage.length > 1 ? "multi" : "simple",
              // url: "",
              key: null,
              way: "lf",
              step: d?.dosage?.method && d?.dosage?.form ? "4" : "1",
              // mnn: false,
              // drugCache: null,
            };
            return {
              ...d,
              dosage,
              helpers,
            };
          });
          // console.log("drugs with helpers: ", drugs);

          drugs.forEach(async (drug, i) => {
            await this.stores.drugs.selectFromSearch(drug, false, false);
            if (drug.dosage && drug.dosage.form && drug.dosage.form_name) {
              // console.log("this.stores.tools.unitsPharm.names");
              this.stores.tools.unitsPharm.names[drug.dosage.form] = drug.dosage.form_name;
            }
            if (drug.dosage && drug.dosage.method && drug.dosage.method_name) {
              this.stores.tools.unitsPharm.names[drug.dosage.method] = drug.dosage.method_name;
            }
          });

          await this.stores.tools.stepByStepLoading(this.stores.dosages.get, drugs);
          // await data.drugs.forEach(async (drug, i) => {
          //   await this.stores.drugs.selectFromSearch(drug, true);
          // });
        }

        if (data.patient) {
          // setTimeout(() => {
          this.stores.patients.setCurrent(data.patient);
          // }, 1000);
        }

        if (data && data.warnings && _.isArray(data.warnings)) {
          this.info.names = _.clone(data.names);
          this.info.description = _.clone(data.description);
          this.info.guidance = _.clone(data.guidance);
          this.info.literature = _.clone(data.literature);
          this.info.outcome = _.clone(data.outcome);
          this.info.urls = _.clone(data.urls);
          this.info.hinttype = _.clone(data.hinttype);

          let warnGroups = {};
          let warnIcons = {};
          await data.warnings.forEach((item, i) => {
            if (!item.id || item.id.length < 1) item.id = null; //moment().format('x').toString()
            item.key = "warnkey_" + i;

            let { group, color } = this.getGroup(item.value);
            let current = this.warning.get(item.id) || {};
            this.warning.set(item.key, _.assignIn(current, { group, color, ...item }));

            let hint = data.hinttype[item.type] && data.names[data.hinttype[item.type]];

            //разбивка по Драгам
            if (item.subjects && _.isArray(item.subjects)) {
              item.subjects.forEach((subject, s) => {
                //создание варнингов по Драгам
                if (!warnGroups[item.type]) {
                  warnGroups[item.type] = {
                    type: item.type,
                    value: item.value,
                    valuecolor: color,
                    group,
                    hint,
                    hintarr: item.hint,
                  };
                } else {
                  if (group > warnGroups[item.type].group) {
                    warnGroups[item.type].value = item.value;
                    warnGroups[item.type].valuecolor = color;
                    warnGroups[item.type].group = group;
                    warnGroups[item.type].hintarr = _.unionWith(warnGroups[item.type].hintarr, item.hint, _.isEqual);
                  }
                }
                if (subject.type === "drug") {
                  //иконки к Драгам
                  if (!warnIcons[subject.drugkey] || group > warnIcons[subject.drugkey].group) {
                    warnIcons[subject.drugkey] = {
                      value: item.value,
                      color,
                      group,
                    };
                  }
                }
              });
            }
          });

          this.icons = _.assignIn(this.warnIcons, warnIcons);
          this.groups = _.assignIn(this.groups, warnGroups);
        }
        // this.stores.actions.loading = false

        this.stores.tools.getFunctional();
        await this.stores.tools.waitForFunctional(() => { });


        // Эти данные брались из запроса authCheck, но при ResultCheck, запроса на authCheck больше нет.
        this.stores.actions.drugStructure.clinic_code = data.clinic_code;
        this.stores.actions.drugStructure.clinic_id = data.clinic_id;
        this.stores.actions.drugStructure.clinic_name = data.clinic_name;

        this.stores.actions.drugStructure.doctor_code = data.doctor_code;
        this.stores.actions.drugStructure.doctor_id = data.doctor_id;
        this.stores.actions.drugStructure.doctor_name = data.doctor_name;

        console.log("data.doctor_name", data.doctor_name);

        // setTimeout(() => {

        this.stores.actions.loading = false;
        this.stores.actions.authorized = true;
        // }, 3000)
      },
      fail: (alerts) => {
        console.log({ alerts });
        this.stores.actions.loading = false;
        this.stores.actions.authorized = true;
        this.stores.actions.makeAlerts({
          alerts: [
            {
              title: this.stores.actions.t("error"),
              message: this.stores.actions.t("protocol_request_error_occurred"),
              level: "error",
              sticky: true,
            },
          ],
        });
        this.stores.router.push("/login");
      },
      always: (data) => { },
    });
  }
}

export default Warnings;
