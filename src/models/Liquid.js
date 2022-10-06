import SimpleSchema from "simpl-schema";

import DrugInterface from "./Drug";

const LiquidInterface = new SimpleSchema({});
LiquidInterface.extend(DrugInterface);

export default LiquidInterface;
