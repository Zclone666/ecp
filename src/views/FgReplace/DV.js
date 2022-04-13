import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import RouterLink from "../../router/a";
import Loader from "../../components/Loader";

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
          checked: null,
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
      handleDrugClick = (index) => {
        this.setState({ checked: index });
      };

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
        let { activeIndex, activeSubIndex, viewType, checked } = this.state;
        const { t } = this.props.actions;
        let { fds } = this.props.drugs;

        let page = {
          arr: [
            { value: true, name: "lolo", title: "ФД 1" },
            { value: true, name: "lolo", title: "ФД 2" },
            { value: true, name: "lolo", title: "ФД 3" },
            { value: true, name: "lolo", title: "ФД 4" },
          ],
        };

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
                                      <List selection divided className="dozelist big">
                                        {fg.drugs.map((item) => {
                                          return (
                                            <List.Item key={"fd" + item.id} style={{ position: "relative" }}>
                                              <Checkbox
                                                radio
                                                checked={item.id == checked}
                                                onChange={() => this.handleDrugClick(item.id)}
                                                name={"drugForChange"}
                                                label={item.name}
                                              />
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
