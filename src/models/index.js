import DrugInterface from "./Drug";
import LiquidInterface from "./Liquid";

const getObj = (schema) => {
  let obj = {};
  Object.keys(schema._schema).forEach((key, i) => {
    let item = schema._schema[key];
    if (item.defaultValue !== undefined) {
      obj[item.label] = item.defaultValue;
    } else if (
      item.type?.definitions &&
      item.type.definitions[0] &&
      item.type.definitions[0] &&
      item.type.definitions[0].type &&
      item.type.definitions[0].type._schema
    ) {
      obj[item.label] = getObj({ _schema: item.type.definitions[0].type._schema });
    }
  });
  return obj;
};

export const DrugModel = {
  schema: DrugInterface,
  obj: getObj(DrugInterface),
};
export const LiquidModel = {
  schema: LiquidInterface,
  obj: getObj(LiquidInterface),
};
