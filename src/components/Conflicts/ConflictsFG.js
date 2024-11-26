import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

// import Conflict from "./Conflict";

import { List, Icon, Grid, Popup, Header, Accordion } from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";

const colorPallette = [
  "#007b2b",
  "#cccccc", //"#b0d512",
  "#54C8FF",
  "#fff42b",
  "#ffca2f",
  "#fc7301",
  "#f42a03",
  "#6435C9",
  "#A333C8",
];

const Conflicts = inject(
  "db",
  "actions",
  "drugs",
  "warnings",
)(
  observer(
    class Conflicts extends Component {
      constructor(props) {
        super(props);
        this.state = { activeIndex: null };
      }
      selectConflict = (groupId) => {
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


      getGroup(val) {
        let color = "#cccccc";
        let group = 0;
        switch (true) {
          case val === 2:
            color = colorPallette[8];
            group = 0;
            break;
          case val === 3:
            color = colorPallette[7];
            group = 0;
            break;
          case val === -1:
            color = colorPallette[0];
            group = 1;
            break;
          case val === 0:
            color = colorPallette[1];
            group = 2;
            break;
          case val > 0 && val <= 0.17:
            color = colorPallette[2];
            group = 3;
            break;
          // case val > 0.2 && val <= 0.4:
          //   color = colorPallette[3]
          //   group = 4
          //   break;
          case val > 0.17 && val <= 0.5:
            color = colorPallette[4];
            group = 5;
            break;
          case val > 0.5 && val <= 0.75:
            color = colorPallette[5];
            group = 6;
            break;
          case val > 0.75 && val <= 1:
            color = colorPallette[6];
            group = 7;
            break;
          default:
            color = "#cccccc";
            group = 0;
        }
        return { color, group };
      }

      handleClick = (index) => {
        // const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({ activeIndex: newIndex });
      };
      get conflicts() {
        let {
          actions: { selectedDrugFg, selectedConflictFg },
          warnings: { warningFg, groupsFg }, // warnings, warnGroups, warnIcons
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
          actions: { selectedConflictFg, patientForm },
          drugs: { drugsForFG },
          itemId,
          warnings: {
            infoFg: { names },
            groupsFg,
          }, //warnings, warnGroups
        } = this.props;
        let { activeIndex } = this.state;
        let selectedWarnings = this.conflicts;
        let noSelections = _.isEmpty(selectedWarnings);

        // console.log(this.props);
        // console.log(drugsForFG);
        // console.log(itemId);
        // console.log(groupsFg);


        const mutationArray = [];
        let group = null;
        let groupType = [];

        _.keys(groupsFg).forEach((key, i) => {
          group = groupsFg[key];
          // console.log(group);
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


        const FDFDHZ = drugsForFG[itemId] || null;
        // console.log(FDFDHZ);

        const warningsArr = FDFDHZ.warnings || [];

        if (warningsArr.length) { console.log(warningsArr); }

        let mutationArray2 = warningsArr.map(warning => {

          let { color, group } = this.getGroup(warning.danger);

          return {
            type: warning.type,
            typeOld: warning.type,
            valuecolor: color,
            values: [{
              group: group,
              hint: null, // warning.type + "" + warning.danger
              hintarr: null,
              key: warning.type,
              type: warning.type,
              value: warning.danger,
              valuecolor: color,
            }],

          };
        });

        // mutationArray2 = [
        //   {
        //     type: "interdrug",

        //     typeOld: "interdrug",

        //     valuecolor: "#ffca2f",
        //     values: [{
        //       group: 5,
        //       hint: "Межлекарственные взаимодействия",
        //       hintarr: null,
        //       key: "interdrug",
        //       type: "interdrug",
        //       value: 0.5,
        //       valuecolor: "#ffca2f",
        //     }],
        //   }
        // ];


        console.log(mutationArray);
        return (
          <>
            <Grid className="changefg" style={{ marginTop: 0 }}>
              {mutationArray2.map((item, i) => {
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
                // console.log(item.values);

                if (item.values.length < 2) {
                  return (
                    <Grid.Column key={"warn" + i} className="conflict">
                      {/* <Popup
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
                        trigger={ */}
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
                      {/* }
                      /> */}
                    </Grid.Column>
                  );
                } else {
                  return (
                    <div className={activeIndex !== i ? "warncontainer" : "warncontainer open"}>
                      {activeIndex !== i ? (
                        // <Popup
                        //   position="top right"
                        //   content={
                        //     <>
                        //       {item.values[0].hintarr && item.values[0].hintarr.length > 0 && (
                        //         <Header as="h5" content={item.values[0].hint} />
                        //       )}
                        //     </>
                        //   }
                        //   trigger={
                        <div className="warnstack" onClick={() => this.handleClick(i)}>
                          {item.values.map((element) => {
                            return (
                              <Grid.Column
                                key={"warn" + i}
                                className="conflict"
                                style={{ paddingTop: 0, paddingRight: 0 }}
                              >
                                <Icon.Group
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
                              </Grid.Column>
                            );
                          })}
                        </div>
                        //   }
                        // />
                      ) : (
                        <div className="warnstack open">
                          {item.values.map((element) => {
                            return (
                              <Grid.Column
                                key={"warn" + i}
                                className="conflict"
                                style={{ paddingTop: 0, paddingRight: 0 }}
                              >
                                {/* <Popup
                                  position="top right"
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
                                  trigger={ */}
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
                                {/* }
                                /> */}
                              </Grid.Column>
                            );
                          })}
                        </div>
                      )}
                      {false && (
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
                                      onClick={() => { }}
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
                      )}
                    </div>
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
