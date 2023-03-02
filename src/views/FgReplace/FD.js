import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { Icon, List, Header, Checkbox } from "semantic-ui-react";

const FD = inject(
  "db",
  "actions",
  "router",
  "drugs"
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

      handleChange = (id) => {
        let drug = (this.props.router.values && this.props.router.values.drug) || "none";

        this.props.drugs.fdForSearch[drug].forEach((item, i) => {
          if (item.id === id) {
            this.props.drugs.fdForSearch[drug][i].main = !item.main;
          }
        });
      };

      render() {
        const { t } = this.props.actions;
        const { fdForSearch } = this.props.drugs;
        let drug = (this.props.router.values && this.props.router.values.drug) || "none";
        // console.log(fdForSearch);
        return (
          <div className="scrollwrapper">
            <Header as="h3" className="stretched">
              <Icon name="unordered list" />
              <Header.Content>{t("choose_fd_you_wanna_achive")}</Header.Content>
            </Header>
            <List selection divided className="dozelist big">
              {fdForSearch[drug] &&
                fdForSearch[drug].map((item, x) => {
                  let { main, name, id } = item;
                  return (
                    <List.Item key={"fd" + id} style={{ position: "relative" }}>
                      <Checkbox
                        checked={!!main}
                        onChange={() => this.handleChange(id)}
                        name={"fdForSearch"}
                        label={name}
                      />
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
