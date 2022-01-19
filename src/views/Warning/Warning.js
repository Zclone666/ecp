import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";

import WarningTab from "../../components/WarningTab";

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic,
  Dropdown,
  Icon,
  Segment,
  Modal,
  Button,
  Form,
  TextArea,
} from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

function getLetter(value) {
  let result = "A";
  switch (true) {
    case value === 0:
      result = "X";
      break;
    case value === 2:
      result = "¥";
      break;
    case value === 3:
      result = "F";
      break;
    case value > 0 && value <= 0.25:
      result = "D";
      break;
    case value > 0.25 && value <= 0.5:
      result = "C";
      break;
    case value > 0.5 && value <= 0.75:
      result = "B";
      break;
    case value > 0.75 && value <= 1:
      result = "A";
      break;
    default:
      result = "A";
  }
  return result;
}

const Warning = inject(
  "router",
  "db",
  "actions",
  "drugs",
  "warnings",
  "tools"
)(
  observer(
    class Warning extends Component {
      constructor(props) {
        super(props);
        this.state = {
          activeIndex: 0,
          open: false,
          errorTextDialog: false,
          errorText: "",
        };
        //this.contextRef = createRef()
      }

      openErrorTextDialog = () => {
        this.setState({ errorTextDialog: true });
      };

      sendErrorText = async () => {
        const message = this.state.errorText;
        if (message.length) {
          await this.props.tools.ReportError(message);
          this.setState({ errorTextDialog: false, errorText: "" });
        }
      };

      toggleOpen = () => {
        this.setState({ open: !this.st });
      };

      back = () => {
        this.props.router.push("/");
      };

      handleTabChange = (e, { activeIndex }) => {
        this.setState({ activeIndex });
      };

      get tabs() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts },
          drugs: { selectedRows },
          warnings: { warning, groups, icons }, //warnings, warnGroups, warnIcons
          router: { values },
        } = this.props;

        // console.log(router);
        //
        // let values = {}

        let tabs = [];
        let subjFrom = false;
        let subjTo = false;

        let warnArr = _.orderBy(Array.from(warning.values()), ["group", "step"], ["desc", "asc"]);
        let isConflict = !!_.find(groups, { type: values.page });
        //console.log({isConflict, selectedDrug});
        warnArr.forEach((warn, i) => {
          if (selectedConflict) {
            subjFrom = warn.type === selectedConflict; //_.find(warn.subjects, (o) => { return o.drugkey === selectedConflict; })
            subjTo = _.find(warn.subjects, (o) => {
              return o.drugkey === values.page;
            });
          } else if (isConflict && selectedDrug) {
            //console.log({ selectedDrug, subj: warn.subjects});
            subjFrom = warn.type === values.page ? warn : false;
            subjTo = _.find(warn.subjects, (o) => {
              return o.drugkey === selectedDrug;
            });
          } else {
            subjFrom = _.find(warn.subjects, (o) => {
              return o.drugkey === selectedDrug;
            });
            subjTo = _.find(warn.subjects, (o) => {
              return o.drugkey === values.page;
            });
          }

          //console.log({ subjFrom, subjTo });
          if (subjFrom && subjTo) tabs.push(warn);
        });
        //console.log({tabs});
        return tabs;
      }

      renderTabs() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, getElement },
          drugs: { selectedRows },
          warnings: { warning, groups, icons }, //warnings, warnGroups, warnIcons
        } = this.props;
        let { activeIndex } = this.state;

        //console.log({ length: this.tabs.length});
        // console.log({length: this.tabs.length});
        let arr = this.tabs.length > 13 ? this.tabs.slice(0, 10) : this.tabs.slice(0, 11);

        return arr
          .sort((a, b) => {
            if (a.step > b.step) return -1;
            if (a.step < b.step) return 1;
            if (a.step == b.step) {
              if (a.value > b.value) return -1;
              if (a.value < b.value) return 1;
              if (a.value == b.value) {
                if (a.trust > b.trust) return -1;
                if (a.trust < b.trust) return 1;
              }
            }
          })
          .map((warn, i) => {
            let interaction = getElement("interaction", warn.value);
            let trust = getElement("trust", warn.trust);
            return (
              <Menu.Item
                key={"tab" + i}
                active={i === activeIndex}
                style={{ backgroundColor: warn.color }}
                onClick={() => this.handleTabChange(null, { activeIndex: i })}
              >
                {getLetter(warn.trust)}
              </Menu.Item>
            );
            // render: () => (
            // <Tab.Pane style={{ backgroundColor: warn.color, textAlign: 'center' }}>
            //   <Statistic inverted size='small'>
            //     <Statistic.Label>{interaction}</Statistic.Label>
            //     <Statistic.Value text>
            //       {trust}
            //     </Statistic.Value>
            //   </Statistic>
            // </Tab.Pane>
            // )
          });
      }
      renderMenuItems() {
        let {
          actions: { selectedDrug, selectedConflict, activeDrugs, activeConflicts, getElement },
          drugs: { selectedRows },
          warnings: { warning, groups, icons }, //warnings, warnGroups, warnIcons
        } = this.props;

        let arr = this.tabs.slice(11);
        // console.log({arr, tabs: this.tabs});

        return arr.map((warn1, i) => {
          let interaction = getElement("interaction", warn1.value);
          let trust = getElement("trust", warn1.trust);
          // console.log(i);
          return (
            <Dropdown.Item
              value={i + 11}
              key={`tab${i + 11}`}
              onClick={() => this.handleTabChange(null, { activeIndex: i + 11 })}
            >
              <Icon name="circle" style={{ color: warn1.color }} />
              {getLetter(warn1.trust)}
            </Dropdown.Item>
          );
        });
      }

      render() {
        let {
          actions: { getElement },
        } = this.props;
        const { t } = this.props.actions;
        let { activeIndex, open } = this.state;
        let widths = this.tabs.length ? (this.tabs.length < 13 ? this.tabs.length : 12) : 1;
        let warn = this.tabs[activeIndex];
        let interaction = getElement("interaction", warn.value);
        let trust = getElement("trust", warn.trust);

        // console.log("this tabs: ", this.tabs);
        return (
          <>
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item color="red" onClick={this.back}>
                {t("back")}
              </Menu.Item>
              <Menu.Item onClick={this.openErrorTextDialog}>{t("report_an_error")}</Menu.Item>
            </Menu>

            <div className="scrollwrapper">
              <Menu widths={widths} attached="top" inverted style={{ position: "relative", zIndex: 105 }}>
                {this.renderTabs()}
                {this.tabs.length && this.tabs.length > 11 && (
                  <div className={activeIndex > 11 ? "active item" : "item"} style={{ backgroundColor: warn.color }}>
                    <Dropdown style={{ textAlign: "center" }} icon="ellipsis horizontal" fluid scrolling>
                      <Dropdown.Menu direction="left">{this.renderMenuItems()}</Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}
              </Menu>
              <Segment attached="bottom" style={{ backgroundColor: warn.color, textAlign: "center" }}>
                <Statistic inverted size="small">
                  <Statistic.Label>{interaction}</Statistic.Label>
                  <Statistic.Value text>{trust}</Statistic.Value>
                </Statistic>
              </Segment>

              <WarningTab tab={this.tabs[activeIndex]} />
            </div>

            <Modal
              onClose={() => this.setState({ errorTextDialog: false })}
              onOpen={() => this.setState({ errorTextDialog: true, errorText: "" })}
              open={this.state.errorTextDialog}
            >
              <Modal.Header>{t("notify_about_error")}</Modal.Header>
              <Modal.Content>
                <Form>
                  <TextArea
                    autoFocus
                    rows={4}
                    name="drugs"
                    value={this.state.errorText}
                    placeholder={t("enter_message_text")}
                    onChange={(e) => this.setState({ errorText: e.target.value })}
                  />
                </Form>
              </Modal.Content>
              <Modal.Actions style={{ display: "flex", justifyContent: "space-between" }}>
                <Button color="red" onClick={() => this.setState({ errorTextDialog: false, errorText: "" })}>
                {t("cancel")}
                </Button>
                <Button color="blue" onClick={this.sendErrorText} disabled={this.state.errorText.length == 0}>
                {t("to_report")}
                </Button>
              </Modal.Actions>
            </Modal>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Warning);
