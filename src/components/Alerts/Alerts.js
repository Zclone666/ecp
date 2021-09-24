import React from "react";
import { inject, observer } from "mobx-react";

import Alert from "./Alert";

import _ from "lodash";

const Alerts = inject("actions")(
  observer(
    class Alerts extends React.Component {
      onClose = (key) => {
        this.props.actions.alerts = _.omit(this.props.actions.alerts, key);
      };
      render() {
        let { alerts, ...otherProps } = this.props.actions;
        return (
          <div className={"alertbox" + (_.keys(alerts).length === 0 ? " empty" : "")}>
            {_.keys(alerts).map((key, i) => {
              let item = alerts[key];
              if (item.code == 401)
                setTimeout(() => {
                  this.props.actions.logout();
                }, 3000);
              return <Alert key={`alert_${key}`} open onClose={() => this.onClose(key)} {...item} />;
            })}
          </div>
        );
      }
    }
  )
);

export default Alerts;
