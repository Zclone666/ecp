import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import { Stepper } from "../../components/Clinrecs";

import {
  // Sidebar,
  Menu,
  // Icon,
  // Search,
  // Segment,
  // Message,
  // List,
  // Feed,
  // Button,
  // Responsive,
  // Grid
} from "semantic-ui-react";

import _ from "lodash";

@inject("router", "db", "actions", "drugs", "warnings", "clinrecs")
@observer
class Clinrecs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,

      isLoading: false,
      searchQuery: "",
      hasForward: true,
      hasBackward: false,
    };
    this.contextRef = createRef();
  }

  saveDoze = async () => {
    let {
      drugs: { setLiquidParams },
    } = this.props;
    await setLiquidParams();
    this.props.router.push("/");
    // let current = drugsDosages.data.get(currDrug.key) || {};
    // drugsDosages.data.set( currDrug.key, _.extend(current, { ...current, url: location.pathname }) );
  };

  setClinrec = () => {
    this.props.clinrecs.recursiveGetDrugs();
    this.props.router.push("/");
  };

  componentDidMount() {
    let {
      // clinrecs: { checker },
      actions: { clinrecCheckerStep },
    } = this.props;
    let step = clinrecCheckerStep > 1 ? parseInt(clinrecCheckerStep) - 1 : 1;
    this.setState({ hasBackward: step > 1 }, () => {
      // this.props.router.push('/clinrec/checker/'+step)
    });
  }

  backward = () => {
    let {
      clinrecs: { checker },
      actions: { clinrecCheckerStep },
    } = this.props;
    let step = clinrecCheckerStep > 1 ? parseInt(clinrecCheckerStep) - 1 : 1;
    this.setState({ hasBackward: step > 1, hasForward: step < _.keys(checker).length }, () => {
      this.props.router.push("/clinrec/checker/" + step);
    });
  };
  forward = () => {
    let {
      clinrecs: { checker },
      actions: { clinrecCheckerStep },
    } = this.props;
    let step = clinrecCheckerStep < _.keys(checker).length ? parseInt(clinrecCheckerStep) + 1 : null;
    this.setState({ hasForward: !!step, hasBackward: step > 1 || !step }, () => {
      if (step) {
        this.props.router.push("/clinrec/checker/" + step);
      } else {
        this.props.clinrecs.check(true);
        this.props.router.push("/clinrec/checker/result");
      }
    });
  };

  home = () => {
    this.props.router.push("/");
  };

  render() {
    let {
      // router: { values },
      clinrecs: { checker },
      actions: { clinrecCheckerStep },
    } = this.props;
    let { hasForward, hasBackward } = this.state;
    let currPage = checker[_.keys(checker)[clinrecCheckerStep - 1]] || {};
    let haveResult = clinrecCheckerStep > _.keys(checker).length - 1;
    return (
      <>
        <Menu className="bottom fixed menu three item huge main">
          <Menu.Item color="red" onClick={this.home}>
            Отмена
          </Menu.Item>
          <Menu.Item disabled={!hasBackward} onClick={this.backward}>
            Назад
          </Menu.Item>
          {hasForward && (
            <Menu.Item disabled={!currPage.isReady} onClick={this.forward}>
              Далее
            </Menu.Item>
          )}
          {!hasForward && !haveResult && (
            <Menu.Item disabled={!currPage.isReady} as={RouterLink} to={"/clinrec/checker/result"}>
              Результат
            </Menu.Item>
          )}
          {!hasForward && haveResult && <Menu.Item onClick={this.setClinrec}>Применить</Menu.Item>}
        </Menu>

        <div className="scrollwrapper bottomMenu">
          <Stepper />
        </div>
      </>
    );
  }
}
export default Clinrecs;
