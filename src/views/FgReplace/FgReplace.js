import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

// import Spinner from '../../components/Spinner'

import DV from "./DV";
import FD from "./FD";

import { Menu } from "semantic-ui-react";
import { withTranslation } from "react-i18next";

const FgReplace = inject(
  "router",
  "db",
  "actions",
  "drugs",
  "warnings"
)(
  observer(
    class FgReplace extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,
          isLoading: false,
        };
        this.contextRef = createRef();
      }

      saveDoze = async () => {
        // let {
        //   drugs: { setDosageParams },
        //   router: { location }
        // } = this.props
        // await setDosageParams(location.pathname)
        // this.props.router.push('/')
        // let current = drugsDosages.data.get(currDrug.key) || {};
        // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );
      };

      chose = () => {
        let drug = (this.props.router.values && this.props.router.values.drug) || "none";

        this.back();
        this.props.drugs.choseNewDrugs(drug);
      };

      back = () => {
        this.props.router.push("/");
      };

      render() {
        const { t } = this.props.actions;
        let page = (this.props.router.values && this.props.router.values.page) || "none";
        let drug = (this.props.router.values && this.props.router.values.drug) || "none";
        return (
          <>
            <Menu className="bottom fixed menu two item huge main">
              {{
                chosefd: (
                  <Menu.Item color="red" onClick={this.back}>
                    {t("back")}
                  </Menu.Item>
                ),
                chosedv: (
                  <Menu.Item color="red" as={RouterLink} to={`/fgreplace/chosefd/${drug}`}>
                    {t("back")}
                  </Menu.Item>
                ),
                none: <div />,
              }[page] || null}
              {{
                chosefd: (
                  <Menu.Item color="red" as={RouterLink} to={`/fgreplace/chosedv/${drug}`}>
                    {t("next")}
                  </Menu.Item>
                ),
                chosedv: (
                  <Menu.Item color="red" onClick={this.chose}>
                    {t("confirm")}
                  </Menu.Item>
                ),
                none: <div />,
              }[page] || null}
            </Menu>

            <div className="scrollwrapper bottomMenu">
              {{
                chosefd: <FD />,
                chosedv: <DV />,
                none: <div />,
              }[page] || null}
            </div>
          </>
        );
      }
    }
  )
);

export default withTranslation()(FgReplace);
