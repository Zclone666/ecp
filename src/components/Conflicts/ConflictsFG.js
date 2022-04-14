import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

// import Conflict from "./Conflict";

import { Menu, List, Feed, Button, Responsive, Icon, Grid, Segment, Popup, Header, Accordion } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

const Conflicts = inject(
  "db",
  "actions",
  "drugs",
  "warnings"
)(
  observer(
    class Conflicts extends Component {
      constructor(props) {
        super(props);
        this.state = { activeIndex: null };
      }
      selectConflict = (groupId) => {
        let {
          actions: { selectedDrugFg, selectedConflictFg, activeDrugsFg, activeConflictsFg },
          drugs: { selectedRows },
          warnings: { warningFg, groupsFg }, //warnings, warnGroups
        } = this.props;
        // console.log(groupId, "groupIdgroupIdgroupId");
        if (this.props.actions.selectedConflictFg === groupId) {
          this.props.actions.selectedDrugFg = null;
          this.props.actions.selectedConflictFg = null;
          //this.props.actions.activeDrugsFg = []
          this.props.actions.activeConflictsFg = [];
        } else {
          this.props.actions.selectedDrugFg = null;
          this.props.actions.selectedConflictFg = groupId;
          //this.props.actions.activeDrugsFg = warnGroups[groupId].ids
          this.props.actions.activeConflictsFg = [parseInt(groupId)];
        }
      };
      handleClick = (e, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({ activeIndex: newIndex });
      };
      get conflicts() {
        let {
          actions: { selectedDrugFg, selectedConflictFg, activeDrugsFg, activeConflictsFg },
          drugs: { selectedRows },
          warnings: { warningFg, groupsFg, iconsFg }, // warnings, warnGroups, warnIcons
        } = this.props;
        let conflictObj = {};
        if (selectedConflictFg) {
          let warn = groupsFg[selectedConflictFg];
          conflictObj[selectedConflictFg] = {
            value: warn.value,
            trust: warn.trust,
            color: warn.valuecolor,
          };
        } else {
          Array.from(warningFg.values()).forEach((warn, i) => {
            //console.log({ ...warn });
            let found = _.find(warn.subjects, { drugkey: selectedDrugFg });
            //console.log({ type: warn.type, value: warn.value, found });
            if (_.find(warn.subjects, { drugkey: selectedDrugFg })) {
              if (!conflictObj[warn.type] || conflictObj[warn.type].value < warn.value) {
                //console.log({ type: warn.type, value: warn.value });
                conflictObj[warn.type] = {
                  value: warn.value,
                  trust: warn.trust,
                  color: warn.color,
                };
              }
            }
          });
        }

        // console.log({drugsObj});
        return conflictObj;
      }

      render() {
        let {
          actions: { selectedDrugFg, selectedConflictFg, activeDrugsFg, activeConflictsFg, patientForm },
          drugs: { selectedRows },
          warnings: {
            infoFg: { names },
            warningFg,
            groupsFg,
          }, //warnings, warnGroups
        } = this.props;
        let { activeIndex } = this.state;
        let selectedWarnings = this.conflicts;
        let noSelections = _.isEmpty(selectedWarnings);

        const mutationArray = [];
        let group = null;
        let groupType = [];

        _.keys(groupsFg).map((key, i) => {
          group = groupsFg[key];
          groupType = group.type.split("_");

          if (
            mutationArray.filter((elem) => elem.valuecolor === group.valuecolor && elem.type === groupType[0])
              .length === 0
          ) {
            mutationArray.push({
              valuecolor: group.valuecolor,
              typeOld: group.type,
              type: groupType[0],
              values: [{ key, ...group }],
            });
          } else {
            const index = mutationArray.findIndex(
              (elem) => elem.valuecolor === group.valuecolor && elem.type === groupType[0]
            );
            mutationArray[index].values.push({ key, ...group });
          }
        });

        return (
          <>
            <Grid className="changefg" style={{ marginTop: 0 }}>
              {mutationArray.map((item, i) => {
                let color = (selectedWarnings[item.type] && selectedWarnings[item.type].color) || item.valuecolor;
                let icon = item.type;

                let ageIconName = null;
                let age = null;

                if (patientForm.birthdate && moment().diff(moment(patientForm.birthdate, "x"), "years")) {
                  ageIconName = "age";
                  age = moment().diff(moment(patientForm.birthdate, "x"), "years");
                } else if (patientForm.birthdate && moment().diff(moment(patientForm.birthdate, "x"), "months")) {
                  ageIconName = "agemonth";
                  age = moment().diff(moment(patientForm.birthdate, "x"), "months");
                } else if (patientForm.birthdate && moment().diff(moment(patientForm.birthdate, "x"), "weeks")) {
                  ageIconName = "ageweek";
                  age = moment().diff(moment(patientForm.birthdate, "x"), "weeks");
                } else if (patientForm.birthdate && moment().diff(moment(patientForm.birthdate, "x"), "days")) {
                  ageIconName = "ageday";
                  age = moment().diff(moment(patientForm.birthdate, "x"), "days");
                }
                // console.log('groups', noSelections, selectedWarnings, selectedWarnings[item.type], item);
                if (item.values.length < 2) {
                  return (
                    <Grid.Column key={"warn" + i} className="conflict">
                      {!selectedConflictFg && selectedWarnings[item.values[0].key] ? (
                        <RouterLink
                          to={"/warning/" + item.values[0].key}
                          className="conflicticon arrowBg"
                          style={{ backgroundColor: color }}
                        >
                          <List.Icon
                            name="arrow alternate circle down"
                            style={{ color: "#FFF" }}
                            size="large"
                            onClick={() => {}}
                          />
                        </RouterLink>
                      ) : (
                        <RouterLink to={"/warning/" + item.values[0].key} className="conflicticon arrowBg none">
                          <List.Icon name="arrow alternate circle down" style={{ color: "#FFF" }} size="large" />
                        </RouterLink>
                      )}
                      <Popup
                        position="top right"
                        content={
                          <>
                            {item.values[0].hintarr && item.values[0].hintarr.length > 0 && (
                              <Header as="h5" content={item.values[0].hint} />
                            )}
                            {(!item.values[0].hintarr || item.values[0].hintarr.length < 1) && item.values[0].hint}
                            {item.values[0].hintarr && item.values[0].hintarr.length > 0 && (
                              <List bulleted>
                                {item.values[0].hintarr.map((hintId, x) => {
                                  return <List.Item key={"hint-" + i + "-" + x}>{names[hintId]}</List.Item>;
                                })}
                              </List>
                            )}
                          </>
                        }
                        trigger={
                          <Icon.Group
                            onClick={() => {
                              this.selectConflict(item.values[0].key);
                              this.setState({ activeIndex: null });
                            }}
                            size="big"
                            className={noSelections || selectedWarnings[item.values[0].key] ? "selected" : "gray"}
                          >
                            {item.type === "age" ? (
                              <Icon as="img" src={`/warnicons/${ageIconName ? ageIconName : "no" + icon}.svg`} />
                            ) : (
                              <Icon as="img" src={`/warnicons/${icon}.svg`} />
                            )}
                            <Icon size="big" name="circle outline" style={{ color }} />
                            {item.type === "age" && age && <div className="agecontainer">{age || "!"}</div>}
                          </Icon.Group>
                        }
                      />
                    </Grid.Column>
                  );
                } else {
                  return (
                    <Grid.Column
                      className={activeIndex !== i ? "conflict" : ""}
                      style={
                        activeIndex !== i
                          ? { width: "auto", padding: "0" }
                          : { width: "auto", paddingTop: 0, paddingRight: 0, overflow: "hidden" }
                      }
                    >
                      <Accordion key={"warn" + i} className={activeIndex !== i ? "conflict" : ""}>
                        {activeIndex !== i ? (
                          <Popup
                            content={
                              <>
                                {item.values[0].hintarr && item.values[0].hintarr.length > 0 && (
                                  <Header as="h5" content={item.values[0].hint} />
                                )}
                              </>
                            }
                            trigger={
                              <Accordion.Title
                                style={{ padding: "0" }}
                                active={activeIndex === i}
                                index={i}
                                onClick={this.handleClick}
                              >
                                <Icon.Group
                                  style={{
                                    boxShadow: `3px 0 0px ${color},  10px 0 0 -6px #eee,  11px 0 0px -4px ${color},  20px 0 0 -10px #eee`,
                                    borderRadius: "50%",
                                  }}
                                  size="big"
                                  className={noSelections || selectedWarnings[item.typeOld] ? "selected" : "gray"}
                                >
                                  {item.type === "age" ? (
                                    <Icon as="img" src={`/warnicons/${ageIconName ? ageIconName : "no" + icon}.svg`} />
                                  ) : (
                                    <Icon as="img" src={`/warnicons/${icon}.svg`} />
                                  )}
                                  <Icon size="big" name="circle outline" style={{ color }} />
                                  {item.type === "age" && age && <div className="agecontainer">{age || "!"}</div>}
                                </Icon.Group>
                              </Accordion.Title>
                            }
                          />
                        ) : null}
                        <Accordion.Content
                          active={activeIndex === i}
                          style={{ display: activeIndex === i ? "flex" : "none" }}
                        >
                          {item.values.map((element) => {
                            return (
                              <Grid.Column
                                key={"warn" + i}
                                className="conflict"
                                style={{ paddingTop: 0, paddingRight: 0 }}
                              >
                                {!selectedConflictFg && selectedWarnings[element.type] ? (
                                  <RouterLink
                                    to={"/warning/" + element.type}
                                    className="conflicticon arrowBg"
                                    style={{ backgroundColor: color }}
                                  >
                                    <List.Icon
                                      name="arrow alternate circle down"
                                      style={{ color: "#FFF" }}
                                      size="large"
                                      onClick={() => {}}
                                    />
                                  </RouterLink>
                                ) : (
                                  <RouterLink to={"/warning/" + element.type} className="conflicticon arrowBg none">
                                    <List.Icon
                                      name="arrow alternate circle down"
                                      style={{ color: "#FFF" }}
                                      size="large"
                                    />
                                  </RouterLink>
                                )}
                                <Popup
                                  content={
                                    <>
                                      {element.hintarr && element.hintarr.length > 0 && (
                                        <Header as="h5" content={element.hint} />
                                      )}
                                      {(!element.hintarr || element.hintarr.length < 1) && element.hint}
                                      {element.hintarr && element.hintarr.length > 0 && (
                                        <List bulleted>
                                          {element.hintarr.map((hintId, x) => {
                                            return <List.Item key={"hint-" + i + "-" + x}>{names[hintId]}</List.Item>;
                                          })}
                                        </List>
                                      )}
                                    </>
                                  }
                                  trigger={
                                    <Icon.Group
                                      onClick={() => this.selectConflict(element.key)}
                                      size="big"
                                      className={noSelections || selectedWarnings[element.key] ? "selected" : "gray"}
                                    >
                                      {element.type === "age" ? (
                                        <Icon
                                          as="img"
                                          src={`/warnicons/${ageIconName ? ageIconName : "no" + icon}.svg`}
                                        />
                                      ) : (
                                        <Icon as="img" src={`/warnicons/${icon}.svg`} />
                                      )}
                                      <Icon size="big" name="circle outline" style={{ color }} />
                                      {element.type === "age" && age && (
                                        <div className="agecontainer">{age || "!"}</div>
                                      )}
                                    </Icon.Group>
                                  }
                                />
                              </Grid.Column>
                            );
                          })}
                        </Accordion.Content>
                      </Accordion>
                    </Grid.Column>
                  );
                }
              })}
            </Grid>
          </>
        );
      }
    }
  )
);

export default Conflicts;
