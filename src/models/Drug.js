import SimpleSchema from "simpl-schema";

import { DosageModel, CalcModel, ShceduleModel, HelpersModel } from "./Helpers";

const DrugInterface = new SimpleSchema({
  key: {
    label: "key",
    type: String,
    defaultValue: null,
    required: false,
  }, // уникальный ключ
  id: {
    label: "id",
    type: String,
    defaultValue: "",
    required: true,
  }, // айди ДВ или ТН
  main: {
    label: "main",
    type: Boolean,
    defaultValue: false,
    required: false,
  }, //
  namesearch: {
    label: "namesearch",
    type: String,
    defaultValue: "",
    required: false,
  }, // название вбитое в поисковую строку
  name: {
    label: "name",
    type: String,
    defaultValue: "",
    required: true,
  }, // Название ДВ или ТН
  title: {
    label: "title",
    type: String,
    defaultValue: "",
    required: false,
  }, // Название ДВ или ТН
  mnnid: {
    label: "mnnid",
    type: String,
    defaultValue: "",
    required: false,
  },
  mnnname: {
    label: "mnnname",
    type: String,
    defaultValue: "",
    required: false,
  },
  level: {
    label: "level",
    type: Number,
    defaultValue: 0,
    required: false,
  }, //
  fpid: {
    label: "fpid",
    type: String,
    defaultValue: "",
    required: false,
  }, //
  type: {
    label: "type",
    type: String,
    defaultValue: "",
    required: true,
  }, // ДВ или ТН
  liquid: {
    label: "liquid",
    type: Boolean,
    defaultValue: false,
    required: false,
  }, // ДВ или ТН
  edit: {
    label: "edit",
    type: Boolean,
    defaultValue: true,
    required: false,
  },
  group: {
    label: "group",
    type: Number,
    defaultValue: 0,
    required: false,
  }, // группа раствора (0 - нет раствора, больше 0 - раствор)
  text: {
    label: "text",
    type: String,
    defaultValue: "",
    required: false,
  },
  specials: {
    label: "specials",
    type: String,
    defaultValue: null,
    required: false,
  },
  freq: {
    label: "freq",
    type: String,
    defaultValue: null,
    required: false,
  },
  freq_id: {
    label: "freq_id",
    type: String,
    defaultValue: null,
    required: false,
  },
  duration: {
    label: "duration",
    type: String,
    defaultValue: null,
    required: false,
  },
  duration_id: {
    label: "duration_id",
    type: String,
    defaultValue: null,
    required: false,
  },
  recipenameid: {
    label: "recipenameid",
    type: String,
    defaultValue: null,
    required: false,
  },

  recipes: {
    label: "recipes",
    type: Array,
    defaultValue: [],
    required: false,
  },
  "recipes.$": {
    label: "recipes",
    type: String,
    required: false,
  },
  repeal: {
    label: "repeal",
    type: Boolean,
    defaultValue: false,
    required: false,
  },
  repealdoc: { label: "repealdoc", type: String, defaultValue: null, required: false },
  repealdate: { label: "repealdate", type: String, defaultValue: null, required: false },
  repealproto: { label: "repealproto", type: String, defaultValue: null, required: false },

  solute: {
    label: "solute",
    type: Boolean,
    defaultValue: false,
    required: false,
  },

  proto: {
    label: "proto",
    type: String,
    defaultValue: null,
    required: false,
  },
  proto_date: {
    label: "proto_date",
    type: String,
    defaultValue: null,
    required: false,
  },
  proto_key: {
    label: "proto_key",
    type: String,
    defaultValue: null,
    required: false,
  },
  date: {
    label: "date",
    type: Number,
    defaultValue: 0,
    required: false,
  },
  dosage: {
    label: "dosage",
    type: DosageModel,
    required: false,
  },
  calc: {
    label: "calc",
    type: CalcModel,
    required: false,
    // custom: function () {
    //   let count = this.field("calc.count");
    //   let dosage = this.field("calc.dosage");
    //   let fullDosage = this.field("calc.fullDosage");
    //   console.log({ count, dosage, fullDosage });
    //   if (
    //     !((!count.value && !dosage.value && !fullDosage.value) || (count.value && dosage.value && fullDosage.value))
    //   ) {
    //     return { name: this.key, type: "Неполные данные в calc", value: count.value };
    //   }
    //   return false;
    // },
  },
  schedule: {
    label: "schedule",
    type: ShceduleModel,
    required: false,
  },
  helpers: {
    label: "helpers",
    type: HelpersModel,
    required: false,
  },
});

export default DrugInterface;
