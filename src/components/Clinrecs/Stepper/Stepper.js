import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import Slider from "react-slick";
import RouterLink from "../../../router/a";

import Binary from "../Checker/Binary";
import Value from "../Checker/Value";
import Clinrec from "../Clinrec";

import { Transition, Accordion, Icon, Step, Responsive, List, Header } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import "./Stepper.css";

const Stepper = inject("db", "actions", "router", "drugs", "warnings", "dosages", "clinrecs", "patients")(observer(class Stepper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: "0",
      viewType: "pc",
    };
    this.sliderRef = createRef();
  }

  onChange = ({ name, value }) => {
    let {
      router: { values },
      clinrecs: { checker },
      actions: { clinrecCheckerStep, clinrecCheckerData },
    } = this.props;
    let currPage = checker[_.keys(checker)[clinrecCheckerStep - 1]] || {};

    this.props.actions.clinrecCheckerData[name].value = value;
    let isReady = true;
    currPage.arr.map((item) => {
      if (clinrecCheckerData[item.id].value === null) isReady = false;
    });
    currPage.isReady = isReady;
    console.log({ name, value, isReady });
  };

  handleClick = (e, titleProps) => {
    e.preventDefault();
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
    return false;
  };
  next = () => {
    this.sliderRef.slickNext();
  };
  previous = () => {
    this.sliderRef.slickPrev();
  };
  goTo = (x) => {
    this.sliderRef.current.slickGoTo(x);
  };
  componentDidUpdate(prevProps, prevState) {
    let {
      clinrecs: { checker },
      router: { values },
    } = this.props;

    if (values.step == "result" && prevState.activeIndex > _.keys(checker).length) return;

    if (values.step == "result") {
      this.setState({ activeIndex: _.keys(checker).length + 1 }, () => {
        this.props.actions.clinrecCheckerStep = this.state.activeIndex;
        this.goTo(parseInt(this.state.activeIndex - 1 || 0));
      });
      return;
    }

    let step = parseInt(values.step);
    if (step !== prevState.activeIndex) {
      this.setState({ activeIndex: step }, () => {
        this.props.actions.clinrecCheckerStep = this.state.activeIndex;
        this.goTo(parseInt(this.state.activeIndex - 1 || 0));
        // this.props.dosages.setStepDosage()
      });
    }
  }
  handleOnUpdate = (event, data) => {
    // console.log({event, data});
    if (data.width > 479) {
      this.setState({ viewType: "pc" });
    } else {
      this.setState({ viewType: "mobile" });
    }
  };
  render() {
    let { activeIndex, viewType } = this.state;
    let {
      router: { values },
      clinrecs: { checker },
      actions: { clinrecCheckerStep, clinrecCheckerData },
      patients: {
        current: { disease },
      },t
    } = this.props;

    let currPage = checker[_.keys(checker)[clinrecCheckerStep - 1]] || {}; //page id is not equal array index!

    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: false,
      swipe: false,
      initialSlide: clinrecCheckerStep - 1,
    };

    const headerMessage =
      disease.length === 1 ? `${t("clinical_recommendations_for_diagnosis")} "${disease[0].name}"` : t("clinical_recommendations");
    // console.log({checker, clinrecCheckerStep});
    return (
      <>
        <Step.Group attached="top" className="noborder fluid" style={{ backgroundColor: "#f0f0f0" }}>
          <Header as="h2" className="clinRecHeader" style={{ padding: "0.8em" }}>
            <Icon name="clipboard list" />
            <Header.Content className="clinRecHeaderContent">
              {headerMessage}
              <Header.Subheader>
                {clinrecCheckerStep <= _.keys(checker).length && `${clinrecCheckerStep}/${_.keys(checker).length}`}
                {clinrecCheckerStep > _.keys(checker).length && t("result")}{" "}
                {clinrecCheckerStep <= _.keys(checker).length && currPage.name}
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Step.Group>
        <Responsive className="h100 with-steps no-padding" fireOnMount columns="equal" onUpdate={this.handleOnUpdate}>
          <Slider ref={this.sliderRef} {...settings}>
            {_.keys(checker).map((id, i) => {
              let page = checker[id];
              // console.log({id, page});
              return (
                <div className="scrollwrapper" key={"page" + i}>
                  <List selection divided className="dozelist big">
                    {page.arr.map((item, x) => {
                      return {
                        Binary: (
                          <Binary
                            name={item.id}
                            onChange={this.onChange}
                            title={item.name}
                            value={clinrecCheckerData[item.id].value}
                          />
                        ),
                        Value: (
                          <Value
                            unit={item.unit}
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
            })}
            <div className="scrollwrapper">
              <Clinrec />
            </div>
          </Slider>
        </Responsive>
      </>
    );
  }
}));

export default withTranslation()(Stepper);
