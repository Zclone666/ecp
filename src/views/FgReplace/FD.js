import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import RouterLink from "../../router/a";

import { Transition, Accordion, Icon, Step, Responsive, List, Header, Checkbox } from "semantic-ui-react";
import _ from "lodash";

const FD = inject(
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
    class FD extends Component {
      constructor(props) {
        super(props);
        this.state = {
          activeIndex: "0",
          viewType: "pc",
        };
      }

      onChange = ({ name, value, unitid }) => {};

      render() {
        let { activeIndex, viewType } = this.state;
        const { t } = this.props.actions;
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
              <Header.Content>{t("choose_fd_you_wanna_achive")}</Header.Content>
            </Header>
            <List selection divided className="dozelist big">
              {_.orderBy(page.arr, ["parent", "sort"], ["desc", "asc"]).map((item, x) => {
                let { value, name, title } = item;
                return (
                  <List.Item style={{ position: "relative" }}>
                    <Checkbox checked={!!value} onChange={this.handleChange} name={name} label={title} />
                  </List.Item>
                );
              })}
            </List>
          </div>
        );
      }
    }
  )
);

export default withTranslation()(FD);
