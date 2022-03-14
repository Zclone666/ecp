import { observable, action, autorun, computed, observe, makeObservable } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";

class Recipes {
  ready = false;
  code = null;
  recipe_endtime = null;
  recipe_endtimeitem = null;
  recipe_formid = null;
  recipe_text = null;
  mkb10code = null;
  recipeDiseaseId = null;
  financingSource = null;
  citizenCategory = null;
  compensation = null;
  snils = null;
  insuranceNumber = null;
  patientCard = null;

  formType = null;

  cito = false;
  statim = false;
  special = false;
  spectext = "";

  emailSent = false;
  drugKeysForPrescription = [];
  maxcount = 0;

  digitallySignedRecipe = null;
  certificateBase64 = null;
  stringifiedSignData = null;

  cert_owner = null;
  cert_code = null;
  validity_start_date = null;
  validity_end_date = null;

  constructor({ stores }) {
    makeObservable(this, {
      ready: observable,
      code: observable,
      recipe_endtime: observable,
      recipe_endtimeitem: observable,
      recipe_formid: observable,
      recipe_text: observable,
      mkb10code: observable,
      recipeDiseaseId: observable,
      financingSource: observable,
      citizenCategory: observable,
      compensation: observable,
      snils: observable,
      insuranceNumber: observable,
      patientCard: observable,
      cito: observable,
      statim: observable,
      special: observable,
      spectext: observable,
      emailSent: observable,
      drugKeysForPrescription: observable,
      maxcount: observable,
      digitallySignedRecipe: observable,
      certificateBase64: observable,
      stringifiedSignData: observable,
      cert_owner: observable,
      cert_code: observable,
      validity_start_date: observable,
      validity_end_date: observable,
    });

    this.stores = stores;
    this.router = stores.router;

    this.recipe = {
      data: observable.map({}, "recipe"),
      ready: observable.box(true),
    };

    autorun(() => {});

    observe(this, (change) => {
      if (change.name == "recipeDiseaseId") {
        this.getMKB10();
      }
    });
  }

  resetState = () => {
    this.ready = false;
    this.code = null;
    this.recipe_endtime = null;
    this.recipe_endtimeitem = null;
    this.recipe_formid = null;
    this.recipe_text = null;
    this.mkb10code = null;
    this.recipeDiseaseId = null;
    this.financingSource = null;
    this.citizenCategory = null;
    this.compensation = null;
    this.snils = null;
    this.insuranceNumber = null;
    this.patientCard = null;

    this.cito = false;
    this.statim = false;
    this.special = false;
    this.pectext = "";

    this.emailSent = false;
    this.drugKeysForPrescription = [];
    this.maxcount = 0;

    this.digitallySignedRecipe = null;
    this.certificateBase64 = null;
    this.stringifiedSignData = null;

    this.cert_owner = null;
    this.cert_code = null;
    this.validity_start_date = null;
    this.validity_end_date = null;
  };

  getDataToSign = () => {
    let { active_language } = this.stores.actions;
    let data = {
      ...this.stores.actions.structure,
      drugs: this.stores.actions.structure.drugs.filter((drug) => this.drugKeysForPrescription.includes(drug.key)),
    };
    data.service = "43";
    data.active_language = active_language;
    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    data.recipe_endtime = this.recipe_endtime;
    data.recipe_endtimeitem = this.recipe_endtimeitem;
    data.recipe_formid = this.recipe_formid;
    data.recipe_text = this.recipe_text;
    data.mkb10code = this.mkb10code;
    data.financingSource = this.financingSource;
    data.citizenCategory = this.citizenCategory;
    data.compensation = this.compensation;
    data.fio = this.stores.patients.current.fio;
    data.birthdate = this.stores.patients.current.birthdate;
    data.doctor_name = this.stores.actions.drugStructure.doctor_name;
    data.snils = this.snils;
    data.insuranceNumber = this.insuranceNumber;
    data.patientCard = this.patientCard;
    data.clinic_id = this.stores.actions.drugStructure.clinic_id;

    data.recipe_data = {
      formid: this.recipe_formid,
      recipe_text: this.recipe_text,
      recipe_endtime: this.recipe_endtime,
      recipe_endtimeitem: this.recipe_endtimeitem,
      pcatcode: this.citizenCategory,
      pdiscount: this.financingSource,
      cito: this.cito,
      statim: this.statim,
      special: this.special,
      spectext: this.spectext,
    };
    return data;
  };

