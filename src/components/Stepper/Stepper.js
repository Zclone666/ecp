import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import Slider from "react-slick";
import RouterLink from "../../router/a";

import DozeTypes from "./DozeTypes";
import MethodsForms from "./MethodsForms";
import Calculator from "./Calculator";
import Steps from "./Steps";

import { Transition, Accordion, Icon, Step, Responsive } from "semantic-ui-react";

import _ from "lodash";

const Stepper = inject(
  "db",
  "actions",
  "router",
  "drugs",
  "warnings",
  "dosages"
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
        // console.log('go to ', x);
        // console.log('this.sliderRef', this.sliderRef);
        this.sliderRef.current.slickGoTo(x);
      };
      componentDidUpdate(prevProps, prevState) {
        let {
          router: { values },
        } = this.props;
        // console.log({ next: values.step, prev: this.state.activeIndex });
        // console.log('HEREEE');
        if (values.step !== prevState.activeIndex) {
          this.setState({ activeIndex: values.step }, () => {
            this.goTo(parseInt(this.state.activeIndex || 0));
            this.props.dosages.setStepDosage();
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
          drugs: { current }, //drugs, currDrug, setDosageParams
          // dosages: { dosage, calcValues }, //drugsDosages
          // warnings: { warning, groups }, //warnings, warnGroups
          router: { values },
          isLiquid,
        } = this.props;

        // let drugsDosage = dosage.get(current.key)
        // // console.log({ drugsDosage });
        // let { names, nameshort } = drugsDosage

        let currStep = parseInt(values.step || 0);
        let way = isLiquid ? "liquid" : "drug";

        // let selectedWarnings = warnings[selectedDrug]
        const settings = {
          dots: false,
          infinite: false,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          swipeToSlide: false,
          swipe: false,
          initialSlide: currStep,
        };
        return (
          <Responsive className="h100 with-steps" fireOnMount columns="equal" onUpdate={this.handleOnUpdate}>
            {current.key && <Steps viewType={viewType} />}
            <Slider ref={this.sliderRef} {...settings}>
              <div className="scrollwrapper">
                {
                  {
                    drug: <MethodsForms />,
                    liquid: <div className="scrollwrapper"></div>,
                  }[way]
                }
              </div>

              <div className="scrollwrapper">
                {
                  {
                    drug: <DozeTypes />,
                    liquid: current.key ? <DozeTypes /> : <div />,
                  }[way]
                }
              </div>
              <div className="scrollwrapper">{current.key && <Calculator />}</div>
            </Slider>
          </Responsive>
        );
      }
    }
  )
);

export default Stepper;
