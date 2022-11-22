import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import Slider from "react-slick";

import Page from "../Checker/Page";
import Clinrec from "../Clinrec";

import { Icon, Step, Responsive, Header } from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import "./Stepper.css";

const Stepper = inject(
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
    class Stepper extends Component {
      constructor(props) {
        super(props);
        this.state = {
          activeIndex: "0",
          viewType: "pc",
        };
        this.sliderRef = createRef();
      }

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

        if (values.step === "result" && prevState.activeIndex > _.keys(checker).length) return;

        if (values.step === "result") {
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
        let {
          router: { values }, // Не трогать. Без получения values перестанут работать клинреки
          clinrecs: { checker },
          actions: { clinrecCheckerStep }, // , clinrecCheckerData
          patients: {
            current: { disease },
          },
        } = this.props;
        const { t } = this.props.actions;
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
          disease.length === 1
            ? `${t("clinical_recommendations_for_diagnosis")} "${disease[0].name}"`
            : t("clinical_recommendations");
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
            <Responsive
              className="h100 with-steps no-padding"
              fireOnMount
              columns="equal"
              onUpdate={this.handleOnUpdate}
            >
              <Slider ref={this.sliderRef} {...settings}>
                {_.keys(checker).map((id, i) => {
                  // console.log({id, page});
                  return <Page id={id} key={"page" + id} />;
                })}
                <div className="scrollwrapper">
                  <Clinrec />
                </div>
              </Slider>
            </Responsive>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Stepper);
