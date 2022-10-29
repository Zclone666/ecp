import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import ChangeFGDrug from "../../components/Drugs/ChangeFGDrug";

import { List, Header } from "semantic-ui-react";
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
          actions: { selectedDrugFg, selectedConflictFg },
          warnings: { warningFg }, //warnings, warnGroups
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
        let { selectedConflictFg } = this.props.actions;
        const { t, checkedFg, openForFg } = this.props.actions;
        let { drugsForFG } = this.props.drugs;

        let drugKey = (this.props.router.values && this.props.router.values.drug) || "none";
        // console.log(selectedConflictFg);
        return (
          <div className="fgdrugs">
            {selectedConflictFg && <Header as="h4">{t("list_of_drugs_with_interactions")}</Header>}
            <List>
              {checkedFg.map((id, i) => {
                let drug = drugsForFG[id];
                return this.warnDrugs[drug.key] && drugKey !== drug.key && openForFg !== drug.id ? (
                  <ChangeFGDrug key={"fgdrug" + i} active={this.warnDrugs[drug.key] || false} drug={drug} />
                ) : null;
              })}
              {this.drugs.map((drug, i) => {
                return this.warnDrugs[drug.key] && drugKey !== drug.key ? (
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
