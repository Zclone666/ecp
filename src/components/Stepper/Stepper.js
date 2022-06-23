import React, { Component, createRef } from "react";
import { inject, observer } from "mobx-react";

import Slider from "react-slick";
import RouterLink from "../../router/a";

import WayChoice from "./WayChoice";
import LF from "./LF";
import DozeTypes from "./DozeTypes";
import Methods from "./Methods";
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
        this.props.actions.stepsData.way = values.way;
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
        let way = values.way || "";
        if (isLiquid) way = "liquid";
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
        // console.log({ way });
        return (
          <Responsive className="h100 with-steps" fireOnMount columns="equal" onUpdate={this.handleOnUpdate}>
            {current.key && <Steps viewType={viewType} />}
            <Slider ref={this.sliderRef} {...settings}>
              {
                {
                  "": <WayChoice />,
                  lf: <WayChoice />,
                  methods: <WayChoice />,
                  liquid: <div className="scrollwrapper"></div>,
                }[way]
              }
              <div className="scrollwrapper">
                {
                  {
                    lf: <LF />,
                    liquid: current.key ? <LF /> : <div />,
                    methods: <Methods />,
                    "": <LF />,
                  }[way]
                }
              </div>
              <div className="scrollwrapper">
                {
                  {
                    lf: <DozeTypes />,
                    liquid: current.key ? <DozeTypes /> : <div />,
                    methods: <LF />,
                    "": <DozeTypes />,
                  }[way]
                }
              </div>
              <div className="scrollwrapper">
                {
                  {
                    lf: <Methods />,
                    liquid: current.key ? <Methods /> : <div />,
                    methods: <DozeTypes />,
                    "": <Methods />,
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
