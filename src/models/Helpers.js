import SimpleSchema from "simpl-schema";

export const DosageModel = new SimpleSchema({
  form: {
    label: "form",
    type: String,
    defaultValue: null,
    required: false,
  },
  form_name: {
    label: "form_name",
    type: String,
    defaultValue: null,
    required: false,
  },
  method: {
    label: "method",
    type: String,
    defaultValue: null,
    required: false,
  },
  method_name: {
    label: "method_name",
    type: String,
    defaultValue: null,
    required: false,
  },
  pack: {
    label: "pack",
    type: Object,
    defaultValue: null,
    required: false,
  },
  dosage: {
    label: "dosage",
    type: Array,
    required: false,
  },
  "dosage.$": {
    type: Object,
    required: false,
  },
  value: {
    label: "value",
    type: Number,
    defaultValue: 0,
    required: false,
  },
});
export const CalcModel = new SimpleSchema({
  dosageBaseUnit: {
    label: "dosageBaseUnit",
    type: String,
    defaultValue: "248",
    required: false,
  },
  dosage: {
    label: "dosage",
    type: Array,
    defaultValue: [0],
    required: false,
  },
  "dosage.$": {
    type: Number,
    required: false,
  },
  count: {
    label: "count",
    type: Number,
    defaultValue: 0,
    required: false,
  },
  countUnit: {
    label: "countUnit",
    type: String,
    defaultValue: "248",
    required: false,
  },
  countBaseUnit: {
    label: "countBaseUnit",
    type: String,
    defaultValue: "42",
    required: false,
  },
  dosageUnit: {
    label: "dosageUnit",
    type: String,
    defaultValue: "248",
    required: false,
  },
  dayCount: {
    label: "dayCount",
    type: Number,
    defaultValue: 1,
    required: false,
  },
  fullDosage: {
    label: "fullDosage",
    type: Array,
    defaultValue: [0],
    required: false,
  },
  "fullDosage.$": {
    type: Number,
    required: false,
  },
  weightDosage: {
    label: "weightDosage",
    type: Array,
    defaultValue: [0],
    required: false,
  },
  "weightDosage.$": {
    type: Number,
    required: false,
  },
  dayDosage: {
    label: "dayDosage",
    type: Array,
    defaultValue: [0],
    required: false,
  },
  "dayDosage.$": {
    type: Number,
    required: false,
  },
  dayWeightDosage: {
    label: "dayWeightDosage",
    type: Array,
    defaultValue: [0],
    required: false,
  },
  "dayWeightDosage.$": {
    type: Number,
    required: false,
  },
});
export const ShceduleModel = new SimpleSchema({
  dateStart: {
    label: "dateStart",
    type: Number,
    defaultValue: null,
    required: false,
  },
  dateFinish: {
    label: "dateFinish",
    type: Number,
    defaultValue: null,
    required: false,
  },
  finishAlternate: {
    label: "finishAlternate",
    type: String,
    defaultValue: null,
    required: false,
  },
  clarifications: {
    //уточнения
    label: "clarifications",
    type: String,
    defaultValue: null,
    required: false,
  },
  interval: {
    label: "interval",
    type: Array,
    defaultValue: [],
    required: false,
  },
  "interval.$": {
    type: Object,
    required: false,
  },
  once: {
    label: "once",
    type: String,
    defaultValue: null,
    required: false,
  },
  week: {
    label: "week",
    type: String,
    defaultValue: null,
    required: false,
  },
  calendar: {
    label: "calendar",
    type: String,
    defaultValue: null,
    required: false,
  },
});
export const HelpersModel = new SimpleSchema({
  dosage: {
    label: "dosage",
    type: Object,
    defaultValue: null,
    required: false,
  },
  pack: {
    label: "pack",
    type: Object,
    defaultValue: null,
    required: false,
  },
  url: {
    label: "url",
    type: String,
    defaultValue: "",
    required: false,
  },
  key: {
    label: "key",
    type: String,
    defaultValue: null,
    required: false,
  },
  way: {
    label: "way",
    type: String,
    defaultValue: null,
    required: false,
  },
  step: {
    label: "step",
    type: String,
    defaultValue: null,
    required: false,
  },
  mnn: {
    label: "mnn",
    type: String,
    defaultValue: null,
    required: false,
  },
  drugCache: {
    label: "drugCache",
    type: Object,
    defaultValue: null,
    required: false,
  },
});
