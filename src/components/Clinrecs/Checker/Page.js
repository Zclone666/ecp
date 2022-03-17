import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import RouterLink from "../../../router/a";

import Binary from "./Binary";
import Value from "./Value";
import Group from "./Group";
import Clinrec from "../Clinrec";

import { Transition, Accordion, Icon, Step, Responsive, List, Header } from "semantic-ui-react";
import _ from "lodash";

const Page = inject(
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
    class Page extends Component {
      constructor(props) {
        super(props);
        this.state = {
          activeIndex: "0",
          viewType: "pc",
        };
      }

      onChange = ({ name, value, unitid }) => {
        let {
          clinrecs: { checker },
          actions: { clinrecCheckerStep, clinrecCheckerData },
        } = this.props;
        let currPage = checker[_.keys(checker)[clinrecCheckerStep - 1]] || {};
        // console.log({ name, value, unitid });
        this.props.actions.clinrecCheckerData[name].value = value;
        if (unitid) this.props.actions.clinrecCheckerData[name].unitid = unitid;
        let isReady = true;
        currPage.arr.map((item) => {
          if (clinrecCheckerData[item.id].value === null) isReady = false;
        });
        currPage.isReady = isReady;
        // console.log({ name, value, isReady });
      };

      render() {
        let { activeIndex, viewType } = this.state;
        let {
          id,
          clinrecs: { checker, names },
          actions: { clinrecCheckerStep, clinrecCheckerData },
        } = this.props;
        let currPage = checker[_.keys(checker)[clinrecCheckerStep - 1]] || {}; //page id is not equal array index!

        let page = checker[id];

        let parentFlag = null;

        return (
          <div className="scrollwrapper">
            <List selection divided className="dozelist big">
              {_.orderBy(page.arr, ["parent", "sort"], ["desc", "asc"]).map((item, x) => {
                if (item.parent && item.parent != parentFlag) {
                  parentFlag = item.parent;
                  let groupHeader = names[item.parent];
                  return (
                    <Group
                      key={"gr_" + item.parent}
                      header={groupHeader}
                      group={item.parent}
                      pageid={id}
                      onChange={this.onChange}
                    />
                  );
                } else if (item.parent) {
                  return null;
                }
                return {
                  Binary: (
                    <Binary
                      key={"gr_bnry_" + x}
                      name={item.id}
                      helper={item.helper || null}
                      onChange={this.onChange}
                      title={item.name}
                      value={clinrecCheckerData[item.id].value}
                    />
                  ),
                  Value: (
                    <Value
                      key={"gr_vle_" + x}
                      unit={item.unit}
                      unitid={item.unitid}
                      name={item.id}
                      onChange={this.onChange}
                      title={item.name}
                      value={clinrecCheckerData[item.id].value}
                    />
                  ),
                }[item.type];
              })}
            </List>
          </div>
        );
      }
    }
  )
);

export default Page;
