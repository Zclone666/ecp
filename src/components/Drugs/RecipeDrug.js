import React from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

import { Menu, List, Feed, Button, Responsive, Icon, Popup, Input, TextArea, Form, Checkbox } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const RecipeDrug = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages",
  "tools",
  "recipes"
)(
  observer(
    class RecipeDrug extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          edit: false,
          text: null,
          from: "dosage",
        };
        this.textRef = React.createRef();
      }
      handleKeyDown = (e) => {
        e.preventDefault();
        let start = e.target.selectionStart;
        let end = e.target.selectionEnd;
        setTimeout(() => {
          this.textRef.current.selectionStart = this.textRef.current.selectionEnd = start;
        }, 300);
      };
      handleChange = (e) => {
        let { value } = e.target;
        // if( this.state.from !== 'text' ){
        //   this.setState({ from: 'text' }, () => {
        //     this.setState({ text: value }, () => {
        //
        //     })
        //
        //   })
        // }else{
        this.setState({ text: value }, () => {});
        // }
      };

      handleChangeCount = (e) => {
        let { value } = e.target;
        // console.log({ value });

        let count = _.isNaN(parseInt(value)) || value == "" ? "" : parseInt(value).toString();
        let { drugKey: key, drugs } = this.props;
        let drug = drugs.drug.get(key);
        drugs.drug.set(key, Object.assign(drug, { recipeCount: count }));
        // this.setState({ text: value }, () => {});
      };
      // undo = () => {
      //   this.setState({ from: 'dosage', text: null })
      // }

      getLF = () => {
        let { drugKey: key, drugs } = this.props;
        // console.log(drug);
        let drug = drugs.drug.get(key) || {};
        this.props.dosages.get(drug);
        //this.props.db.GetDuration(drug)
        this.props.drugs.current = { ...drug };
        // this.props.router.push('/concepts/dozes')
      };
      unselectDrug = () => {
        let { drugKey: key, drugs } = this.props;
        // console.log(drug);
        let drug = drugs.drug.get(key) || {};
        this.props.drugs.unselectDrug(drug);
      };

      edit = () => {
        let { drugKey: key, drugs } = this.props;
        // console.log(drug);
        let drug = drugs.drug.get(key) || {};
        this.setState({ edit: !this.state.edit, text: drug.specials });
        // let currDrug = drugs.drug.get(key)
        drugs.drug.set(key, _.extend(drug, { specials: this.state.text }));
      };

      getMNN = () => {
        let { drugKey: key, drugs } = this.props;
        // console.log(drug);
        let drug = drugs.drug.get(key) || {};
        let { fpid, group, id, level, main, name, namesearch, type } = drug;
        this.props.drugs.MNNfromTN({
          fpid,
          group,
          id,
          key,
          level,
          main,
          name,
          namesearch,
          type,
        });
      };

      renderRules() {
        let {
          dosages: { getFromBase },
          tools: { names, shortnames, round },
          drugKey: key,
          drugs,
          actions: { UIText },
        } = this.props;
        helpers = helpers || {};
        let drug = drugs.drug.get(key);
        let { finishAlternate } = schedule || {};
        let { freq, freq_id, freq_name, duration, duration_id, duration_name, calc, dosage, helpers, schedule } =
          drug || {};

        let obj = { dosage: [], rules: [] };

        if (calc && calc.count && calc.countUnit) {
          // let str = ""; //`${getFromBase(calc.countUnit, calc.count)} ${shortnames[calc.countUnit]}`;
          if (calc.fullDosage) {
            let dosageValue = getFromBase(drug.calc.dosageUnit, calc.dosage);
            let fullDosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
            let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];

            obj.dosage.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`);
            obj.rules.push(`${_.map(fullDosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`);
          }
        }
        if (dosage && dosage.method) {
          obj.rules.push(names[dosage.method]);
        } else if (dosage.method_name) {
          obj.rules.push(dosage.method_name);
        }
        if (freq_id && UIText && UIText.freq && UIText.freq[freq_id]) {
          obj.rules.push(UIText.freq[freq_id]);
        } else if (freq_name) {
          obj.rules.push(freq_name);
        }
        if (duration_id && UIText.duration[duration_id]) {
          obj.rules.push(UIText.duration[duration_id]);
        } else if (duration_name) {
          obj.rules.push(duration_name);
        }
        if (finishAlternate && UIText.duration[finishAlternate]) obj.rules.push(UIText.duration[finishAlternate]);

        return {
          // empty: arr.length < 1,
          rules: obj.rules.join(", "),
          dosage: obj.dosage.join(", "),
        };
      }

      get inputValue() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts },
          // drugs: { current }, //drugs, drugsDosages, currDrug, setDosageParams
          dosages: { dosage: dose },
          // db: { selectedRows, warnings, warnGroups, drugsDosages, warnIcons },
          drugKey: key,
          drugs,
          active,
        } = this.props;

        let { edit, text, from } = this.state;

        let drug = drugs.drug.get(key) || {};

        let drugDosages = dose.get(drug.id) || {};
        let { name, level, tn, type, dosage, schedule, helpers } = drug || {};

        let names = drugDosages.names || {};

        let descArr = [];
        // let rules = this.renderRules();

        // if(dosage.form && names[dosage.form]) descArr.push(names[dosage.form])
        // if(dosage.method && names[dosage.method]) descArr.push(names[dosage.method])
        // if(dosage.pack.dosage) descArr.push(dosage.pack.dosage)
        // if(dosage.pack.pack) descArr.push(dosage.pack.pack)

        let inputValue = from === "dosage" ? descArr.join(", ") : text;
        return inputValue;
      }

      componentDidUpdate(prevProps, prevState) {
        let {
          drugs: { drug }, //drugs, drugsDosages, currDrug, setDosageParams
          drugKey: key,
        } = this.props;
        let { inputValue } = this;
        let current = drug.get(key);
        if (current.specials == this.state.text || this.state.edit) return;
        this.setState({ text: current.specials }, () => {
          // let currDrug = drug.get(current.key)
          drug.set(current.key, _.extend(current, { specials: this.state.text }));
        });
      }

      addOrRemoveDrugToPrescription(key) {
        const {
          recipes: { drugKeysForPrescription, maxcount },
        } = this.props;
        const index = drugKeysForPrescription.indexOf(key);
        if (index > -1) {
          this.props.recipes["drugKeysForPrescription"].splice(index, 1);
          return;
        }
        if (drugKeysForPrescription.length === maxcount) {
          this.props.recipes["drugKeysForPrescription"].pop();
        }
        this.props.recipes["drugKeysForPrescription"].push(key);
      }

      render() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts },
          dosages: { dosage: dose },
          drugKey: key,
          drugs,
          active,
          recipes: { drugKeysForPrescription, maxcount },
        } = this.props;
        const { t } = this.props.actions;
        let { edit, text, from } = this.state;

        // console.log({ drugKeysForPrescription });

        // console.log({key});
        // let selectedWarnings = warnIcons[selectedDrug]
        let drug = drugs.drug.get(key) || {};
        let drugDosages = dose.get(drug.id) || {};
        let { name, mnnname, level, tn, type, dosage, schedule, helpers, specials, recipeCount } = drug;

        let names = drugDosages.names || {};

        // let descArr = []
        let rules = this.renderRules();
        //
        // if(dosage.form) descArr.push(names[dosage.form])
        // if(helpers.dosage && helpers.dosage.small) descArr.push(helpers.dosage.small)
        // if(helpers.pack && helpers.pack.small) descArr.push(helpers.pack.small)
        // if(dosage.method) descArr.push(names[dosage.method])
        // if(schedule && schedule.specials) descArr.push(schedule.specials)
        // if(!rules.empty){ descArr.push(rules.text) }

        // if(dosage.form && names[dosage.form]) descArr.push(names[dosage.form])
        // if(dosage.method && names[dosage.method]) descArr.push(names[dosage.method])
        // if(dosage.pack.dosage) descArr.push(dosage.pack.dosage)
        // if(dosage.pack.pack) descArr.push(dosage.pack.pack)
        // let recipeCount = 0;
        let { inputValue } = this;
        return (
          <List.Item>
            <List.Content floated="left">
              <Checkbox
                // disabled={!drugKeysForPrescription.includes(key) && drugKeysForPrescription.length >= maxcount}
                checked={drugKeysForPrescription.includes(key)}
                onChange={() => this.addOrRemoveDrugToPrescription(key)}
              />
            </List.Content>

            <List.Content floated="right">
              <Button.Group color="blue">
                {false && (
                  <Button
                    title={t("cancellation_prescription")}
                    icon
                    onClick={this.undo}
                    icon
                    disabled={from === "dosage"}
                  >
                    <Icon name="undo" />
                  </Button>
                )}
                <Button icon onClick={this.edit}>
                  <Icon name={edit ? "check" : "edit"} />
                </Button>
                <Button icon onClick={this.unselectDrug}>
                  <Icon name="delete" />
                </Button>
              </Button.Group>
            </List.Content>

            <List.Content>
              <List.Content>
                <List.Header>
                  Rp:
                  <span className="underlined">{mnnname}</span> {rules.dosage}
                </List.Header>
                <List.Description>
                  D.t.d: №
                  <input
                    type="text"
                    value={recipeCount}
                    name="recipeCount"
                    onChange={this.handleChangeCount}
                    className="recipeCount"
                  />
                </List.Description>
                <List.Description>
                  S.: {rules.rules} {!edit && specials && `(${specials})`}
                </List.Description>
              </List.Content>
            </List.Content>
            {edit && (
              <Form fluid>
                <TextArea
                  ref={this.textRef}
                  fluid
                  name="text"
                  value={text || ""}
                  placeholder={t("special_instructions")}
                  onChange={this.handleChange}
                />
              </Form>
            )}
          </List.Item>
        );
      }
    }
  )
);

export default withTranslation()(RecipeDrug);
