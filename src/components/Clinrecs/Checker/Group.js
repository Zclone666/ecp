import React from "react";
import { inject, observer } from "mobx-react";
import { List } from "semantic-ui-react";
import Binary from "./Binary";
import Value from "./Value";
import _ from "lodash";

const Group = inject(
  "actions",
  "clinrecs"
)(
  observer(
    class Group extends React.Component {
      onChange = ({ name, value }) => {
        let {
          group,
          pageid,
          onChange,
          clinrecs: { checker },
        } = this.props;
        let page = checker[pageid];
        _.orderBy(page.arr, ["parent", "sort"], ["desc", "asc"]).forEach((item, i) => {
          // console.log({ name, "item.id": item.id });
          if (item.parent === group) {
            if (item.id === name) {
              onChange({ name, value: 1 });
            } else {
              onChange({ name: item.id, value: 0 });
            }
          }
        });
      };

      render() {
        let {
          group,
          header,
          pageid,
          clinrecs: { checker },
          actions: { clinrecCheckerData },
        } = this.props;
        let page = checker[pageid];

        return (
          <List.Item className="clinrec_group" style={{ position: "relative" }}>
            <List.Description dangerouslySetInnerHTML={{ __html: header || null }} />

            <List.List>
              {_.orderBy(page.arr, ["parent", "sort"], ["desc", "asc"]).map((item, x) => {
                if (item.parent !== group) {
                  return null;
                }

                return {
                  Binary: (
                    <Binary
                      radio
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
            </List.List>
          </List.Item>
        );
      }
    }
  )
);
export default Group;
