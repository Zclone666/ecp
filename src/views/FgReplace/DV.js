import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import RouterLink from "../../router/a";
import Loader from "../../components/Loader";
import Conflicts from "../../components/Conflicts/ConflictsFG";
import FGconflict from "./FGconflict";

import { Transition, Accordion, Icon, Step, Responsive, List, Header, Checkbox } from "semantic-ui-react";
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

      onChange = ({ name, value, unitid }) => {};
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
          drugs.forEach((drug, i) => {
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
        this.props.warnings.checkFg(checked);
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
        let { activeIndex, activeSubIndex, viewType, checked, openFor } = this.state;
        const { t } = this.props.actions;
        let { fds } = this.props.drugs;

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
                            {this.fgs.map((fg, i) => {
                              return (
                                <>
                                  <Accordion.Title
                                    active={activeSubIndex === fg.id}
                                    index={fg.id}
                                    onClick={this.handleSubClick}
                                  >
                                    <Icon name="dropdown" />
                                    {fg.name}
                                  </Accordion.Title>
                                  {activeSubIndex === fg.id && (
                                    <Accordion.Content active={activeSubIndex === fg.id}>
                                      <List divided className="dozelist big">
                                        {fg.drugs.map((item) => {
                                          return (
                                            <List.Item key={"fd" + item.id} style={{ position: "relative" }}>
                                              <Checkbox
                                                checked={checked.includes(item.id)}
                                                onChange={() => this.handleDrugClick(item.id, fg.drugs)}
                                                name={"drugForChange"}
                                                label={item.name}
                                              />
                                              {openFor == item.id && <Conflicts />}
                                              {openFor == item.id && <FGconflict />}
                                            </List.Item>
                                          );
                                        })}
                                      </List>
                                    </Accordion.Content>
                                  )}
                                </>
                              );
                            })}
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
