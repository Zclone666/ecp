import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import RouterLink from "../../router/a";
import Loader from "../../components/Loader";
import Conflicts from "../../components/Conflicts/ConflictsFG";

import { Transition, Accordion, Icon, Step, Responsive, List, Header, Checkbox } from "semantic-ui-react";
import _ from "lodash";

const FgDrugs = inject(
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
    class FgDrugs extends Component {
      constructor(props) {
        super(props);
        this.state = {
          activeIndex: "0",
          activeSubIndex: null,
          checked: [],
          openFor: null,
          viewType: "pc",
        };
      }

      render() {
        let { activeIndex, activeSubIndex, viewType, checked, openFor } = this.state;
        const { t } = this.props.actions;
        let { fds } = this.props.drugs;

        return <div className="fgdrugs"></div>;
      }
    }
  )
);

export default withTranslation()(FgDrugs);