  save = async () => {
    if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();

    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    await this.stores.db.clearData(false, true);
    // let data = this.stores.actions.structure;
    let data = {
      ...this.stores.actions.structure,
      drugs: this.stores.actions.structure.drugs
        .filter((drug) => this.drugKeysForPrescription.includes(drug.key))
        .map((d) => {
          if (d?.dosage?.dosage?.length == 0 && d?.calc?.dosage?.[0] == 0) {
            return { ...d, calc: { ...d.calc, count: null, countBaseUnit: null, countUnit: null, dayCount: null } };
          } else return d;
        }),
    };
    // let drugsFull = Array.from(this.stores.drugs.drug.values());
    // let liquidsFull = Array.from(this.stores.drugs.liquid.values());
    // drugsFull.forEach((drugFull, i) => {
    //   let { helpers, ...drug } = drugFull;
    //   data.drugs.push(drugFull);
    // });
    // liquidsFull.forEach((liquidFull, i) => {
    //   let { helpers, ...liquid } = liquidFull;
    //   if (liquid.group != 0) {
    //     data.liquids.push(liquidFull);
    //   }
    // });

    data.service = "43";
    data.active_language = active_language;
    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    data.recipe_endtime = this.recipe_endtime;
    data.recipe_endtimeitem = this.recipe_endtimeitem;
    data.recipe_formid = this.recipe_formid;
    data.recipe_text = this.recipe_text;
    data.mkb10code = this.mkb10code;
    data.financingSource = this.financingSource;
    data.citizenCategory = this.citizenCategory;
    data.compensation = this.compensation;
    data.fio = this.stores.patients.current.fio;
    data.birthdate = this.stores.patients.current.birthdate;
    data.doctor_name = this.stores.actions.drugStructure.doctor_name;
    data.snils = this.snils;
    data.insuranceNumber = this.insuranceNumber;
    data.patientCard = this.patientCard;
    data.clinic_id = this.stores.actions.drugStructure.clinic_id;

    data.forFront = this.stringifiedSignData;

    data.recipe_data = {
      formid: this.recipe_formid,
      recipe_text: this.recipe_text,
      recipe_endtime: this.recipe_endtime,
      recipe_endtimeitem: this.recipe_endtimeitem,
      pcatcode: this.citizenCategory,
      pdiscount: this.financingSource,
      cito: this.cito,
      statim: this.statim,
      special: this.special,
      spectext: this.spectext,
      docsign: this.digitallySignedRecipe,
      doccertify: this.certificateBase64,
      cert_owner: this.cert_owner,
      cert_code: this.cert_code,
      validity_start_date: this.validity_start_date,
      validity_end_date: this.validity_end_date,
      formType: this.formType,
    };

    const data2 = {
      key: this.stores.actions.privateKey,
      authkey: this.stores.actions.authkey,
      active_language: active_language,
      message: JSON.stringify(data), //this.stringifiedSignData,
      certificate: this.certificateBase64,
      signed_data: this.digitallySignedRecipe,
    };
    // console.log(data2, data);
    return POST({
      path: this.stringifiedSignData ? "Prescript/RecipeNewEDS" : "prescript/recipeNew", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data: this.stringifiedSignData ? data2 : data,
      success: async (data) => {
        if (data && data.code) {
          this.code = data.code;

          this.stores.actions.makeAlerts({
            alerts: [
              {
                title: this.stores.actions.t("recipe_discharged"),
                message: this.stores.actions.t("you_print_send_mail"),
                level: "success",
                sticky: false,
              },
            ],
          });

          return data.code;
        } else {
          return false;
        }
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
        this.stores.actions.loading = false;
      },
    });
  };

