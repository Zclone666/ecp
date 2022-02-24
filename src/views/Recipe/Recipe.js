import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import Slider from "react-slick";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";

import Drugs from "../../components/Drugs";

import { CREATE_API_URL } from "../../lib/connect";

import PatientPassport from "../Patient/PatientPassport";

import Calendar from "../../components/BirthDate/Calendar";
import { withTranslation } from "react-i18next";
import moment from "moment";
import _ from "lodash";

import MaskedInput from "react-text-mask";

import { getUserCertificates, Certificate, createDetachedSignature, createHash } from "crypto-pro";

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic,
  Input,
  Modal,
  Segment,
  Form,
  Dropdown,
  Header,
  TextArea,
  // Message,
  // List,
  // Feed,
  Button,
  // Responsive,
  Grid,
  Checkbox,
} from "semantic-ui-react";
import FormChecker from "../Patient/Protocol/FormChecker";

const Recipe = inject(
  "router",
  "db",
  "actions",
  "recipes",
  "patients"
)(
  observer(
    class Recipe extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,
          openCode: false,
          code: null,
          spectextPrompt: null,
          certificates: [],
          selectedCertificate: null,
          certificateSelectionDialog: false,
          wasSigned: false,
          signedData: null,
          savePending: false,
          printType: null,
        };
        this.sliderRef = createRef();
      }
      componentWillUnmount() {
        this.resetSign();
      }
      setOpen = (open) => {
        open = open || false;
        this.setState({ open });
      };
      setOpenCode = (openCode) => {
        openCode = openCode || false;
        this.setState({ openCode }, () => {
          if (!openCode) this.props.router.push("/");
        });
      };

      next = () => {
        this.sliderRef.current.slickNext();
      };
      previous = () => {
        this.sliderRef.current.slickPrev();
      };
      goTo = (x) => {
        this.sliderRef.current.slickGoTo(x);
      };

      save = async () => {
        this.setState({ savePending: true });
        let code = await this.props.recipes.save();

        this.setState({ savePending: false });

        if (!code) return;
        this.setState({ code });
        this.setOpenCode(true);
        // this.props.router.push('/')
      };
      print = async () => {
        let code = await this.props.recipes.print();

        if (!code) return;

        document.getElementById("ifmcontentstoprint").style.display = "contents";
        var pri = document.getElementById("ifmcontentstoprint").contentWindow;
        pri.document.open();
        await pri.document.write(code);
        pri.document.close();
        pri.focus();
        pri.print();
        // this.setState({ code })
        // this.setOpenCode(true)
        // this.props.router.push('/')
      };

      mail = async () => {
        let code = await this.props.recipes.email();
      };

      back = () => {
        this.props.router.push("/");
        this.props.recipes.code = null;
      };

      setPrintType = (printType, id) => {
        if (printType === "list") {
          // recipe_formid = id;
          this.props.recipes["recipe_formid"] = id;
        }
        this.setState({ printType });
        // if (printType !== 'protocol') {
        this.next();
        // }

      };
      savePatient = async () => {
        let res = await this.props.patients.save();

        if (res) {
          this.setOpen(false);
          this.handleChange(null, { name: "patient", value: res.key });
        }
      };
      // handleAddition = async (e, { name, value }) => {
      //   let key = moment().format('x').toString()
      //   await this.props.patients.patient.set(key, {key, name: value, id: null})
      //   this.handleChange(null, { name: 'patient', value: key })
      // }handlePatientDataChange

      handleChange = async (e, { name, value }) => {
        this.resetSign();
     
        if (!name && !value) {
          let { name, value } = e.target;
        }
        let { checkData } = this.props.actions;

        this.props.recipes[name] = value;
      };

      handleRecipeDataChange = (e, { name, value }) => {

        const { t } = this.props.actions;
        this.resetSign();
        if (!name && !value) {
          let { name, value } = e.target;
        }
        let { checkData } = this.props.actions;
        if (name == "recipe_formid") {
          this.props.recipes["maxcount"] = this.props.actions.recipeData.items[value].maxcount;
          this.props.recipes["drugKeysForPrescription"] = [];
          this.props.recipes["formType"] = this.props.actions.recipeData.items[value].type;
        }
        if (name == "spectextPrompt") {
          this.setState({ spectextPrompt: value });
          if (value == 1) {
            this.props.recipes["spectext"] = t("weekly");
          }
          if (value == 2) {
            this.props.recipes["spectext"] = t("monthly");
          }
          if (value == 3) {
            this.props.recipes["spectext"] = "";
          }
          return;
        }
        if (name == "recipe_endtimeitem" && value.value > 60) {
          this.props.recipes["special"] = true;
        }
        if (name == "cito") {
          this.props.recipes["cito"] = !this.props.recipes["cito"];
          if (this.props.recipes["cito"] == true) this.props.recipes["statim"] = false;
          return;
        }
        if (name == "statim") {
          this.props.recipes["statim"] = !this.props.recipes["statim"];
          if (this.props.recipes["statim"] == true) this.props.recipes["cito"] = false;
          return;
        }
        if (name == "special") {
          this.props.recipes["special"] = !this.props.recipes["special"];
          return;
        }
        this.props.recipes[name] = value;
      };

      handlePatientDataChange = (e, { name, value }) => {
        this.resetSign();
        if (!name && !value) {
          let { name, value } = e.target;
        }
        if (name == "medcard_num") {
          this.props.patients.current["medcard_num"] = { default: value };
          return;
        }
        if (name === "birthdate") {
          const date = moment(value).format("x");
          this.props.patients.current["birthdate"] = date;
          return;
        }
        this.props.patients.current[name] = value;
      };
      handleMaskedInputPatientDataChange = (e) => {
        this.resetSign();
        const { value, name } = e.target;
        this.props.patients.current[name] = value;
      };

      initiateSigningProcess = async () => {
        const availableCertificates = await getUserCertificates()
          .then((certs) => certs)
          .catch((e) => {
      
            return [];
          })
          .then((certs) => Promise.all(certs.map(async (c) => ({ cert: c, valid: await c.isValid() }))));
        const validCertificates = availableCertificates.filter((c) => c.valid).map((c) => c.cert);
        this.setState({ certificates: validCertificates, certificateSelectionDialog: true });
      };

      sign = async () => {
        const data = this.props.recipes.getDataToSign();
        const stringifiedData = JSON.stringify(data);
        const cert = this.state.selectedCertificate;
        const { t } = this.props.actions;

        const certBase64 = await cert.exportBase64();
        await createHash(stringifiedData).then((hashedDataToSign) =>
          createDetachedSignature(this.state.selectedCertificate.thumbprint, hashedDataToSign).then((result) => {
            this.setState({ signedData: result });
          
            this.props.recipes.stringifiedSignData = stringifiedData;
            this.props.recipes.digitallySignedRecipe = result.replaceAll("\r\n", "");
            this.props.recipes.certificateBase64 = certBase64.replaceAll("\r\n", "");
            this.props.recipes.cert_owner = cert.name;
            this.props.recipes.cert_code = cert.thumbprint;
            this.props.recipes.validity_start_date = cert.validFrom;
            this.props.recipes.validity_end_date = cert.validTo;
          })
        );

        this.setState({
          selectedCertificate: null,
          certificates: [],
          certificateSelectionDialog: false,
          wasSigned: true,
        });

        this.props.actions.makeAlerts({
          alerts: [
            {
              title: t("recipe_successfully_signed_digital_signature"),
              message: "",
              level: "success",
              sticky: false,
            },
          ],
        });
      };

      resetSign = () => {
        this.setState({
          wasSigned: false,
        });

        this.props.recipes.digitallySignedRecipe = null;
        this.props.recipes.certificateBase64 = null;
        this.props.recipes.cert_owner = null;
        this.props.recipes.cert_code = null;
        this.props.recipes.validity_start_date = null;
        this.props.recipes.validity_end_date = null;
      };

      render() {
        let { open, openCode, printType } = this.state;
        let {
          actions: {
            drugStructure: { doctor_id: doctor, clinic_id: clinic, doctor_name: docName },
            doctor: doc,
            checkData,
            recipeData,
          },
          recipes: {
            code,
            recipe_endtime,
            recipe_text,
            recipe_formid,
            recipe_endtimeitem,
            mkb10code,
            recipeDiseaseId,
            citizenCategory,
            financingSource,
            compensation,
            insuranceNumber,
            patientCard,
            cito,
            statim,
            special,
            spectext,
          },
          patients: { current: patient },
        } = this.props;
        const { t } = this.props.actions;
        const {
          id,
          // name,
          email,
          // miscode,
          // misid,
          fio,
          lastname,
          patronymic,
          firstname,
          snils,
          policy_num,
          medcard_num,
          main_address,
        } = patient;
        const diseases = [
          ...patient.co_disease,
          ...patient.disease,
          { name: t("manual_input_code"), id: t("manual_input_code") },
        ];
        doctor = doctor || doc.name;

        let noEmail = false;

        const tags = recipe_formid ? recipeData.items[recipe_formid].tags : [];
 
        const settings = {
          dots: false,
          infinite: false,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          swipeToSlide: false,
          swipe: false,
          initialSlide: 0,
        };

        return (
          <>
            {!!printType ? (
              <Menu className="bottom fixed menu four item huge main">
                <Menu.Item color="red" onClick={this.back}>
                  {t("back")}
                </Menu.Item>
                {/* {!code && ( */}
                <Menu.Item disabled={noEmail || !recipe_formid || this.state.savePending} onClick={this.save}>
                  {t("send")}
                </Menu.Item>
                {/* )} */}
                {/* {code && ( */}
                <Menu.Item disabled={noEmail || !code} onClick={this.print}>
                  {t("print")}
                </Menu.Item>
                <Menu.Item
                  disabled={noEmail || !recipe_formid || this.state.wasSigned}
                  onClick={this.initiateSigningProcess}
                >
                  <span>{this.state.wasSigned ? t("signed") : t("subscribe")}</span>
                </Menu.Item>
                {/* )} */}
              </Menu>
            ) : (
              <Menu className="bottom fixed menu four item huge main">
                <Menu.Item color="red" onClick={this.back}>
                  {t("main_parser_cancel")}
                </Menu.Item>
              </Menu>
            )}
            <Slider ref={this.sliderRef} {...settings}>
              <div className="scrollwrapper">
                <Grid as={Segment} basic verticalAlign="middle" stackable textAlign="center">
                  <Grid.Column width={16}>
                    <Header>{t("choose_form")}</Header>
                  </Grid.Column>
                  {Object.entries(recipeData.items).filter(([id, value]) => value.type === "list").map(([id, value]) => {

                    return <Grid.Column width={8}>
                      <Button onClick={() => this.setPrintType("list", id)} size="big" color="blue" fluid>
                        {value.name}
                        {/* {t("outpatient_appointment_list")} */}
                      </Button>{" "}
                    </Grid.Column>;

                  })}

                  {/* <Grid.Column width={8}>
                    <Button onClick={() => this.setPrintType("ambulance_list")} size="big" color="blue" fluid>
                      {t("outpatient_appointment_list")}
                    </Button>{" "}
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <Button onClick={() => this.setPrintType("station_list")} size="big" color="blue" fluid>
                      {t("stationary_appointment_list")}
                    </Button>{" "}
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <Button onClick={() => this.setPrintType("reanim_list")} size="big" color="blue" fluid>
                      {t("resuscitation_appointment_list")}
                    </Button>{" "}
                  </Grid.Column> */}

                  <Grid.Column width={8}>
                    <Button onClick={() => this.setPrintType("recipe")} size="big" color="purple" fluid>
                      {t("writing_recipe")}
                    </Button>{" "}
                  </Grid.Column>

                  <Grid.Column width={8}>
                    <Button onClick={() => this.setPrintType("protocol")} size="big" color="orange" fluid>
                      {t("council_minutes")}
                    </Button>{" "}
                  </Grid.Column>
                </Grid>
              </div>
              <div className="scrollwrapper">
                <Segment basic>
                  {printType === "protocol" ? (
                    <FormChecker patient={this.props.patients.current} />
                  ) : (
                    <Form>
                        {printType !== "list" ? <Form.Field>
                        <label>{t("recipe_form")}</label>
                        <Dropdown
                          size="big"
                            options={Object.entries(recipeData.items).filter(([id, value]) => value.type !== "list").map(([id, value]) => {
                            return {
                              key: id,
                              text: value.name,
                              value: id,
                            };
                          })}
                          placeholder={t("choose")}
                          name="recipe_formid"
                          selection
                          fluid
                          value={recipe_formid}
                          onChange={this.handleRecipeDataChange}
                        />
                        </Form.Field> : null}
                      {recipe_formid && (
                        <Form.Field>
                          <label>{t("recipe_state_time")}</label>
                          <Dropdown
                            size="big"
                            options={
                              !recipe_formid
                                ? []
                                : recipeData.items[recipe_formid].durations.map((item) => {
                                    return {
                                      key: item.id,
                                      text: item.name,
                                      value: item,
                                    };
                                  })
                            }
                            placeholder={t("choose")}
                            name="recipe_endtimeitem"
                            selection
                            fluid
                            value={recipe_endtimeitem}
                            onChange={this.handleRecipeDataChange}
                          />
                        </Form.Field>
                      )}
                      <Form.Group>
                        {tags.includes("PatientFIO") && (
                          <Form.Field width={12}>
                            <label>{t("name_patient")}</label>
                            <Input name="fio" value={patient.fio} readOnly />
                          </Form.Field>
                        )}
                        {tags.includes("DayOfBirth") && tags.includes("MonthOfBirth") && tags.includes("YearOfBirth") && (
                          <Form.Field width={4}>
                            <label>{t("date_birth")}</label>
                            <Calendar
                              name="birthdate"
                              value={moment(patient.birthdate).format("x")}
                              maxDate={new Date()}
                              onChange={this.handlePatientDataChange}
                              size="medium"
                            />
                            {/* <Input name="birthdate" value={moment(patient.birthdate).format("DD.MM.YYYY")} readOnly /> */}
                          </Form.Field>
                        )}
                      </Form.Group>
                      {tags.includes("DoctorFIO") && (
                        <Form.Field>
                          <label>{t("name_doctor")}</label>
                          <Input name="docName" value={docName} readOnly />
                        </Form.Field>
                      )}
                      {tags.includes("CategoryCode") && (
                        <Form.Field>
                          <label>{t("code_category_code")}</label>
                          <Input name="citizenCategory" value={citizenCategory} onChange={this.handleChange} />
                        </Form.Field>
                      )}
                      {tags.includes("CodeMKB10") && (
                        <Form.Group>
                          <Form.Field width={10}>
                            <label>{t("choose_determine_nosological_form_code")}</label>
                            <Dropdown
                              size="big"
                              options={diseases.map((x) => ({ key: x.id, text: x.name, value: x.id }))}
                              placeholder={t("choose")}
                              name="recipeDiseaseId"
                              selection
                              fluid
                              value={recipeDiseaseId}
                              onChange={this.handleChange}
                            />
                          </Form.Field>
                          <Form.Field width={6}>
                            <label>{t("nonological_form_code")}</label>
                            <Input
                              name="mkb10code"
                              value={mkb10code}
                              onChange={this.handleChange}
                              readOnly={recipeDiseaseId != t("manual_input_code")}
                            />
                          </Form.Field>
                        </Form.Group>
                      )}
                      {tags.includes("SourceOfFinancing") && (
                        <Form.Field>
                          <label>{t("source_financing")}</label>
                          <Dropdown
                            size="big"
                            options={[
                              t("federal_budget"),
                              t("budget_subject_russian_federation"),
                              t("municipal_budget"),
                            ].map((x) => ({ key: x, text: x, value: x }))}
                            placeholder={t("choose")}
                            name="financingSource"
                            selection
                            fluid
                            value={financingSource}
                            onChange={this.handleChange}
                          />
                        </Form.Field>
                      )}
                      {tags.includes("PercentageOfPayment") && (
                        <Form.Field>
                          <label>{t("percent_payment")}</label>
                          <Dropdown
                            size="big"
                            options={["50%", "100%"].map((x) => ({ key: x, text: x, value: x }))}
                            placeholder={t("choose")}
                            name="compensation"
                            selection
                            fluid
                            value={compensation}
                            onChange={this.handleChange}
                          />
                        </Form.Field>
                      )}
                      {tags.includes("SNILS") && (
                        <Form.Field>
                          <label>{t("SNILS")}</label>
                          <Input
                            size="big"
                            children={
                              <MaskedInput
                                name="snils"
                                value={snils || ""}
                                onChange={this.handleMaskedInputPatientDataChange}
                                mask={[/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, " ", /\d/, /\d/]}
                                placeholder="000-000-000 00"
                              />
                            }
                          />
                        </Form.Field>
                      )}
                      {tags.includes("MedCardNumber") && (
                        <Form.Field>
                          <label>{t("patient_medical_map_number")}</label>
                          <Input
                            size="big"
                            name="medcard_num"
                            value={medcard_num?.default || ""}
                            placeholder=""
                            onChange={this.handlePatientDataChange}
                          />
                        </Form.Field>
                      )}
                      {tags.includes("AdressOrMedCardNumber") && (
                        <Form.Field>
                          <label>{t("residence_address")}</label>
                          <Input
                            size="big"
                            name="main_address"
                            value={main_address || ""}
                            placeholder=""
                            onChange={this.handlePatientDataChange}
                          />
                        </Form.Field>
                      )}
                      {tags.includes("PolicyNumber") && (
                        <Form.Field>
                          <label>{t("polis_oms")}</label>
                          <Input
                            size="big"
                            children={
                              <MaskedInput
                                name="policy_num"
                                value={policy_num || ""}
                                onChange={this.handleMaskedInputPatientDataChange}
                                mask={[
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  " ",
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  " ",
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  " ",
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                  /\d/,
                                ]}
                                placeholder="0000 0000 0000 0000"
                              />
                            }
                          />
                        </Form.Field>
                      )}
                      {tags.includes("Cito") && (
                        <Form.Field align="left">
                          <Checkbox name="cito" checked={cito} label="Cito" onChange={this.handleRecipeDataChange} />
                        </Form.Field>
                      )}
                      {tags.includes("Statim") && (
                        <Form.Field align="left">
                          <Checkbox
                            name="statim"
                            checked={statim}
                            label="Statim"
                            onChange={this.handleRecipeDataChange}
                          />
                        </Form.Field>
                      )}
                      {tags.includes("SpecNaz") && (
                        <Form.Field align="left">
                          <Checkbox
                            name="special"
                            checked={special}
                            label={t("according_special_purpose")}
                            onChange={this.handleRecipeDataChange}
                          />
                        </Form.Field>
                      )}
                      {tags.includes("SpecNazTime") && special && (
                        <Form.Group>
                          <Form.Field width={6}>
                            <label>{t("choose_vacation_frequency")}</label>
                            <Dropdown
                              size="big"
                              options={[
                                { key: 1, text: t("daily"), value: 1 },
                                { key: 2, text: t("monthly"), value: 2 },
                                { key: 3, text: t("other_period"), value: 3 },
                              ]}
                              placeholder={t("choose")}
                              name="spectextPrompt"
                              selection
                              fluid
                              value={this.state.spectextPrompt}
                              onChange={this.handleRecipeDataChange}
                            />
                          </Form.Field>
                          {this.state.spectextPrompt == "3" && (
                            <Form.Field width={10}>
                              <label>{t("indicate_vacation_frequency")}</label>
                              <Input
                                name="spectext"
                                value={spectext || ""}
                                placeholder=""
                                onChange={this.handleRecipeDataChange}
                              />
                            </Form.Field>
                          )}
                        </Form.Group>
                      )}

                      {recipe_formid && (
                        <Form.Field>
                            <label>{t("comment_prescription")}</label> 
                            {/* сomment_leaf_destination */}
                          <TextArea
                            size="big"
                            placeholder={t("explanation_recipe")}
                            name="recipe_text"
                            fluid
                            value={recipe_text}
                            onChange={this.handleChange}
                          />
                        </Form.Field>
                      )}
                    </Form>
                  )}
                  {false && (
                    <Form>
                      <Form.Field>
                        <label>{t("doctor")}</label>
                        <Dropdown
                          options={checkData.doctor.map((item) => {
                            return {
                              key: item.id,
                              text: item.name,
                              value: item.id,
                            };
                          })}
                          placeholder={t("ivan") + " " + t("ivanov")}
                          search
                          name="doctor"
                          selection
                          fluid
                          value={doctor || ""}
                          onChange={this.handleChange}
                        />
                      </Form.Field>

                      <Form.Group>
                        <Form.Field width={16}>
                          <label>{t("patient")}</label>
                          <Dropdown
                            options={this.props.patients.arr.map((item) => {
                              return {
                                key: item.key,
                                text: item.name,
                                value: item.key,
                              };
                            })}
                            placeholder={t("ivan") + " " + t("ivanov")}
                            search={false}
                            name="patient"
                            selection
                            fluid
                            value={patient.key || ""}
                            onAddItem={this.handleAddition}
                            onChange={this.handleChange}
                          />
                        </Form.Field>
                        <Form.Field>
                          <label>&nbsp;</label>
                          <Modal
                            onClose={() => this.setOpen(false)}
                            onOpen={() => this.setOpen(true)}
                            open={open}
                            trigger={<Button>{t("add")}</Button>}
                          >
                            <Modal.Header>{t("create_patient")}</Modal.Header>
                            <Modal.Content>
                              <PatientPassport />
                            </Modal.Content>
                            <Modal.Actions>
                              <Button color="black" onClick={() => this.setOpen(false)}>
                                {t("main_parser_cancel")}
                              </Button>
                              <Button
                                content={t("create")}
                                labelPosition="right"
                                icon="checkmark"
                                onClick={() => this.savePatient()}
                                positive
                              />
                            </Modal.Actions>
                          </Modal>
                        </Form.Field>
                      </Form.Group>
                      <Form.Field error={patient.key && noEmail}>
                        <label>{t("mail_patient")}</label>
                        <Input
                          name="email"
                          value={patient.email}
                          onChange={this.handleChange}
                          placeholder="some@email.ru"
                        />
                      </Form.Field>
                      <Form.Field required>
                        <label>{t("health_care_facility")}</label>
                        <Dropdown
                          options={checkData.lpu.map((item) => {
                            return {
                              key: item.id,
                              text: item.name,
                              value: item.id,
                            };
                          })}
                          placeholder={t("clinic")}
                          search
                          name="clinic"
                          selection
                          fluid
                          value={clinic || ""}
                          onChange={this.handleChange}
                        />
                      </Form.Field>
                    </Form>
                  )}
                  {recipe_formid && <Drugs isRecipe={true} />}
                </Segment>
              </div>
            </Slider>

            <Modal onClose={() => this.setOpenCode(false)} onOpen={() => this.setOpenCode(true)} open={openCode}>
              <Modal.Header>{t("code_pharmacy")}</Modal.Header>
              <Modal.Content>
                <Header as="h1">{code}</Header>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  content={t("print_recipe")}
                  labelPosition="right"
                  primary
                  icon="file alternate outline"
                  onClick={() => this.print()}
                />
                <Button
                  content={t("send_by_mail")}
                  labelPosition="right"
                  primary
                  icon="mail"
                  onClick={() => this.mail()}
                  disabled={this.props.recipes.emailSent}
                />
                <Button
                  content="ОК"
                  labelPosition="right"
                  icon="checkmark"
                  onClick={() => this.setOpenCode(false)}
                  positive
                />
              </Modal.Actions>
            </Modal>
            <Modal
              onClose={() => this.setState({ certificateSelectionDialog: false })}
              onOpen={() => this.setState({ certificateSelectionDialog: true })}
              open={this.state.certificateSelectionDialog}
            >
              <Modal.Header>{t("select_certificate_for_signature")}</Modal.Header>
              <Modal.Content>
                <Form>
                  <Form.Field>
                    <label>{t("available_certificates")}</label>
                    <Dropdown
                      size="big"
                      options={this.state.certificates.map((cert) => {
                        return {
                          key: cert.thumbprint,
                          text: cert.name,
                          value: cert,
                        };
                      })}
                      placeholder=""
                      name="recipe_formid"
                      selection
                      fluid
                      value={this.state.selectedCertificate}
                      onChange={(e, { name, value }) => this.setState({ selectedCertificate: value })}
                    />
                  </Form.Field>
                </Form>
              </Modal.Content>
              <Modal.Actions style={{ display: "flex", justifyContent: "space-between" }}>
                <Button color="red" onClick={() => this.setState({ certificateSelectionDialog: false })}>
                  {t("main_parser_cancel")}
                </Button>
                <Button color="blue" onClick={this.sign} disabled={this.state.selectedCertificate == null}>
                  {t("subscribe")}
                </Button>
              </Modal.Actions>
            </Modal>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Recipe);
