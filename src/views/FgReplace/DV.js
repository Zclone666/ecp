import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import Loader from "../../components/Loader";
import Conflicts from "../../components/Conflicts/ConflictsFG";
import FGconflict from "./FGconflict";

import { Accordion, Icon, List, Header, Checkbox } from "semantic-ui-react";
import _ from "lodash";

const DV = inject(
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
    class DV extends Component {
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

      onChange = ({ name, value, unitid }) => { };
      handleClick = (e, { index }) => {
        this.setState({ activeIndex: index === this.state.activeIndex ? -1 : index });
      };
      handleSubClick = (e, { index }) => {
        this.setState({ activeSubIndex: index === this.state.activeSubIndex ? -1 : index });
      };
      handleDrugClick = (id, drugs) => {
        let { checked } = this.state;
        if (checked.includes(id)) {
          _.pull(checked, id);
          this.setState({ checked, openFor: null });
        } else {
          Object.values(drugs).forEach((drug, i) => {
            if (checked.includes(drug.id)) {
              _.pull(checked, drug.id);
            }
          });
          checked.push(id);
          this.setState({ checked, openFor: id });
          this.props.actions.openForFg = id;
        }
        this.props.actions.selectedConflictFg = null;
        this.props.actions.checkedFg = checked;
        // this.props.warnings.checkFg(checked);
      };

      componentWillUnmount() {
        this.props.actions.checkedFg = [];
      }

      get fgs() {
        let { fgs } = this.props.drugs;
        let { activeIndex } = this.state;
        let arr = [];
        fgs.forEach((fg, i) => {
          if (fg.fd === activeIndex) arr.push(fg);
        });
        return arr;
      }

      render() {
        let { activeIndex, activeSubIndex, checked, openFor } = this.state;
        const { t } = this.props.actions;
        let { fds } = this.props.drugs;

        console.log(fds);
        console.log(this.fgs);



        let drugs = {};
        this.fgs.forEach(fg => {


          fg.drugs.forEach(drug => {

            let fixedDrug = {};
            if (!drugs[drug.id]) {

              fixedDrug = {
                ...drug,
                fgText: Object.keys(drug.fg).map(key => drug.fg[key]).join(", ")
              };

              drugs[drug.id] = fixedDrug;
            }

          });



        });

        console.log(drugs);

        return (
          <div className="scrollwrapper">
            <Header as="h3" className="stretched">
              <Icon name="unordered list" />
              <Header.Content>{t("list_of_drugs_with_interactions")}</Header.Content>
            </Header>
            <Accordion fluid styled>
              {fds &&
                fds.map((fd, i) => {
                  return (
                    <>
                      <Accordion.Title active={activeIndex === fd.id} index={fd.id} onClick={this.handleClick}>
                        <Icon name="dropdown" />
                        {fd.name}
                      </Accordion.Title>
                      {activeIndex === fd.id && (
                        <Accordion.Content active={activeIndex === fd.id}>
                          <Accordion.Accordion>
                            <List divided className="dozelist big">
                              {Object.values(drugs).map((drug, i) => {
                                return (
                                  <>
                                    {

                                      <List.Item key={"fd" + drug.id} style={{ padding: "5px 10px" }}>
                                        <div className={"dvConflictBlock"}>
                                          <Checkbox
                                            checked={checked.includes(drug.id)}
                                            onChange={() => this.handleDrugClick(drug.id, drugs)}
                                            name={"drugForChange"}
                                            label={drug.name}
                                          />
                                          {/* {item.warnings && item.warnings.length && <Conflicts itemWarnings={item.warnings}/>} */}


                                          <List.Description className={"dvConflictDesc"}>
                                            {drug.fgText}
                                          </List.Description>
                                        </div>
                                        <Conflicts itemId={drug.id} />
                                        {/* {openFor === item.id && <FGconflict />} */}


                                      </List.Item>
                                    }
                                  </>
                                );
                              })}
                            </List>
                          </Accordion.Accordion>
                        </Accordion.Content>
                      )}
                    </>
                  );
                })}
              {fds.length < 1 && <Loader />}
            </Accordion>
          </div>
        );
      }
    }
  )
);

export default withTranslation()(DV);
