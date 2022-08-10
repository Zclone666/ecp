import SimpleSchema from "simpl-schema";

export const DosageModel = new SimpleSchema({
  form: {
    label: "form",
    type: String,
    defaultValue: null,
    required: true,
  },
  form_name: {
    label: "form_name",
    type: String,
    defaultValue: null,
    required: true,
  },
  method: {
    label: "method",
    type: String,
    defaultValue: null,
    required: true,
  },
  method_name: {
    label: "method_name",
    type: String,
    defaultValue: null,
    required: true,
  },
  pack: {
    label: "pack",
    type: Object,
    defaultValue: null,
    required: true,
  },
  "pack.id": {
    label: "type",
    type: String,
    defaultValue: null,
    required: true,
  },
  "pack.dosage": {
    label: "dosage",
    type: Object,
    defaultValue: null,
    required: true,
  },
  "pack.dosage.type": {
    label: "type",
    type: String,
    defaultValue: null,
    required: true,
  },
  "pack.dosage.value_1": {
    label: "value_1",
    type: Number,
    defaultValue: 0,
    required: true,
  },
  "pack.dosage.id_1": {
    label: "id_1",
    type: String,
    required: true,
  },
  "pack.dosage.value_2": {
    label: "value_2",
    type: Number,
    required: false,
  },
  "pack.dosage.id_2": {
    label: "id_2",
    type: String,
    defaultValue: null,
    required: false,
  },
  dosage: {
    label: "dosage",
    type: Array,
    required: true,
  },
  "dosage.$": {
    type: Object,
    required: true,
  },
  "dosage.$.type": {
    label: "type",
    type: String,
    defaultValue: null,
    required: true,
  },
  "dosage.$.value_1": {
    label: "value_1",
    type: Number,
    defaultValue: 0,
    required: true,
  },
  "dosage.$.id_1": {
    label: "id_1",
    type: String,
    required: true,
  },
  "dosage.$.value_2": {
    label: "value_2",
    type: Number,
    required: false,
  },
  "dosage.$.id_2": {
    label: "id_2",
    type: String,
    defaultValue: null,
    required: false,
  },
  value: {
    label: "value",
    type: Array,
    defaultValue: [],
    required: true,
  },
  "value.$": {
    label: "value",
    type: Number,
    required: false,
  },
});
export const CalcModel = new SimpleSchema({
  dosageBaseUnit: {
    label: "dosageBaseUnit",
    type: String,
    defaultValue: "248",
    required: true,
  },
  dosage: {
    label: "dosage",
    type: Array,
    defaultValue: [0],
    required: true,
  },
  "dosage.$": {
    type: Number,
    required: true,
  },
  count: {
    label: "count",
    type: Number,
    defaultValue: 0,
    required: true,
  },
  countUnit: {
    label: "countUnit",
    type: String,
    defaultValue: "248",
    required: true,
  },
  countBaseUnit: {
    label: "countBaseUnit",
    type: String,
    defaultValue: "42",
    required: true,
  },
  dosageUnit: {
    label: "dosageUnit",
    type: String,
    defaultValue: "248",
    required: true,
  },
  dayCount: {
    label: "dayCount",
    type: Number,
    defaultValue: 1,
    required: true,
  },
  fullDosage: {
    label: "fullDosage",
    type: Array,
    defaultValue: [0],
    required: true,
  },
  "fullDosage.$": {
    type: Number,
    required: true,
  },
  weightDosage: {
    label: "weightDosage",
    type: Array,
    defaultValue: [0],
    required: true,
  },
  "weightDosage.$": {
    type: Number,
    required: true,
  },
  dayDosage: {
    label: "dayDosage",
    type: Array,
    defaultValue: [0],
    required: true,
  },
  "dayDosage.$": {
    type: Number,
    required: true,
  },
  dayWeightDosage: {
    label: "dayWeightDosage",
    type: Array,
    defaultValue: [0],
    required: true,
  },
  "dayWeightDosage.$": {
    type: Number,
    required: true,
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
  "interval.$.type": {
    label: "type",
    type: String,
    required: false,
  },
  "interval.$.x": {
    label: "x",
    type: Number,
    required: false,
  },
  "interval.$.timesx": {
    label: "timesx",
    type: String,
    required: false,
  },

  "interval.$.multiplicate": {
    label: "multiplicate",
    type: Number,
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
    blackbox: true,
  },
  pack: {
    label: "pack",
    type: Object,
    defaultValue: null,
    required: false,
    blackbox: true,
  },
  url: {
    label: "url",
    type: String,
    defaultValue: "",
    required: false,
  },
  type: {
    label: "type",
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
    blackbox: true,
  },
});
