import SimpleSchema from "simpl-schema";

import { DosageModel, CalcModel, ShceduleModel, HelpersModel } from "./Helpers";
import DrugInterface from "./Drug";

const LiquidInterface = new SimpleSchema({});
LiquidInterface.extend(DrugInterface);

export default LiquidInterface;
