import { observable, action, autorun, computed, observe } from "mobx";
import { GET, POST, PUT } from "../lib/connect";
import moment from "moment";

import _ from "lodash";

class Recipes {
  @observable ready = false;
  @observable code = null;
  @observable recipe_endtime = null;
  @observable recipe_endtimeitem = null;
  @observable recipe_formid = null;
  @observable recipe_text = null;
  @observable mkb10code = null;
  @observable recipeDiseaseId = null;
  @observable financingSource = null;
  @observable citizenCategory = null;
  @observable compensation = null;
  @observable snils = null;
  @observable insuranceNumber = null;
  @observable patientCard = null;

  constructor({ stores }) {
    this.stores = stores;
    this.router = stores.router;

    this.recipe = {
      data: observable.map({}, "recipe"),
      ready: observable.box(true),
    };

    autorun(() => {});

    observe(this, (change) => {
      if (change.name == "recipeDiseaseId") {
        console.log("recipeDiseaseId ", this.recipeDiseaseId);
        this.getMKB10();
      }
    });
  }

  save = async () => {
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

    return POST({
      path: "prescript/recipeNew", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        if (data && data.code) {
          this.code = data.code;

          this.stores.actions.makeAlerts({
            alerts: [
              {
                title: `Рецепт выписан!`,
                message: `Теперь вы можете распечатать его, или отправить на почту.`,
                level: "success",
                sticky: false,
              },
            ],
          });

          return data.code;
        } else {
          return false;
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
        console.log("DATA", data);
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
        this.stores.actions.makeAlerts({
          alerts: [
            {
              title: `Готово!`,
              message: `Рецепт отправлен на ${this.stores.actions.patientForm.email}`,
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
    return POST({
      path: "prescript/New", //`https://dev.socmedica.com/2/api/ecp/GetInfoPrep`, //
      data,
      success: async (data) => {
        // misproto: "CiEIrJS7mv8uEhg2MDNlNDk2YzgwN2Q2NmUzZTM0MmIzYjI="
        // newdrugs: [,…]
        // newliquids: [,…]
        // proto: "603e496c807d66e3e342b3b2"
        // proto_date: "2021_03"

        let { misproto, newdrugs, newliquids, proto, proto_date } = data;

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
