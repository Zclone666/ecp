import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";

import Drugs from "../../components/Drugs";

import { CREATE_API_URL } from "../../lib/connect";

import PatientPassport from "../Patient/PatientPassport";

import Calendar from "../../components/BirthDate/Calendar";

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
  // Grid
  Checkbox,
} from "semantic-ui-react";

@inject("router", "db", "actions", "recipes", "patients")
@observer
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
    };
    //this.contextRef = createRef()
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
  save = async () => {
    let code = await this.props.recipes.save();
    // console.log({res});
    if (!code) return;
    this.setState({ code });
    this.setOpenCode(true);
    // this.props.router.push('/')
  };
  print = async () => {
    let code = await this.props.recipes.print();
    // console.log({res});
    if (!code) return;

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
  savePatient = async () => {
    let res = await this.props.patients.save();

    if (res) {
      this.setOpen(false);
      this.handleChange(null, { name: "patient", value: res.key });
    }
  };
  // handleAddition = async (e, { name, value }) => {
  //   // console.log({ name, value });
  //   let key = moment().format('x').toString()
  //   await this.props.patients.patient.set(key, {key, name: value, id: null})
  //   this.handleChange(null, { name: 'patient', value: key })
  // }handlePatientDataChange

  handleChange = async (e, { name, value }) => {
    this.resetSign();
    // if (name === "patient") console.log({ value });
    if (!name && !value) {
      let { name, value } = e.target;
    }
    let { checkData } = this.props.actions;

    this.props.recipes[name] = value;
  };

  handleRecipeDataChange = (e, { name, value }) => {
    // console.log({ name, value, e });
    this.resetSign();
    if (!name && !value) {
      let { name, value } = e.target;
    }
    let { checkData } = this.props.actions;
    if (name == "recipe_formid") {
      this.props.recipes["maxcount"] = this.props.actions.recipeData.items[value].maxcount;
      this.props.recipes["drugKeysForPrescription"] = [];
    }
    if (name == "spectextPrompt") {
      this.setState({ spectextPrompt: value });
      if (value == 1) {
        this.props.recipes["spectext"] = "еженедельно";
      }
      if (value == 2) {
        this.props.recipes["spectext"] = "ежемесячно";
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
        // console.log({ e });
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
    // console.log({ cert, data });
    const certBase64 = await cert.exportBase64();
    await createHash(stringifiedData).then((hashedDataToSign) =>
      createDetachedSignature(this.state.selectedCertificate.thumbprint, hashedDataToSign).then((result) => {
        this.setState({ signedData: result });
        this.props.recipes.digitallySignedRecipe = result;
        this.props.recipes.certificateBase64 = certBase64;
      })
    );

    this.setState({ selectedCertificate: null, certificates: [], certificateSelectionDialog: false, wasSigned: true });

    this.props.actions.makeAlerts({
      alerts: [
        {
          title: `Рецепт был успешно подписан цифровой подписью.`,
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
  };

  render() {
    let { open, openCode } = this.state;
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
    const diseases = [...patient.co_disease, ...patient.disease, { name: "ручной ввод кода", id: "ручной ввод кода" }];
    doctor = doctor || doc.name;

    let noEmail = false;
    // console.log({ doctor, clinic, patient });

    const tags = recipe_formid ? recipeData.items[recipe_formid].tags : [];
    // console.log({ tags });
    // console.log({ patient });
    // console.log({ recipe_endtimeitem });
    return (
      <>
        <Menu className="bottom fixed menu four item huge main">
          <Menu.Item color="red" onClick={this.back}>
            Назад
          </Menu.Item>
          {/* {!code && ( */}
          <Menu.Item disabled={noEmail || !recipe_formid} onClick={this.save}>
            Отправить
          </Menu.Item>
          {/* )} */}
          {/* {code && ( */}
          <Menu.Item disabled={noEmail || !code} onClick={this.print}>
            Печать
          </Menu.Item>
          <Menu.Item disabled={noEmail || !recipe_formid || this.state.wasSigned} onClick={this.initiateSigningProcess}>
            <span>{this.state.wasSigned ? "Подписано" : "Подписать"}</span>
          </Menu.Item>
          {/* )} */}
        </Menu>

        <div className="scrollwrapper">
          <Segment basic>
            <Form>
              <Form.Field>
                <label>Форма рецептурного бланка</label>
                <Dropdown
                  size="big"
                  options={Object.entries(recipeData.items).map(([id, value]) => {
                    return {
                      key: id,
                      text: value.name,
                      value: id,
                    };
                  })}
                  placeholder="Выберите"
                  name="recipe_formid"
                  selection
                  fluid
                  value={recipe_formid}
                  onChange={this.handleRecipeDataChange}
                />
              </Form.Field>
              {recipe_formid && (
                <Form.Field>
                  <label>Время действия рецепта</label>
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
                    placeholder="Выберите"
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
                    <label>ФИО пациента</label>
                    <Input name="fio" value={patient.fio} readOnly />
                  </Form.Field>
                )}
                {tags.includes("DayOfBirth") && tags.includes("MonthOfBirth") && tags.includes("YearOfBirth") && (
                  <Form.Field width={4}>
                    <label>Дата рождения</label>
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
                  <label>ФИО врача</label>
                  <Input name="docName" value={docName} readOnly />
                </Form.Field>
              )}
              {tags.includes("CategoryCode") && (
                <Form.Field>
                  <label>Код категории граждан</label>
                  <Input name="citizenCategory" value={citizenCategory} onChange={this.handleChange} />
                </Form.Field>
              )}
              {tags.includes("CodeMKB10") && (
                <Form.Group>
                  <Form.Field width={10}>
                    <label>Выберите заболевание для определения кода нозологической формы (по МКБ)</label>
                    <Dropdown
                      size="big"
                      options={diseases.map((x) => ({ key: x.id, text: x.name, value: x.id }))}
                      placeholder="Выберите"
                      name="recipeDiseaseId"
                      selection
                      fluid
                      value={recipeDiseaseId}
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field width={6}>
                    <label>Код нозологической формы (по МКБ)</label>
                    <Input
                      name="mkb10code"
                      value={mkb10code}
                      onChange={this.handleChange}
                      readOnly={recipeDiseaseId != "ручной ввод кода"}
                    />
                  </Form.Field>
                </Form.Group>
              )}
              {tags.includes("SourceOfFinancing") && (
                <Form.Field>
                  <label>Источник финансирования</label>
                  <Dropdown
                    size="big"
                    options={["Федеральный бюджет", "Бюджет субъекта Российской Федерации", "Муниципальный бюджет"].map(
                      (x) => ({ key: x, text: x, value: x })
                    )}
                    placeholder="Выберите"
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
                  <label>% Оплаты</label>
                  <Dropdown
                    size="big"
                    options={["50%", "100%"].map((x) => ({ key: x, text: x, value: x }))}
                    placeholder="Выберите"
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
                  <label>СНИЛС</label>
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
                  <label>Номер медицинской карты пациента</label>
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
                  <label>Адрес места жительства</label>
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
                  <label>Полис ОМС</label>
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
                  <Checkbox name="statim" checked={statim} label="Statim" onChange={this.handleRecipeDataChange} />
                </Form.Field>
              )}
              {tags.includes("SpecNaz") && (
                <Form.Field align="left">
                  <Checkbox
                    name="special"
                    checked={special}
                    label="По специальному назначению"
                    onChange={this.handleRecipeDataChange}
                  />
                </Form.Field>
              )}
              {tags.includes("SpecNazTime") && special && (
                <Form.Group>
                  <Form.Field width={6}>
                    <label>Выберите периодичность отпуска</label>
                    <Dropdown
                      size="big"
                      options={[
                        { key: 1, text: "ежедневно", value: 1 },
                        { key: 2, text: "ежемесячно", value: 2 },
                        { key: 3, text: "иной период", value: 3 },
                      ]}
                      placeholder="Выберите"
                      name="spectextPrompt"
                      selection
                      fluid
                      value={this.state.spectextPrompt}
                      onChange={this.handleRecipeDataChange}
                    />
                  </Form.Field>
                  {this.state.spectextPrompt == "3" && (
                    <Form.Field width={10}>
                      <label>Укажите другую периодичность отпуска</label>
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
              {/* {recipe_formid == "2ApW9Ve9l7XXlXy5/59EUg==" && (
                <div>
                  <Form.Field>
                    <label>Код категории граждан</label>
                    <Input name="citizenCategory" value={citizenCategory} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Group>
                    <Form.Field width={10}>
                      <label>Выберите заболевание для определения кода нозологической формы (по МКБ)</label>
                      <Dropdown
                        size="big"
                        options={diseases.map((x) => ({ key: x.id, text: x.name, value: x.id }))}
                        placeholder="Выберите"
                        name="recipeDiseaseId"
                        selection
                        fluid
                        value={recipeDiseaseId}
                        onChange={this.handleChange}
                      />
                    </Form.Field>
                    <Form.Field width={6}>
                      <label>Код нозологической формы (по МКБ)</label>
                      <Input
                        name="mkb10code"
                        value={mkb10code}
                        onChange={this.handleChange}
                        readOnly={recipeDiseaseId != "ручной ввод кода"}
                      />
                    </Form.Field>
                  </Form.Group>
                  <Form.Field>
                    <label>Источник финансирования</label>
                    <Dropdown
                      size="big"
                      options={[
                        "Федеральный бюджет",
                        "Бюджет субъекта Российской Федерации",
                        "Муниципальный бюджет",
                      ].map((x) => ({ key: x, text: x, value: x }))}
                      placeholder="Выберите"
                      name="financingSource"
                      selection
                      fluid
                      value={financingSource}
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>% Оплаты</label>
                    <Dropdown
                      size="big"
                      options={["50%", "100%"].map((x) => ({ key: x, text: x, value: x }))}
                      placeholder="Выберите"
                      name="compensation"
                      selection
                      fluid
                      value={compensation}
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Group>
                    <Form.Field width={12}>
                      <label>ФИО пациента</label>
                      <Input name="fio" value={patient.fio} readOnly />
                    </Form.Field>
                    <Form.Field width={4}>
                      <label>Дата рождения</label>
                      <Input name="birthdate" value={moment(patient.birthdate).format("DD.MM.YYYY")} readOnly />
                    </Form.Field>
                  </Form.Group>
                  <Form.Field>
                    <label>СНИЛС</label>
                    <Input name="snils" value={snils} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>№ полиса ОМС</label>
                    <Input name="insuranceNumber" value={insuranceNumber} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>
                      Номер медицинской карты пациента, получающего медицинскую помощь в амбулаторных условиях
                    </label>
                    <Input name="patientCard" value={patientCard} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>ФИО врача</label>
                    <Input name="docName" value={docName} readOnly />
                  </Form.Field>
                </div>
              )}
              {recipe_formid == "sqmNTYpmbqXh9bhNZBQpDQ==" && (
                <div>
                  <Form.Group>
                    <Form.Field width={12}>
                      <label>ФИО пациента</label>
                      <Input name="fio" value={patient.fio} readOnly />
                    </Form.Field>
                    <Form.Field width={4}>
                      <label>Дата рождения</label>
                      <Input name="birthdate" value={moment(patient.birthdate).format("DD.MM.YYYY")} readOnly />
                    </Form.Field>
                  </Form.Group>
                  <Form.Field>
                    <label>Адрес места жительства или № медицинской карты амбулаторного пациента</label>
                    <TextArea size="big" fluid name="patientCard" value={patientCard} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>ФИО врача</label>
                    <Input name="docName" value={docName} readOnly />
                  </Form.Field>
                </div>
              )} */}
              {recipe_formid && (
                <Form.Field>
                  <label>Комментарий к рецепту</label>
                  <TextArea
                    size="big"
                    placeholder="Пояснения к рецепту"
                    name="recipe_text"
                    fluid
                    value={recipe_text}
                    onChange={this.handleChange}
                  />
                </Form.Field>
              )}
            </Form>
            {false && (
              <Form>
                <Form.Field>
                  <label>Врач</label>
                  <Dropdown
                    options={checkData.doctor.map((item) => {
                      return {
                        key: item.id,
                        text: item.name,
                        value: item.id,
                      };
                    })}
                    placeholder="Иван Иванов"
                    search
                    name="doctor"
                    selection
                    fluid
                    value={doctor}
                    onChange={this.handleChange}
                  />
                </Form.Field>

                <Form.Group>
                  <Form.Field width={16}>
                    <label>Пациент</label>
                    <Dropdown
                      options={this.props.patients.arr.map((item) => {
                        return {
                          key: item.key,
                          text: item.name,
                          value: item.key,
                        };
                      })}
                      placeholder="Иван Иванов"
                      search={false}
                      name="patient"
                      selection
                      fluid
                      value={patient.key}
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
                      trigger={<Button>Добавить</Button>}
                    >
                      <Modal.Header>Создать пациента</Modal.Header>
                      <Modal.Content>
                        <PatientPassport />
                      </Modal.Content>
                      <Modal.Actions>
                        <Button color="black" onClick={() => this.setOpen(false)}>
                          Отмена
                        </Button>
                        <Button
                          content="Создать"
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
                  <label>E-mail пациента</label>
                  <Input name="email" value={patient.email} onChange={this.handleChange} placeholder="some@email.ru" />
                </Form.Field>
                <Form.Field>
                  <label>ЛПУ</label>
                  <Dropdown
                    options={checkData.lpu.map((item) => {
                      return {
                        key: item.id,
                        text: item.name,
                        value: item.id,
                      };
                    })}
                    placeholder="Клиника"
                    search
                    name="clinic"
                    selection
                    fluid
                    value={clinic}
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Form>
            )}
            {recipe_formid && <Drugs isRecipe={true} />}
          </Segment>
        </div>
        <Modal onClose={() => this.setOpenCode(false)} onOpen={() => this.setOpenCode(true)} open={openCode}>
          <Modal.Header>Ваш код для аптеки</Modal.Header>
          <Modal.Content>
            <Header as="h1">{code}</Header>
          </Modal.Content>
          <Modal.Actions>
            <Button
              content="Печать рецепта"
              labelPosition="right"
              primary
              icon="file alternate outline"
              onClick={() => this.print()}
            />
            <Button
              content="Отправить по E-mail"
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
          <Modal.Header>Выберите сертификат для подписи</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <label>доступные сертификаты</label>
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
              Отмена
            </Button>
            <Button color="blue" onClick={this.sign} disabled={this.state.selectedCertificate == null}>
              Подписать
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}
export default Recipe;
