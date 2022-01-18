import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import Slider from "react-slick";

import PatientForm from "./PatientForm";
import PatientPassport from "./PatientPassport";
import PatientsList from "./PatientsList";

import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid,
  Popup,
} from "semantic-ui-react";
import { withTranslation } from "react-i18next";
import _ from "lodash";

const Patient = inject(
  "router",
  "db",
  "actions",
  "patients",
  "clinrecs"
)(
  observer(
    class Patient extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,

          step: null,

          isLoading: false,
          searchQuery: "",
          pending: false,
        };
        this.sliderRef = createRef();
      }
      newPatient = () => {
        this.saveForm(true);
        this.props.router.push("/patient/passport");
      };
      nextStep = () => {
        let { step } = this.state;
        this.sliderRef.current.slickGoTo(step + 1);
        this.setState({ step: step + 1 });
      };
      prevStep = () => {
        let { step } = this.state;
        this.sliderRef.current.slickGoTo(step - 1);
        this.setState({ step: step - 1 });
      };
      goTo = (x) => {
        this.sliderRef.current.slickGoTo(x);
        this.setState({ step: x });
      };

      savePatient = async () => {
        if (this.state.pending) return;
        this.setState({ pending: true });
        let res = await this.props.patients.save();
        this.setState({ pending: false });
        if (res && res.alerts && res.alerts.length && res.alerts[0].code === "200") {
          this.props.router.push("/");
        }
      };
      clearPatient = () => {
        this.props.patients.unsetCurrent();
        this.props.actions.resetAll();
      };
      saveForm = (noClose) => {
        this.props.clinrecs.resetClinrecs();
        let shownPage = (this.props.router.values && this.props.router.values.page) || "none";
        const {
          id,
          email,
          fio,
          miscode,
          misid,
          name,
          birthdate,
          sex,
          growth,
          weight,
          disease,
          co_disease,
          lab_data,
          pregnancy,
          gestation,
          trimester,
          lactation,
          driving,
          alcohol,
          allergy,
          mutations,
        } = this.props.patients.current;
        if (shownPage === "info") {
          Object.assign(this.props.actions.drugStructure.patient, {
            id,
            email,
            fio,
            miscode,
            misid,
            name,
            birthdate,
            sex,
            growth,
            weight,
            disease,
            co_disease,
            lab_data,
            pregnancy,
            gestation,
            trimester,
            lactation,
            driving,
            alcohol,
            allergy,
            mutations,
          });
          this.props.actions.patientForm.birthdate = birthdate;
        }
        this.props.db.clearData(false, true);
        if (!noClose) this.props.router.push("/");
        // this.props.db.GetDuration()
      };

      back = () => {
        this.props.router.push("/");
      };
      componentDidUpdate(prevProps, prevState) {
        let {
          router: { values },
        } = this.props;
        // console.log({ next: values.step, prev: this.state.activeIndex });

        let step = null;
        switch (values.page) {
          case "list":
            step = 0;
            break;
          case "info":
            step = 1;
            break;
          case "new":
            step = 1;
            // this.clearPatient();
            break;
          case "passport":
            step = 2;
            break;
          default:
        }
        if (step !== this.state.step) {
          this.goTo(step);
        }
      }
      render() {
        const { t } = this.props.actions;
        let shownPage = (this.props.router.values && this.props.router.values.page) || "none";
        let section = (this.props.router && this.props.router.match && this.props.router.match.name) || "none";
        let { step } = this.state;
        const { firstname, lastname } = this.props.actions.patientPassport;
        switch (shownPage) {
          case "list":
            step = 0;
            break;
          case "info":
            step = 1;
            break;
          case "new":
            step = 1;
            break;
          case "passport":
            step = 2;
            break;
          default:
        }
        const settings = {
          dots: false,
          infinite: false,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          swipeToSlide: false,
          swipe: false,
          initialSlide: step,
        };
        return (
          <div className="h100">
            {step === 0 && (
              <Menu className="bottom fixed menu two item huge main">
                <Menu.Item color="red" onClick={this.back}>
                {t("back")}
                </Menu.Item>
                <Menu.Item as={RouterLink} to="/patient/new" onClick={() => this.clearPatient()}>
                {t("new")}
                </Menu.Item>
              </Menu>
            )}
            {step === 1 && (
              <Menu className="bottom fixed menu three item huge main">
                <Menu.Item color="red" onClick={this.back}>
                {t("back")}
                </Menu.Item>
                <Menu.Item onClick={() => this.saveForm(false)}>{t("apply")}</Menu.Item>
                {/* <Menu.Item onClick={this.newPatient}>Сохранить</Menu.Item> */}
                <Popup
                  disabled={!(!firstname || !lastname)}
                  position="top center"
                  content={t("fill_passport_details")}
                  trigger={
                    <Menu.Item
                      onClick={this.savePatient}
                      isLoading={this.state.pending}
                      disabled={!firstname || !lastname}
                    >
                      {t("save")}
                    </Menu.Item>
                  }
                />
              </Menu>
            )}
            {step === 2 && (
              <Menu className="bottom fixed menu two item huge main">
                <Menu.Item color="red" onClick={this.back}>
                {t("main_parser_cancel")}
                </Menu.Item>
                <Menu.Item isLoading={this.state.pending} onClick={this.savePatient} disabled={!firstname || !lastname}>
                {t("save")}
                </Menu.Item>
              </Menu>
            )}

            <Slider ref={this.sliderRef} {...settings}>
              <div className="scrollwrapper bottomMenu">
                <PatientsList />
              </div>
              <div className="scrollwrapper bottomMenu">
                <PatientForm />
              </div>
              <div className="scrollwrapper bottomMenu">
                <PatientPassport />
              </div>
            </Slider>
          </div>
        );
      }
    }
  )
);

export default withTranslation()(Patient);
