import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import RouterLink from "../../router/a";
import Loader from "../../components/Loader";
import Conflicts from "../../components/Conflicts/ConflictsFG";
import ChangeFGDrug from "../../components/Drugs/ChangeFGDrug";

import { Transition, Accordion, Icon, Step, Responsive, List, Header, Checkbox } from "semantic-ui-react";
import _ from "lodash";

const FgDrugs = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "warnings",
  "dosages",
  "clinrecs",
  "patients"
)(
  observer(
    class FgDrugs extends Component {
      constructor(props) {
        super(props);
        this.state = {
          activeIndex: "0",
          activeSubIndex: null,
          checked: [],
          openFor: null,
          viewType: "pc",
        };
      }
      get warnDrugs() {
        let {
          actions: { selectedDrugFg, selectedConflictFg, activeDrugsFg, activeConflictsFg },
          drugs: { drug },
          warnings: { warningFg, groupsFg }, //warnings, warnGroups
        } = this.props;
        let drugsObj = {};

        let currDrug = null;

        Array.from(warningFg.values()).forEach((warn, i) => {
          // console.log({ warn });
          if (selectedConflictFg) {
            if (warn.type === selectedConflictFg) {
              let arr =
                _.filter(warn.subjects, (o) => {
                  return o.drugkey !== selectedConflictFg;
                }) || [];
              // console.log({ arr });
              arr.forEach((item, x) => {
                // console.log({ item });
                if (!drugsObj[item.drugkey] || drugsObj[item.drugkey].group < warn.group) {
                  drugsObj[item.drugkey] = {
                    value: warn.value,
                    group: warn.group,
                    color: warn.color,
                    id: warn.id,
                  };
                }
              });
            }
          } else {
            currDrug = _.find(warn.subjects, { drugkey: selectedDrugFg });
            // console.log({currDrug});
            if (currDrug) {
              // && warn.type === 'interdrug' ){
              let arr =
                _.filter(warn.subjects, (o) => {
                  return o.drugkey !== selectedDrugFg && !o.hidekeys.includes(currDrug.drugkey);
                }) || [];
              // console.log({ arr });
              arr.forEach((item, x) => {
                // console.log({ item });
                if (!drugsObj[item.drugkey] || drugsObj[item.drugkey].group < warn.group) {
                  drugsObj[item.drugkey] = {
                    value: warn.value,
                    group: warn.group,
                    color: warn.color,
                    id: warn.id,
                  };
                }
              });
            }
          }
        });
        // console.log({drugsObj});
        return drugsObj;
      }

      get drugs() {
        let { drug } = this.props.drugs;
        let drugs = [];
        drug.forEach((d, i) => {
          drugs.push(d);
        });
        return drugs;
      }

      render() {
        let { selectedDrugFg, selectedConflictFg, activeDrugsFg, activeConflictsFg, patientForm } = this.state;
        const { t } = this.props.actions;
        let { fds, drugs } = this.props.drugs;

        return (
          <div className="fgdrugs">
            <Header as="h4">{t("list_of_drugs_with_interactions")}</Header>
            <List>
              {this.drugs.map((drug, i) => {
                return this.warnDrugs[drug.key] ? (
                  <ChangeFGDrug key={"fgdrug" + i} active={this.warnDrugs[drug.key] || false} drug={drug} />
                ) : null;
              })}
            </List>
          </div>
        );
      }
    }
  )
);

export default withTranslation()(FgDrugs);
