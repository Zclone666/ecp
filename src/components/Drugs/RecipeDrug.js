import React from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

import { Menu, List, Feed, Button, Responsive, Icon, Popup, Input, TextArea, Form, Checkbox } from "semantic-ui-react";

import _ from "lodash";

@inject("db", "actions", "router", "drugs", "dosages", "tools", "recipes")
@observer
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
      drugs,
      drugKey: key,
      actions: { UIText },
    } = this.props;

    let arr = [];

    let drug = drugs.drug.get(key) || {};
    let { freq, freq_id, duration, duration_id, calc, dosage, helpers, schedule } = drug;
    // console.log({drug});
    let { finishAlternate } = schedule || {};

    if (calc && calc.fullDosage && helpers.dosage && helpers.dosage.id) {
      let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage);
      let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit];
      arr.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(" + ")} ${dosageName}`);
    }

    if (freq_id && UIText.freq[freq_id]) {
      arr.push(UIText.freq[freq_id]);
    } else if (freq) {
      arr.push(freq);
    }
    if (duration_id && UIText.duration[duration_id]) {
      arr.push(UIText.duration[duration_id]);
    } else if (duration) {
      arr.push(duration);
    }
    // if(duration && UIText.duration[duration]) arr.push(UIText.duration[duration])
    if (finishAlternate && UIText.duration[finishAlternate]) arr.push(UIText.duration[finishAlternate]);

    return {
      empty: arr.length < 1,
      text: arr.join(", "),
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
    let rules = this.renderRules();

    if (dosage && dosage.form) descArr.push(names[dosage.form]);
    if (helpers && helpers.dosage && helpers.dosage.small) descArr.push(helpers.dosage.small);
    if (helpers && helpers.pack && helpers.pack.small) descArr.push(helpers.pack.small);
    if (dosage && dosage.method) descArr.push(names[dosage.method]);
    if (schedule && schedule.specials) descArr.push(schedule.specials);
    if (!rules.empty) {
      descArr.push(rules.text);
    }

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

    let { edit, text, from } = this.state;

    // console.log({ drugKeysForPrescription });

    // console.log({key});
    // let selectedWarnings = warnIcons[selectedDrug]
    let drug = drugs.drug.get(key) || {};
    let drugDosages = dose.get(drug.id) || {};
    let { name, mnnname, level, tn, type, dosage, schedule, helpers, specials } = drug;

    let names = drugDosages.names || {};

    // let descArr = []
    // let rules = this.renderRules()
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
              <Button title="отменить изменения предписания" icon onClick={this.undo} icon disabled={from === "dosage"}>
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
              <span className="underlined">{mnnname}</span>
              {/* <span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}{' '}
              {!(helpers && helpers.mnn) && <label><span className='link' onClick={this.getMNN}>Заменить на МНН</span></label>}
              {(helpers && helpers.mnn) && <label><span className='link' onClick={this.getMNN}>Вернуть</span></label>} */}
            </List.Header>
            <List.Description>{inputValue}</List.Description>
            <List.Description>{!edit && specials}</List.Description>
          </List.Content>
        </List.Content>
        {edit && (
          <Form fluid>
            <TextArea
              ref={this.textRef}
              fluid
              name="text"
              value={text || ""}
              placeholder="Особые указания"
              onChange={this.handleChange}
            />
            {/*<Input value={inputValue} size='small' fluid onChange={this.handleChange}>
              <input />
              <Button onClick={this.undo} icon disabled={from === 'dosage'}><Icon name='undo' /></Button>
            </Input>*/}
          </Form>
        )}
      </List.Item>
    );
  }
}
export default RecipeDrug;