  getMKB10 = async () => {
    let { active_language } = this.stores.actions;
    let data = {
      active_language: active_language,
      authkey: this.stores.actions.authkey,
      key: this.stores.actions.privateKey,
      id: this.recipeDiseaseId,
    };
    return POST({
      path: `Info/GetMKB10`,
      data,
      success: async (data) => {
        this.mkb10code = data.code;
      },
      fail: (alerts) => {},
      always: (data) => {},
    });
  };

  print = async () => {
    if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();

    // this.stores.actions.loading = true
    let { active_language } = this.stores.actions;
    // await this.stores.db.clearData(false, true)
    // let data = await _.clone(this.stores.actions.drugStructure)
    // data.drugs = await Array.from(this.stores.drugs.drug.values())
    let data = {};

    data.service = "43";
    data.active_language = active_language;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    data.recipe = this.code;
    data.email = this.stores.actions.patientForm.email;
    return POST({
      path: "prescript/recipePrint", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        // console.log(data);
        return data.code;
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  };

  notSavePrint = async () => {
    // if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();

    // let { active_language } = this.stores.actions;
    // let data = {};

    // data.service = "43";
    // data.active_language = active_language;
    // data.authkey = this.stores.actions.authkey;
    // data.key = this.stores.actions.privateKey;
    // data.recipe = this.code;
    // data.email = this.stores.actions.patientForm.email;
    console.log(this.recipe_formid, "this.stores.actions.recipe_formid");
    if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();

    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    await this.stores.db.clearData(false, true);
    let data = this.stores.actions.structure;

    data.service = "43";
    data.active_language = active_language;
    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    data.recipe_data = {
      formid: this.recipe_formid,
      recipe_text: this.recipe_text,
      recipe_endtime: this.recipe_endtime,
      recipe_endtimeitem: this.recipe_endtimeitem,
      pcatcode: this.citizenCategory,
      pdiscount: this.financingSource,
      cito: this.cito,
      statim: this.statim,
      special: this.special,
      spectext: this.spectext,
      docsign: this.digitallySignedRecipe,
      doccertify: this.certificateBase64,
      cert_owner: this.cert_owner,
      cert_code: this.cert_code,
      validity_start_date: this.validity_start_date,
      validity_end_date: this.validity_end_date,
      formType: this.formType,
    };

    // data.recipe_data = { recipe_formid: this.recipe_formid, formType: type };
    data.recipe_formid = this.recipe_formid;
    data.сlinical_guidelines = this.stores.clinrecs.drugToClinrecHashset;
    data.checker = this.stores.actions.clinrecCheckerData; //this.stores.clinrecs.checker;

    return POST({
      path: "prescript/NotSaveRecipePrint", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        console.log(data);
        return data.code;
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  };

  email = async () => {
    if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();

    // this.stores.actions.loading = true
    let { active_language } = this.stores.actions;
    // await this.stores.db.clearData(false, true)
    // let data = await _.clone(this.stores.actions.drugStructure)
    // data.drugs = await Array.from(this.stores.drugs.drug.values())
    let data = {};

    data.service = "43";
    data.active_language = active_language;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;
    data.recipe = this.code;
    data.email = this.stores.actions.patientForm.email;
    return POST({
      path: "prescript/recipeMail", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        // console.log("OKAY");
        this.emailSent = true;
        this.stores.actions.makeAlerts({
          alerts: [
            {
              title: this.stores.actions.t("ready"),
              message: `${this.stores.actions.t("recipe_shipped_by")} ${this.stores.actions.patientForm.email}`,
              level: "success",
              sticky: false,
            },
          ],
        });
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  };

  saveList = async () => {
    if (this.stores.actions.misurl && this.stores.actions.misurl.length > 0) this.stores.warnings.backToMis();

    this.stores.actions.loading = true;
    let { active_language } = this.stores.actions;
    await this.stores.db.clearData(false, true);
    let data = this.stores.actions.structure;
    // let drugsFull = Array.from(this.stores.drugs.drug.values());
    // let liquidsFull = Array.from(this.stores.drugs.liquid.values());
    // drugsFull.forEach((drugFull, i) => {
    //   let { helpers, ...drug } = drugFull;
    //   data.drugs.push(drugFull);
    // });
    // data.deletedDrugs = [];
    // this.stores.drugs.deletedRows.forEach((drugFull, i) => {
    //   let { helpers, ...drug } = drugFull;
    //   data.deletedDrugs.push(drugFull);
    // });
    // data.deletedLiquids = [];
    // this.stores.drugs.deletedLiquids.forEach((drugFull, i) => {
    //   let { helpers, ...drug } = drugFull;
    //   data.deletedLiquids.push(drugFull);
    // });
    // liquidsFull.forEach((liquidFull, i) => {
    //   let { helpers, ...liquid } = liquidFull;
    //   if (liquid.group != 0) {
    //     data.liquids.push(liquidFull);
    //   }
    // });

    data.service = "43";
    data.active_language = active_language;
    data.return_subjects = false;
    data.authkey = this.stores.actions.authkey;
    data.key = this.stores.actions.privateKey;

    data.сlinical_guidelines = this.stores.clinrecs.drugToClinrecHashset;
    data.checker = this.stores.actions.clinrecCheckerData; //this.stores.clinrecs.checker;

    return POST({
      path: "prescript/New", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        window.parent.postMessage(data, "*");
        // misproto: "CiEIrJS7mv8uEhg2MDNlNDk2YzgwN2Q2NmUzZTM0MmIzYjI="
        // newdrugs: [,…]
        // newliquids: [,…]
        // proto: "603e496c807d66e3e342b3b2"
        // proto_date: "2021_03"

        let { misproto, newdrugs, newliquids, proto, proto_date } = data;

        //-----------
        newdrugs = newdrugs.map((d) => {
          if (d.helpers) return d;
          let { dosage } = d;
          dosage = _.isArray(dosage.dosage) ? dosage.dosage : [dosage.dosage];
          // console.log({ dosage });
          const { names, nameshort } = this.stores.tools.unitsPharm;
          let helpers = {
            dosage: {
              short: "",
              full:
                (dosage[0] && dosage[0]?.id_1
                  ? `${_.map(dosage, "value_1").join(" + ")} ${nameshort[dosage[0].id_1]}`
                  : "") || "",
              id: null,
            },
            pack: { short: "", full: "", id: null },
            type: _.isArray(dosage) && dosage.length > 1 ? "multi" : "simple",
            // url: "",
            key: null,
            way: "lf",
            step: "4",
            // mnn: false,
            // drugCache: null,
          };
          return {
            ...d,
            helpers,
          };
        });
        //-----------

        this.stores.drugs.listChanged = false;
        if (newdrugs && newdrugs.length > 0) {
          newdrugs.forEach(async (drug, i) => {
            await this.stores.drugs.drug.set(drug.proto_key, drug);
          });
        }
        if (newliquids && newliquids.length > 0) {
          newliquids.forEach(async (liquid, i) => {
            await this.stores.drugs.liquid.set(liquid.group, liquid);
          });
        }
        // if (data.protocol) {
        //   this.stores.actions.protocol = data.protocol;
        //   this.stores.drugs.drug.forEach((drug, i) => {
        //     drug.edit = false;
        //     // await this.stores.drugs.drug.set( drug.key,  _.extend(drug, { edit: false }) )
        //   });
        //   this.stores.drugs.liquid.forEach((liquid, i) => {
        //     liquid.edit = false;
        //     // await this.stores.drugs.liquid.set( liquid.key,  _.extend(liquid, { edit: false }) )
        //   });
        // }
        // if(data && data.Code){
        //   this.code = data.Code
        //   return data.Code
        // }else{
        //   return false
        // }
        // this.stores.actions.makeAlerts({ alerts:[{
        //   title: "Сохранено.",
        //   message: "Протокол сохранен успешно. Теперь вы можете выписать рецепт.",
        //   level: "success",
        //   sticky: false
        // }]})
        this.stores.actions.loading = false;
        this.stores.router.push("/");
        // setTimeout(() => {
        //   this.stores.router.push("/recipe/new");
        // }, 700);
      },
      fail: (alerts) => {
        this.stores.actions.loading = false;
        this.stores.router.push("/");
        // setTimeout(() => {
        //   this.stores.router.push('/recipe/new')
        // }, 700)
      },
      always: (data) => {
        this.stores.actions.makeAlerts(data);
      },
    });
  };
}
export default Recipes;
