import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";
import { List, Icon } from "semantic-ui-react";

import _ from "lodash";

const MethodsLF = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "dosages"
)(
  observer(
    class MethodsLF extends Component {
      constructor(props) {
        super(props);
        this.state = {};
      }
      setMethod = (method) => {
        let {
          router: { values },
        } = this.props;
        this.props.actions.stepsData.method = this.props.actions.stepsData.method === method ? null : method;
        if (this.props.actions.stepsData.method && this.props.actions.stepsData.form) {
          this.props.router.push(!values.liquid ? `/concept/dozes/1` : `/liquid/calc/${values.liquid}/dozes/1`);
        }
      };
      setLF = (form) => {
        let {
          router: { values },
        } = this.props;
        this.props.actions.stepsData.form = this.props.actions.stepsData.form === form ? null : form;
        if (this.props.actions.stepsData.method && this.props.actions.stepsData.form) {
          this.props.router.push(!values.liquid ? `/concept/dozes/1` : `/liquid/calc/${values.liquid}/dozes/1`);
        }
      };
      render() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, stepsData, t },
          drugs: { current }, //drugs, currDrug, setDosageParams
          dosages: { dosage }, //drugsDosages
          router: { values },
        } = this.props;

        let drugDosage = dosage.get(current.id);
        let { drug, form, methodform, names } = drugDosage || { drug: {}, form: [], methodform: [], names: [] };

        let availableMethods = stepsData.form ? (form[stepsData.form] && form[stepsData.form].method) || null : null;
        let availableForms = stepsData.method ? methodform[stepsData.method] || null : null;

        return (
          <>
            <div
              style={{ padding: 5, textAlign: "center", boxShadow: "0px 1px 4px #ccc", borderTop: "2px solid #4183C4" }}
            >
              {t("mode_application")}
            </div>
            <List animated divided selection className="dozelist" verticalAlign="middle" size="large">
              {_.keys(methodform).map((mid, i) => {
                let isLiquid = false;
                methodform[mid] &&
                  methodform[mid].forEach((id) => {
                    if (form[id] && form[id].solute) isLiquid = true;
                  });
                return (
                  <List.Item
                    key={"doze" + i}
                    active={mid === stepsData.method}
                    disabled={(values.liquid && !isLiquid) || (availableMethods && !availableMethods.includes(mid))}
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
            <div
              style={{ padding: 5, textAlign: "center", boxShadow: "0px 1px 4px #ccc", borderTop: "2px solid #4183C4" }}
            >
              {t("dosage_form")}
            </div>
            <List animated divided selection className="dozelist" verticalAlign="middle" size="large">
              {_.keys(form).map((lfid, i) => {
                let lfItem = form[lfid];

                return (
                  <List.Item
                    key={"doze" + i}
                    active={lfid === stepsData.form}
                    disabled={(values.liquid && !lfItem.solute) || (availableForms && !availableForms.includes(lfid))}
                    onClick={() => this.setLF(lfid, lfItem)}
                  >
                    <List.Content floated="right">
                      <Icon name="right chevron" size="big" />
                    </List.Content>

                    <List.Content className="large">
                      <List.Header>
                        {names[lfid]} {lfItem.solute && <Icon name="lab" />}
                      </List.Header>
                      {false && lfItem.solute && <List.Description>{t("suitable_for_solutions")}</List.Description>}
                    </List.Content>
                  </List.Item>
                );
              })}
            </List>
          </>
        );
      }
    }
  )
);

export default MethodsLF;
