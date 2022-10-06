import SimpleSchema from "simpl-schema";

import DrugInterface from "./Drug";

const DosageInterface = new SimpleSchema({
  dosagelimits: {
    // лимиты дозирвок для передоза
    label: "dosagelimits",
    type: Object,
    defaultValue: null,
    required: false,
  },
  drug: {
    //  объект драга, к которому относятся дозировки
    label: "drug",
    type: DrugInterface,
    required: false,
  },
  form: {
    // лекарственные формы
    label: "form",
    type: Object,
    defaultValue: null,
    required: false,
  },
  methodform: {
    // связь между способом приема и лекарственной формой
    label: "methodform",
    type: Object,
    defaultValue: null,
    required: false,
  },
  names: {
    // имена
    label: "names",
    type: Object,
    defaultValue: null,
    required: false,
  },
  nameshort: {
    // короткие имена
    label: "nameshort",
    type: Object,
    defaultValue: null,
    required: false,
  },
  units: {
    // доступные ед. изм.
    label: "units",
    type: Array,
    defaultValue: [],
    required: false,
  },
  "units.$": {
    type: String,
    defaultValue: "",
    required: false,
  },
});

export default DosageInterface;
