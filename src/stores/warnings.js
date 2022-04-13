import { observable, action, autorun, computed, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment, { relativeTimeThreshold } from "moment";

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

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      groups: observable,
      cautionsTitle: observable,
      cautions: observable,
      icons: observable,
      warningInfo: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    this.warning = observable.map({}, "warning");

    autorun(() => {});
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
      if (liquid.group != 0) {
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
      success: async (data) => {},
      fail: (alerts) => {},
      always: (data) => {},
    });
  }

  //getInfoPrep
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
      if (liquid.group != 0) {
        data.liquids.push(liquid);
      }
    });

    //data.service = "43"
    data.active_language = active_language;

    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    return POST({
      path: "check/Warnings", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
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
          let warnForDrug = {};
          let warnForGroup = {};
          await data.warnings.forEach((item, i) => {
            if (!item.id || item.id.length < 1) item.id = null; //moment().format('x').toString()
            item.key = "warnkey_" + i;

            let { group, color } = this.getGroup(item.value);
            let wKey = `${item.type}_${group}`;

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

          this.icons = _.assignIn(this.warnIcons, warnIcons);
          this.groups = _.assignIn(this.groups, warnGroups);
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

  async protocol(protocol) {
    if (!protocol || protocol == "" || typeof protocol == "undefined") return;
    if (!this.stores.router) {
      return;
    }
    // console.log('HERE', protocol);
    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    this.stores.router.push("/");
    return POST({
      path: "mis/Protocol", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data: { key: protocol, active_language },
      success: async (data) => {
        if (!data.drugs) {
          this.stores.actions.loading = false;
          return;
        }

        if (data.authkey) this.stores.actions.privateKey = data.authkey;

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
          let warnForDrug = {};
          let warnForGroup = {};
          await data.warnings.forEach((item, i) => {
            if (!item.id || item.id.length < 1) item.id = null; //moment().format('x').toString()
            item.key = "warnkey_" + i;

            let { group, color } = this.getGroup(item.value);
            let wKey = `${item.type}_${group}`;

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
      always: (data) => {},
    });
  }

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
}

export default Warnings;
