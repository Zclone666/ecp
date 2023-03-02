import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../router/a";

import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { withTranslation } from "react-i18next";
import Drug from "./Drug";
import RecipeDrug from "./RecipeDrug";

import {
  // Menu,
  List,
  // Feed,
  // Responsive,
  Icon,
} from "semantic-ui-react";

import _ from "lodash";

const Drugs = inject(
  "db",
  "actions",
  "drugs",
  "dosages",
  "warnings",
  "tools"
)(
  observer(
    class Drugs extends Component {
      constructor(props) {
        super(props);

        this.state = {};
      }

      get warnDrugs() {
        let {
          actions: { selectedDrug, selectedConflict },
          warnings: { warning }, //warnings, warnGroups
        } = this.props;
        let drugsObj = {};

        let currDrug = null;

        _.orderBy(
          Array.from(warning.values()),
          ["step", "group", "value", "trust"],
          ["asc", "desc", "desc", "desc"]
        ).forEach((warn, i) => {
          // console.log({ warn });
          if (selectedConflict) {
            if (warn.type === selectedConflict) {
              let arr =
                _.filter(warn.subjects, (o) => {
                  return o.drugkey !== selectedConflict;
                }) || [];
              // console.log({ arr });
              arr.forEach((item, x) => {
                // console.log({ item });
                if (!drugsObj[item.drugkey] || drugsObj[item.drugkey].step < warn.step) {
                  drugsObj[item.drugkey] = {
                    value: warn.value,
                    group: warn.group,
                    color: warn.color,
                  };
                }
              });
            }
          } else {
            currDrug = _.find(warn.subjects, { drugkey: selectedDrug });
            // console.log({currDrug});
            if (currDrug) {
              // && warn.type === 'interdrug' ){
              let arr =
                _.filter(warn.subjects, (o) => {
                  return o.drugkey !== selectedDrug && !o.hidekeys.includes(currDrug.drugkey);
                }) || [];
              // console.log({ arr });
              arr.forEach((item, x) => {
                // console.log({ item });
                if (!drugsObj[item.drugkey] || drugsObj[item.drugkey].step < warn.step) {
                  drugsObj[item.drugkey] = {
                    value: warn.value,
                    group: warn.group,
                    color: warn.color,
                  };
                }
              });
            }
          }
        });
        // console.log({drugsObj});
        return drugsObj;
      }

      get drugsWithGroups() {
        let {
          drugs: { drug: drugs },
        } = this.props;

        let groups = [];
        let iterator = [];
        let grouped = {};
        let hasSolute = 0;

        drugs.forEach((drugObj, key) => {
          // let dos = dosage.get(drugObj.key) || {}

          let drug = { ...drugObj };
          // drug.solute = dos.solute

          if (drug.solute) hasSolute++;

          if (groups.indexOf(drug.group) === -1) {
            groups.push(drug.group);
          }
          iterator.push(drug);
          grouped[drug.group] = grouped[drug.group] ? [...grouped[drug.group], drug] : [drug];
        });

        if (hasSolute > 1) groups.push(_.max(groups) + 1);

        groups = _.sortBy(groups, [
          function (o) {
            return -o;
          },
        ]);

        return {
          groups,
          grouped,
          iterator,
          canDrag: hasSolute > 1,
        };
      }

      onBeforeDragStart = (result) => {
        // console.log('onBeforeDragStart', result);
      };
      onDragStart = (result) => {
        // console.log('onDragStart', result);
      };
      onDragUpdate = (result) => {
        // console.log('onDragUpdate', result);
      };
      onDragEnd = (result) => {
        // console.log('onDragEnd', result);
        if (!result.destination || !result.destination.droppableId) return;
        let group = parseInt(_.replace(result.destination.droppableId, "drug_place_", ""));
        let key = [result.draggableId];

        this.props.drugs.setGroup(key, group);
      };

      getLiqParams = async (id) => {
        let {
          drugs: { makeLiquids, getLiquidParams },
        } = this.props;
        await makeLiquids();
        // await this.props.tools.timeout(500);
        await getLiquidParams(id);
      };

      removeLiquid = (drugs) => {
        let keys = [];
        drugs.forEach((drug, i) => {
          keys.push(drug.key);
        });

        this.props.drugs.setGroup(keys, 0);
      };

      onRemove = (key, drugs) => {
        if (drugs.length < 3) {
          this.removeLiquid(drugs);
        } else {
          this.props.drugs.setGroup([key], 0);
        }
      };

      componentDidMount() {
        if (this.props.isRecipe) {
          this.props.tools.getLatinNames();
        }
      }

      render() {
        let {
          actions: { makeLiquids, disabled, topview_disabled },
          drugs: { liquid: liquidList, checkLiquids },
          tools,
          isRecipe,
        } = this.props;

        const canFindAddDeleteDrugs = tools.hasFunctional("FindAddDeleteDrugs");
        const canSelectDosageMethodUsingDrugs = tools.hasFunctional("SelectDosageMethodUsingDrugs");

        const { t } = this.props.actions;
        let { groups, grouped, iterator, canDrag } = this.drugsWithGroups;

        let warnDrugs = this.warnDrugs;

        let colors = ["#F3F4F5", "#DFF0FF", "#FBFDEF", "#F6E7FF", "#E1F7F7", "#FBFDEF", "#FFEDDE"];

        let borderColors = ["#DCDDDE", "#54C8FF", "#FFE21F", "#DC73FF", "#6DFFFF", "#D9E778", "#FF851B"];
        // console.log({ drugs: Array.from(drugs.values()), liquids: Array.from(liquidList.values()) });
        return (
          <>
            {!disabled && !isRecipe && (
              <DragDropContext
                onBeforeDragStart={this.onBeforeDragStart}
                onDragStart={this.onDragStart}
                onDragUpdate={this.onDragUpdate}
                onDragEnd={this.onDragEnd}
              >
                <List divided selection verticalAlign="middle" size="big" className={isRecipe ? "" : "drugslist"}>

                  { // eslint-disable-next-line array-callback-return
                    groups.map((liquid, l) => {
                      let current = liquidList.get(liquid);
                      if (liquid === 0) {
                        return (
                          <Droppable
                            isCombineEnabled
                            droppableId={`drug_place_${liquid}`}
                            type="DRUG"
                            key={`drug_place_${liquid}`}
                          >
                            {(prov, snap) => {
                              return (
                                <div
                                  ref={prov.innerRef}
                                  style={{
                                    backgroundColor: snap.isDraggingOver ? colors[liquid] : "",
                                    borderColor: borderColors[liquid],
                                  }}
                                  {...prov.droppableProps}
                                >
                                  {grouped[liquid].map((drug, i) => {
                                    // let dosages = dosage.get(drug.key)
                                    // let isLiquid = (dosages && dosages.solute)
                                    // console.log({drug})
                                    return (
                                      <Draggable
                                        isDragDisabled={!drug.solute || !canDrag || !canFindAddDeleteDrugs}
                                        draggableId={drug.key}
                                        index={i}
                                        key={`drug_${drug.key}`}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={snapshot.isDragging ? "dragging" : ""}
                                          >
                                            <Drug
                                              canDrag={!(!drug.solute || !canDrag)}
                                              active={warnDrugs[drug.key] || false}
                                              drug={drug}
                                              key={`drug_${i}`}
                                            />
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {prov.placeholder}
                                </div>
                              );
                            }}
                          </Droppable>
                        );
                      } else if (!topview_disabled) {
                        return (
                          <Droppable droppableId={`drug_place_${liquid}`} type="DRUG" key={`drug_place_${liquid}`}>
                            {(prov, snap) => {
                              let liqObj = liquidList.get(liquid) || {};
                              return (
                                <div
                                  className={`liquidcontainer${snap.isDraggingOver ? " active" : ""}`}
                                  ref={prov.innerRef}
                                  style={{
                                    backgroundColor: snap.isDraggingOver ? colors[liquid] : "",
                                    borderColor: grouped[liquid] ? borderColors[liquid] : borderColors[0],
                                  }}
                                  {...prov.droppableProps}
                                >
                                  {canFindAddDeleteDrugs && !grouped[liquid] && (
                                    <div className={"abstext"}>{t("drag_two_components_for_solution")}</div>
                                  )}
                                  {grouped[liquid] && (
                                    <div
                                      className={"text"}
                                      style={{
                                        color: liqObj.edit ? "#072c71" : "inherit",
                                      }}
                                    >
                                      {canFindAddDeleteDrugs && <Icon
                                        name="delete"
                                        className="right floated pointer"
                                        onClick={() => this.removeLiquid(grouped[liquid])}
                                      />}
                                      {canSelectDosageMethodUsingDrugs && current && checkLiquids && !makeLiquids && (
                                        <RouterLink
                                          disabled={!current}
                                          onClick={() => this.getLiqParams(liquid)}
                                          to={"/liquid/calc/" + liquid}
                                        >
                                          <Icon name="lab" className="right floated" />
                                        </RouterLink>
                                      )}
                                      {t("solution")} {liquid}
                                    </div>
                                  )}

                                  {grouped[liquid] &&
                                    grouped[liquid].map((drug, i) => {
                                      return (
                                        <Draggable
                                          isDragDisabled
                                          draggableId={drug.key}
                                          index={i}
                                          key={`drug_${drug.key}`}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={snapshot.isDragging ? "dragging" : ""}
                                            >
                                              <Drug
                                                style={{
                                                  backgroundColor: snap.isDraggingOver ? colors[liquid] : "",
                                                }}
                                                active={warnDrugs[drug.key] || false}
                                                drug={drug}
                                                key={`drug_${i}`}
                                                minus={true}
                                                onRemove={() => this.onRemove(drug.key, grouped[liquid])}
                                              />
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                  {prov.placeholder}
                                  {grouped[liquid] && grouped[liquid].length === 1 && (
                                    <div className={"bottomtext"}>{t("add_one_element")}</div>
                                  )}
                                </div>
                              );
                            }}
                          </Droppable>
                        );
                      }
                    })}
                </List>
              </DragDropContext>
            )}
            {isRecipe && (
              <List divided selection verticalAlign="middle" size="big">
                {iterator.map((drug, i) => {
                  // console.log({drug});
                  return <RecipeDrug drugKey={drug.key} key={`drug_${i}`} />;
                })}
              </List>
            )}
            {disabled && (
              <List divided selection verticalAlign="middle" size="big" className={isRecipe ? "" : "drugslist"}>
                {iterator.map((drug, i) => {
                  return <Drug active={warnDrugs[drug.key] || false} drug={drug} key={`drug_${i}`} />;
                })}
              </List>
            )}
            {/* !isRecipe &&
          <DndProvider backend={HTML5Backend}>
            <List divided selection verticalAlign='middle' size='big' className={isRecipe ? '' : 'drugslist'}>
              {iterator.map(( drug, i ) => {
                return(
                  <Drug
                    active={warnDrugs[drug.key] || false}
                    drug={drug}
                    key={`drug_${i}`}
                  />
                )
              })}
            </List>
          </DndProvider>
        */}
          </>
        );
      }
    }
  )
);

export default withTranslation()(Drugs);
