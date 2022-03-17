import React, { Component, Fragment } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
// import { Collapse } from "react-collapse";
import AnimateHeight from "react-animate-height";

import {
  // Menu,
  List,
  Transition,
  Button,
  Icon,
  Segment,
  Label,
  Table,
  Dimmer,
  Header,
  Feed,
  Checkbox,
  Responsive,
} from "semantic-ui-react";

import _ from "lodash";

const Clinrec = inject(
  "db",
  "actions",
  "druginfo",
  "router",
  "drugs",
  "clinrecs",
  "warnings",
  "tools"
)(
  observer(
    class Clinrec extends Component {
      constructor(props) {
        super(props);

        this.state = {
          opened: null,
        };
      }

      collapse = (opened) => {
        if (this.state.opened === opened) {
          this.setState({ opened: null });
        } else {
          this.setState({ opened });
        }
      };

      checkRecoursive = (id, check) => {
        if (this.props.clinrecs.clinrec[id].type == "Drug") {
          this.props.clinrecs.clinrec[id].check = check;
        }
        let arr = _.cloneDeep(this.props.clinrecs.clinrec[id].childs);
        if (this.props.clinrecs.clinrec[id].type == "OR" && arr[0]) {
          arr.forEach((item, i) => {
            if (i == 0) {
              this.checkRecoursive(item, check);
            } else {
              this.checkRecoursive(item, false);
            }
          });
        } else {
          arr.forEach((item, i) => {
            this.checkRecoursive(item, check);
          });
        }
      };

      check = (id) => {
        let check = !_.cloneDeep(this.props.clinrecs.clinrec[id].check);
        let arr = _.cloneDeep(this.props.clinrecs.clinrec[id].childs);
        arr.forEach((item, i) => {
          this.checkRecoursive(item, check);
        });
        this.props.clinrecs.clinrec[id].check = check;
      };

      renderCourse = (course) => {
        return null;
      };

      handleChangeRadio = ({ name, parent }) => {
        let arr = _.cloneDeep(this.props.clinrecs.clinrec[parent].childs);
        arr.forEach((item, i) => {
          if (this.props.clinrecs.clinrec[item]) {
            this.props.clinrecs.clinrec[item].check = false;
          }
        });
        this.props.clinrecs.clinrec[name].check = true;
      };

      handleChangeCheckbox = ({ name }) => {
        if (this.props.clinrecs.clinrec[name]) {
          this.props.clinrecs.clinrec[name].check = !this.props.clinrecs.clinrec[name].check;
        }
      };

      getByFG = (child, childId) => {
        child.id = childId;
        this.props.clinrecs.getByFG(child);
      };

      renderCheck = (childs, id) => {
        let {
          clinrecs: { clinrec },
        } = this.props;
        const { t } = this.props.actions;
        return (
          <List.Item>
            <List.Content className="large">
              <List.Description>{t("choose_one_or_more_options")}:</List.Description>
              <List.List>
                {childs.childs &&
                  childs.childs.map((childId) => {
                    let child = clinrec[childId];
                    if (!child) return null;
                    return (
                      <div key={"chckbx_" + childId}>
                        <Checkbox
                          name={id}
                          checked={child.check}
                          label={{
                            children: this.renderPure(child, childId),
                          }}
                          onChange={() => this.handleChangeCheckbox({ name: childId, parent: id })}
                        />
                      </div>
                    );
                  })}
              </List.List>
            </List.Content>
          </List.Item>
        );
      };

      renderRadio = (childs, id) => {
        let {
          clinrecs: { clinrec },
        } = this.props;
        const { t } = this.props.actions;

        return (
          <List.Item>
            <List.Content className="large">
              <List.Description>{t("choose_one_options")}:</List.Description>
              <List.List>
                {childs.childs &&
                  childs.childs.map((childId) => {
                    let child = clinrec[childId];
                    if (!child) return null;
                    return (
                      <div key={"rdio_" + childId}>
                        <Checkbox
                          radio
                          name={id}
                          label={{
                            children: this.renderPure(child, childId),
                          }}
                          checked={child.check}
                          onChange={() => this.handleChangeRadio({ name: childId, parent: id })}
                        />
                      </div>
                    );
                  })}
              </List.List>
            </List.Content>
          </List.Item>
        );
      };

      renderGroup = (child) => {
        return (
          <List.Item>
            <List.Content className="large">
              <List.Description>{child.name}</List.Description>
              <List.List>{this.renderRecoursive(child)}</List.List>
            </List.Content>
          </List.Item>
        );
      };

      renderFG = (child, childId) => {
        let { t } = this.props.actions;
        return (
          <List.Item>
            <List.Content className="large">
              <List.Description>
                <strong>{child.name}</strong>
                <span className="underlined" onClick={() => this.getByFG(child, childId)}>
                  {t("show")}
                </span>
              </List.Description>
              {child.comment && <List.Description>{child.comment}</List.Description>}
              <List.List>{this.renderRecoursive(child)}</List.List>
            </List.Content>
          </List.Item>
        );
      };

      renderSelect = (child, childId) => {
        let { t } = this.props.actions;
        return (
          <List.Item>
            <List.Content className="large">
              <List.Description>
                <strong>{t("select_one_or_more_options")}</strong>
              </List.Description>
              {child.comment && <List.Description>{child.comment}</List.Description>}
              <List.List>{this.renderRecoursive(child)}</List.List>
            </List.Content>
          </List.Item>
        );
      };

      renderRegimen = (child, childId) => {
        let {
          clinrecs: { clinrec, cources },
        } = this.props;
        let { t } = this.props.actions;
        // console.log({ cources, clinrec });
        if (cources && cources[childId]) {
          return (
            <List.Item>
              <Checkbox
                checked={child.check}
                onClick={() => this.check(childId)}
                label={{
                  children: (
                    <List.Content className="large">
                      <List.Header>{child.name}</List.Header>
                    </List.Content>
                  ),
                }}
              />
              <List.Content className="large">
                <List.Item>
                  <Table celled>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell singleLine>{t("name")}</Table.HeaderCell>
                        <Table.HeaderCell>{t("dosage")}</Table.HeaderCell>
                        <Table.HeaderCell>{t("form")}</Table.HeaderCell>
                        <Table.HeaderCell>{t("method_reception")}</Table.HeaderCell>
                        <Table.HeaderCell>{t("multiplicity_reception")}</Table.HeaderCell>
                        <Table.HeaderCell>{t("course_day")}</Table.HeaderCell>
                        <Table.HeaderCell>{t("course_duration")}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    {cources[childId].map((item) => {
                      return this.renderTable(item);
                    })}
                  </Table>
                </List.Item>
              </List.Content>
            </List.Item>
          );
        } else {
          return (
            <List.Item>
              <Checkbox
                checked={child.check}
                onClick={() => this.check(childId)}
                label={{
                  children: (
                    <List.Content className="large">
                      <List.Header>{child.name}</List.Header>
                    </List.Content>
                  ),
                }}
              />
              <List.Content className="large">
                <List.Item>
                  <List.List>{this.renderRecoursive(child)}</List.List>
                </List.Item>
              </List.Content>
            </List.Item>
          );
        }
      };

      renderDrug = (obj) => {
        let {
          clinrecs: { clinrec, names, shortnames },
          warnings: { getGroup },
        } = this.props;
        // console.log(obj);
        if (!obj) return null;
        let { name, type } = obj.drug;
        let { method, form, intervalpreset, schedulepreset, dosage, comment } = obj;
        let helpers = {};
        if (dosage && dosage.length > 0) {
          helpers.dosage = {
            short: `${dosage[0].value_1} ${shortnames[dosage[0].id_1]}`,
          };
        }
        let rules = [];
        if (intervalpreset) {
          intervalpreset.forEach((item, i) => {
            rules.push(names[item]);
          });
        }
        if (schedulepreset) {
          schedulepreset.forEach((item, i) => {
            rules.push(names[item]);
          });
        }
        let { color, group } = getGroup(obj.warning);

        return (
          <List.Item className={`nowarnings`}>
            {false && <div className="border" style={{ backgroundColor: color }} />}
            <Responsive as={List.Content} className="ui feed large" fireOnMount minWidth="481">
              <Feed.Event>
                <Feed.Content>
                  <Feed.Summary>
                    <span className="underlined">
                      <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
                    </span>

                    {type === "TN" && (
                      <span>
                        <sup>TM</sup>
                      </span>
                    )}
                    <Feed.Date>{comment}</Feed.Date>
                    {/* Uncomment when Svetozavr is ready =) */}
                    {false && (
                      <Feed.Date>
                        {form && (shortnames[form] || names[form])}{" "}
                        {helpers.dosage && (helpers.dosage.short || helpers.dosage.full) && ", "}
                        {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || ""}
                      </Feed.Date>
                    )}
                  </Feed.Summary>
                  <Feed.Meta>
                    {!!names[method] && `${names[method]}`}
                    {!!names[method] && rules.length > 0 && ", "}
                    {rules.join(", ")}
                  </Feed.Meta>
                </Feed.Content>
              </Feed.Event>
            </Responsive>
            <Responsive as={Fragment} maxWidth="480">
              <List.Content className="ui feed large">
                <Feed.Event>
                  <Feed.Content>
                    <Feed.Summary>
                      <span className="underlined">
                        {/* {name} */}
                        <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
                      </span>
                      {type === "TN" && (
                        <span>
                          <sup>TM</sup>
                        </span>
                      )}
                    </Feed.Summary>
                    <Feed.Meta>
                      {form && (shortnames[form] || names[form])}{" "}
                      {helpers.dosage && (helpers.dosage.short || helpers.dosage.full) && ", "}
                      {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || ""}
                    </Feed.Meta>
                    <br />
                    <Feed.Meta>
                      {!!names[method] && `${names[method]}`}
                      {!!names[method] && rules.length > 0 && ", "}
                      {rules.join(", ")}
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              </List.Content>
            </Responsive>
          </List.Item>
        );
      };

      renderTable = (obj) => {
        let {
          clinrecs: { clinrec },
          tools: { names, shortnames },
          warnings: { getGroup },
        } = this.props;
        // console.log(obj);
        if (!obj) return null;
        // console.log({ obj });
        let { name, type, dosage, specials, freq, duration } = obj;
        let { method_name, form_name, intervalpreset, schedulepreset, comment } = dosage;
        let helpers = {};
        if (dosage.dosage && dosage.dosage.length > 0) {
          helpers.dosage = {
            short: `${dosage.dosage[0].value_1} ${shortnames[dosage.dosage[0].id_1]}`,
          };
        }
        let rules = [];
        // if (intervalpreset) {
        //   intervalpreset.forEach((item, i) => {
        //     rules.push(names[item]);
        //   });
        // }
        // if (schedulepreset) {
        //   schedulepreset.forEach((item, i) => {
        //     rules.push(names[item]);
        //   });
        // }
        // let { color, group } = getGroup(obj.warning);

        return (
          <Table.Row>
            <Table.Cell>
              <span className="underlined">
                {/* {name} */}
                <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
              </span>
              {type === "TN" && (
                <span>
                  <sup>TM</sup>
                </span>
              )}
            </Table.Cell>
            <Table.Cell>
              <div
                dangerouslySetInnerHTML={{
                  __html: (helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || "",
                }}
                style={{ display: "inline" }}
              />
            </Table.Cell>
            <Table.Cell>{form_name} </Table.Cell>
            <Table.Cell textAlign="right">
              {method_name}
              {rules.length > 0 && ", "}
              {rules.join(", ")}
            </Table.Cell>
            <Table.Cell>{freq} </Table.Cell>
            <Table.Cell>{specials}</Table.Cell>
            <Table.Cell>{duration} </Table.Cell>
          </Table.Row>
        );
      };

      renderRecoursive = (childs) => {
        let {
          clinrecs: { clinrec },
        } = this.props;
        //childs.type
        return (
          <>
            {childs.childs &&
              childs.childs.map((childId) => {
                let child = clinrec[childId];
                if (!child) return null;
                if (child.type === "Drug") return this.renderDrug(child);
                if (child.type === "GroupSeq") return this.renderGroup(child);
                if (child.type === "Regimen") return this.renderRegimen(child, childId);
                if (child.type === "OR") return this.renderRadio(child, childId);
                if (child.type === "FG") return this.renderFG(child, childId);
                if (child.type === "AND") return this.renderCheck(child, childId);
                if (child.type === "Select") return this.renderSelect(child, childId);
                return (
                  <List.Item key={"calc" + childId}>
                    <List.Content className="large">
                      <List.Header>{child.name}</List.Header>
                      {child.comment && <List.Description>{child.comment}</List.Description>}
                      <List.Description>
                        {child.type == "Unknown" ? "" : child.type + <br />}
                        {child.efficiency}
                      </List.Description>
                      <List.Item>
                        <List.List>{this.renderRecoursive(child)}</List.List>
                      </List.Item>
                    </List.Content>
                  </List.Item>
                );
              })}
          </>
        );
      };

      renderPure = (child, childId) => {
        switch (child.type) {
          case "Drug":
            return this.renderDrug(child);
            break;
          case "GroupSeq":
            return this.renderGroup(child);
            break;
          case "Regimen":
            return this.renderRegimen(child, childId);
            break;
          case "OR":
            return this.renderRadio(child, childId);
            break;
          case "AND":
            return this.renderCheck(child, childId);
            break;
          case "FG":
            return this.renderFG(child, childId);
            break;
          case "Unknown":
            return this.renderFG(child, childId);
            break;
          case "Select":
            return this.renderSelect(child, childId);
            break;
          default:
            return this.renderRecoursive(child, childId);
        }
      };

      render() {
        let {
          router,
          clinrecs: { clinrec, ready },
        } = this.props;
        const { t } = this.props.actions;
        let { opened } = this.state;

        return (
          <>
            <Segment basic>
              {_.keys(clinrec).map((id) => {
                let rec = clinrec[id] || {};
                if (rec.parents) return null;
                return (
                  <>
                    <Header as="h3" className="stretched">
                      <Icon name="unordered list" />
                      <Header.Content>{rec.name}</Header.Content>
                    </Header>
                    <List divided relaxed className="draginfo clinrec" verticalAlign="middle" size="large">
                      {rec.childs.map((courseId, i) => {
                        let course = clinrec[courseId];
                        if (!course) return null;
                        // console.log({item});
                        let openMe = "calc" + courseId === opened || rec.childs.length == 1;
                        return (
                          <List.Item key={"calc" + i} style={{ cursor: "pointer" }}>
                            {rec.childs.length > 1 && <List.Icon name={`angle ${openMe ? "down" : "right"}`} />}
                            <List.Content className="large">
                              <List.Header onClick={() => this.collapse("calc" + courseId)}>{course.name}</List.Header>
                              <AnimateHeight
                                duration={500}
                                height={openMe ? "auto" : 0} // see props documentation below
                              >
                                <List.Item>
                                  <List.List>{this.renderRecoursive(course)}</List.List>
                                </List.Item>
                              </AnimateHeight>
                            </List.Content>
                          </List.Item>
                        );
                      })}
                    </List>
                  </>
                );
              })}
            </Segment>
            {ready && this.items.instr.length < 1 && this.items.calc.length < 1 && (
              <Dimmer.Dimmable as={Segment} basic dimmed={true} className="h100">
                <Dimmer active={true} inverted>
                  <Header as="h2" icon color="grey">
                    <Icon name="dont" />
                    {t("no_information")}
                  </Header>
                </Dimmer>
              </Dimmer.Dimmable>
            )}
          </>
        );
      }
    }
  )
);

export default withTranslation()(Clinrec);
