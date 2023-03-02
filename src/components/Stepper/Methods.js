import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";
import { List, Icon } from "semantic-ui-react";

import _ from "lodash";

const MethodsLF = inject("db", "actions", "router", "drugs", "dosages")(observer(class MethodsLF extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  setMethod = (lf) => {
    this.props.actions.stepsData.method = lf;
  };
  render() {
    let {
      actions: { stepsData },
      drugs: { current }, //drugs, currDrug, setDosageParams
      dosages: { dosage }, //drugsDosages
      router: { values },
    } = this.props;
    let way = values.way || "lf";
    let url = !values.liquid ? `/concept/dozes/${way}` : `/liquid/calc/${values.liquid}/dozes/${way}`;

    let currStep = parseInt(values.step || 0);

    let drugDosage = dosage.get(current.id);
    let { form, methodform, names } = drugDosage || { drug: {}, form: [], methodform: [], names: [] };

    let iterator =
      stepsData.way === "lf" && stepsData.form
        ? (form[stepsData.form] && form[stepsData.form].method) || []
        : _.keys(methodform);
    // console.log('iterator', iterator);
    // console.log('stepsData', stepsData);
    return (
      <List animated divided selection className="dozelist" verticalAlign="middle" size="large">
        {iterator.map((mid, i) => {
          let isLiquid = false;
          methodform[mid].forEach((id) => {
            if (form[id] && form[id].solute) isLiquid = true;
          });
          return (
            <List.Item
              key={"doze" + i}
              disabled={values.liquid && !isLiquid}
              as={RouterLink}
              to={`${url}/${currStep + 1}`}
              onClick={() => this.setMethod(mid)}
            >
              <List.Content floated="right">
                <Icon name="right chevron" size="big" />
              </List.Content>

              <List.Content className="large">
                <List.Header>{names[mid]}</List.Header>
                {/*<List.Description>

                </List.Description>*/}
              </List.Content>
            </List.Item>
          );
        })}
      </List>
    );
  }
}));

export default MethodsLF;
