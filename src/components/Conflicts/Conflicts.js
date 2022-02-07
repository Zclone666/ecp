import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

// import Conflict from "./Conflict";

import { Menu, List, Feed, Button, Responsive, Icon, Grid, Segment, Popup, Header } from "semantic-ui-react";

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
        this.state = {};
      }
      selectConflict = (groupId) => {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts },
          drugs: { selectedRows },
          warnings: { warning, groups }, //warnings, warnGroups
        } = this.props;
        if (this.props.actions.selectedConflict === groupId) {
          this.props.actions.selectedDrug = null;
          this.props.actions.selectedConflict = null;
          //this.props.actions.activeDrugs = []
          this.props.actions.activeConflicts = [];
        } else {
          this.props.actions.selectedDrug = null;
          this.props.actions.selectedConflict = groupId;
          //this.props.actions.activeDrugs = warnGroups[groupId].ids
          this.props.actions.activeConflicts = [parseInt(groupId)];
        }
      };

      get conflicts() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts },
          drugs: { selectedRows },
          warnings: { warning, groups, icons }, // warnings, warnGroups, warnIcons
        } = this.props;
        let conflictObj = {};
        if (selectedConflict) {
          let warn = groups[selectedConflict];
          conflictObj[selectedConflict] = {
            value: warn.value,
            trust: warn.trust,
            color: warn.valuecolor,
          };
        } else {
          Array.from(warning.values()).forEach((warn, i) => {
            //console.log({ ...warn });
            let found = _.find(warn.subjects, { drugkey: selectedDrug });
            //console.log({ type: warn.type, value: warn.value, found });
            if (_.find(warn.subjects, { drugkey: selectedDrug })) {
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
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, patientForm },
          drugs: { selectedRows },
          warnings: {
            info: { names },
            warning,
            groups,
          }, //warnings, warnGroups
        } = this.props;
        let selectedWarnings = this.conflicts;
        let noSelections = _.isEmpty(selectedWarnings);
        let GroupGroup = []

        // var map = groups.reduce((acc, cur)=>{
        //   acc[cur.id] = acc[cur.id] || { 
        //     id: cur.id,
        //     facts: [],
        //     plans: []
        //   };
        //   acc[cur.id].plans.push(cur.plan);
        //   acc[cur.id].facts.push(cur.fact);
        //   return acc;
        //   },{})

        // console.log(map);

        // var result = Object.values(map);

        //         age: (...)
        // clinrec: (...)
        // driving: (...)
        // interdrug: (...)
        // onedv_1: Proxy
        // onedv_2: (...)
        // seffect: (...)
        // unidirfd_1: (...)
        // unidirfd_2: (...)
        // unidirfd_3: (...)
        // unidirfd_4: (...)
        // unidirfd_5: (...)
        // unidirfg_1: (...)
        // unidirfg_2: (...)

        // group: 6
        // hint: "Дублирующий препарат"
        // hintarr: Proxy
        // type: "onedv_1"
        // value: 0.75
        // valuecolor: "#fc7301"

        // console.log(selectedWarnings, groups, "selectedWarnings, groups");

        // console.log('groups', groups);
        return (
          <>
            <Grid as={Segment} basic style={{ marginTop: 0 }}>
              {_.keys(groups).map((key, i) => {
                let group = groups[key];
                let color = (selectedWarnings[group.type] && selectedWarnings[group.type].color) || group.valuecolor;
                // console.log('groups', group, color);
                let icon = group.type;

                let arr = group.type.split("_");
                if (arr.length > 1) {
                  icon = arr[0];
                }

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
                console.log('selectedConflict', selectedConflict);
                return (
                  <Grid.Column key={"warn" + i} className="conflict">
                    {!selectedConflict && selectedWarnings[group.type] ? (
                      <RouterLink
                        to={"/warning/" + group.type}
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
                      <RouterLink to={"/warning/" + group.type} className="conflicticon arrowBg none">
                        <List.Icon name="arrow alternate circle down" style={{ color: "#FFF" }} size="large" />
                      </RouterLink>
                    )}
                    <Popup
                      content={
                        <>
                          {group.hintarr && group.hintarr.length > 0 && <Header as="h5" content={group.hint} />}
                          {(!group.hintarr || group.hintarr.length < 1) && group.hint}
                          {group.hintarr && group.hintarr.length > 0 && (
                            <List bulleted>
                              {group.hintarr.map((hintId, x) => {
                                return <List.Item key={"hint-" + i + "-" + x}>{names[hintId]}</List.Item>;
                              })}
                            </List>
                          )}
                        </>
                      }
                      trigger={
                        <Icon.Group
                          onClick={() => this.selectConflict(key)}
                          size="big"
                          className={noSelections || selectedWarnings[group.type] ? "selected" : "gray"}
                        >
                          {group.type === "age" ? (
                            <Icon as="img" src={`/warnicons/${ageIconName ? ageIconName : "no" + icon}.svg`} />
                          ) : (
                            <Icon as="img" src={`/warnicons/${icon}.svg`} />
                          )}
                          <Icon size="big" name="circle outline" style={{ color }} />
                          {group.type === "age" && age && <div className="agecontainer">{age || "!"}</div>}
                        </Icon.Group>
                      }
                    />
                  </Grid.Column>
                );
              })}
            </Grid>
          </>
        );
      }
    }
  )
);

export default Conflicts;
