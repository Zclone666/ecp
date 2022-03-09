import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import Spinner from "../../components/Spinner";
import BirthDate from "../../components/BirthDate";
import Search from "../../components/Search";

import PatientPassport from "./PatientPassport";
import FormChecker from "./Protocol/FormChecker";
import { checkDouble, clearDouble } from "../../lib/helpers";

import { withTranslation } from "react-i18next";

import {
  Sidebar,
  Menu,
  Icon,
  Divider,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid,
  Form,
  Input,
  Checkbox,
  Header,
  Dropdown,
  Modal,
} from "semantic-ui-react";

import _ from "lodash";
import moment from "moment";
import { isGrowth, isWeight } from "../../serviceWorker";

const boxDisabled = !window.location.host.includes("socmedica") && !window.location.host.includes(["localhost"]);

const PatientForm = inject(
  "router",
  "diseases",
  "actions",
  "patients",
  "tools"
)(
  observer(
    class PatientForm extends Component {
      constructor(props) {
        super(props);
        this.state = {
          search_disease: "",
          search_co_disease: "",
          search_allergy: "",
          lab_data: "",
          mutation: {
            gene: "",
            allele1: "",
            allele2: "",
          },
          misDisabled: this.props.actions.misLinkLogin,

          search_patient: "",
          showPatientPassport: false,
          showProtocol: false,
        };
        this.fileUploadRef = createRef();
      }

      componentDidMount() {
        if (!boxDisabled) {
          const fileSelector = document.getElementById("genpassport-upload");
          fileSelector.addEventListener("change", this.handleFileUpload);
        }
      }

      componentWillUnmount() {
        if (!boxDisabled) {
          const fileSelector = document.getElementById("genpassport-upload");
          fileSelector.removeEventListener("change", this.handleFileUpload);
        }
      }

      handleChange = (e, { name, value }) => {
        if (!name && !value) {
          let { name, value } = e.target;
        }
        const { editForm } = this.props;        
        editForm();

        let errorValue = false;
        if (name == "weight") {
          errorValue = isWeight(value);
        }
        if (name == "growth") {
          errorValue = isGrowth(value);
        }
        const { birthdate } = this.props.patients.current;
        // console.log(errorValue);
        let veryOld = moment().diff((birthdate && moment(birthdate, "x")) || moment(), "years") <= 12 || 
        moment().diff((birthdate && moment(birthdate, "x")) || moment(), "years") >= 60;

        if (name === "weight" || name === "growth") {
          value = clearDouble(value);
          if (!errorValue) {
            if (!checkDouble(value)) {
              this.props.patients.current[name] = value;
            } else {
              this.props.patients.current[name] = parseFloat(value);
            }
          }

          this.props.patients.current.masIndex =
            this.props.patients.current.weight && this.props.patients.current.growth
              ? parseFloat(
                  (this.props.patients.current.weight / Math.pow(this.props.patients.current.growth / 100, 2)).toFixed(
                    2
                  )
                )
              : 0;
          this.props.patients.current.squareIndex = parseFloat(
            (
              0.007184 *
              Math.pow(this.props.patients.current.growth, 0.725) *
              Math.pow(this.props.patients.current.weight, 0.425)
            ).toFixed(2)
          );
        } else {
          this.props.patients.current[name] = value;
        }
        if ((name === "sex" && value !== "female") || veryOld) {
          this.props.patients.current.pregnancy = false;
          this.props.patients.current.gestation = null;
          this.props.patients.current.trimester = null;
          this.props.patients.current.lactation = false;
        }
        if (name === "trimester") {
          this.props.patients.current.gestation = null;
        }
        if (name === "gestation") {
          this.props.patients.current.trimester = value > 14 ? (value > 26 ? 3 : 2) : 1;
        }
        // console.log({ name, value, res: this.props.patients.current[name] });
      };
      handleChangeToggle = (e, { name, value }) => {
        if (!name && !value) {
          let { name, value } = e.target;
        }
        const { editForm } = this.props;
        editForm()
        this.props.patients.current[name] = !this.props.patients.current[name];
        if (name === "pregnancy" && !this.props.patients.current.pregnancy) {
          this.props.patients.current.gestation = null;
          this.props.patients.current.trimester = null;
        }
        //console.log({ name, value });
      };
      handleAddMutation = () => {
        this.props.patients.current.mutations.push(this.state.mutation);
        this.setState({ mutation: { gene: "", allele1: "", allele2: "" } });
      };
      handleFileUpload = (e) => {
        const { id } = this.props.patients.current;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          const string = evt.target.result;
          const parsedResult = string
            .replaceAll("\r", "\n")
            .split("\n")
            .map((str) => {
              const parsedString = str.split(";");
              if (parsedString.length === 4)
                return {
                  gene: parsedString[0],
                  code: parsedString[1],
                  reference: parsedString[2],
                  alleles: parsedString[3].split("/"),
                };
              return {};
            });
          this.props.tools.loadGenPassport(id, parsedResult);
        };
        reader.readAsBinaryString(file);
      };
      handleRemoveMutation = (item, i) => {
        this.props.patients.current.mutations.splice(i, 1);
      };
      handleAddLabData = () => {
        this.props.patients.current.labparams.push(this.state.lab_data);
        this.setState({ lab_data: "" });
      };
      handleRemoveLabData = (item, i) => {
        this.props.patients.current.labparams.splice(i, 1);
      };
      handleResultSelect = async (e, { name, result }) => {
        // console.log({ name, result });
        //let newName = name === 'co_disease' ? 'disease' : name
        const { editForm } = this.props;
        editForm();
        await this.props.actions.selectPatient(result, name);
        this.setState({ [`search_${name}`]: "" });
      };
      handleResultUnselect = async (name, result) => {
        await this.props.actions.unselectPatient(result, name);
        this.forceUpdate();
      };

      clearPatient = () => {
        if (this.props.patients?.current?.id) this.setState({ showPatientPassport: true });
        this.props.patients.unsetCurrent();
        this.props.actions.resetAll();
      };

      handlePatientResultSelect = async (e, { name, result }) => {
        //let newName = name === 'co_disease' ? 'disease' : name
        await this.props.patients.request(result.id);
        this.setState({ [`search_${name}`]: "" });
        // this.props.router.push("/patient/info");
      };

      handlePatientSearchChange = (e, { name, value }) => {
        this.setState({ [`search_${name}`]: value });
        if (value.length > 1) {
          this.props.patients.searchReady = false;
          this.props.patients.search(value);
        }
      };

      get listSearch() {
        let arr = [];
        this.props.patients.searchRows.forEach((item, i) => {
          if (item.name) {
            arr.push({
              id: item.id,
              title: item.name,
              price: item.birthdate ? moment(item.birthdate, "x").format("DD.MM.YYYY") : "",
              description: item.email,
            });
          }
        });
        return arr;
      }

      handleSearchChange = (e, { name, value }) => {
        this.setState({ [`search_${name}`]: value });
        if (value.length > 1) {
          this.props.diseases.searchReady = false;
          if (name === "allergy") {
            this.props.diseases.getSearchAllergy(value, name);
          } else {
            this.props.diseases.getSearchDisease(value, name);
          }
        }
      };

      resultRenderer = ({ name, level, tn, type }) => {
        return (
          <div>
            {/* {name} */}
            <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
            {type === "TN" && <sup>TM</sup>}
          </div>
        );
      };
      get disease() {
        const { disease } = this.props.patients.current;
        // console.log(this.props.patients.current);
        let arr = [];
        disease.forEach((item, i) => {
          arr.push(item);
        });
        return arr;
      }
      get co_disease() {
        const { co_disease } = this.props.patients.current;
        let arr = [];
        co_disease.forEach((item, i) => {
          arr.push(item);
        });
        return arr;
      }
      render() {
        const { t } = this.props.actions;
        const {
          id,
          key,
          email,
          name,
          fio,
          snils,
          miscode,
          misid,
          birthdate,
          sex,
          growth,
          weight,
          masIndex,
          squareIndex,
          disease,
          co_disease,
          allergy,
          labparams,
          pregnancy,
          gestation,
          trimester,
          lactation,
          driving,
          alcohol,
          mutations,
          genpassport_exist,
        } = this.props.patients.current;

        let { diseaseRows, allergyRows } = this.props.diseases;
        let { search_disease, search_co_disease, search_allergy, misDisabled, showPatientPassport, showProtocol } =
          this.state;
        let searchReady = true,
          searchRows = [],
          searchQuery = "";

        let isWoman = sex === "female";
        let isPregant = !!pregnancy;
        let veryOld = moment().diff((birthdate && moment(birthdate, "x")) || moment(), "years") >= 60;
        let { search_patient } = this.state;

        return (
          <Segment basic>
            <Form>
              <Form.Group>
                <Form.Field width={7}>
                  <Search
                    fluid
                    size="big"
                    name="patient"
                    noResultsMessage={t("main_search_notFound")}
                    placeholder={t("patinet_card_name_patient")}
                    loading={!searchReady}
                    onResultSelect={this.handlePatientResultSelect}
                    onSearchChange={_.debounce(this.handlePatientSearchChange, 500, {
                      leading: true,
                    })}
                    results={this.listSearch}
                    value={search_patient}
                    resultClassName="result-wrapper"
                  />
                </Form.Field>
                <Form.Field width={3}>
                  <Header as="h2" content={fio} subheader={email} />
                </Form.Field>
                {/* {this.props.patients.current.id && (
                  <Form.Field width={2}>
                    {(window.location.href.includes("socmedica.dev") || window.location.href.includes("localhost")) && (
                      <Button onClick={() => this.setState({ showProtocol: !showProtocol })}>{t("protocol")}</Button>
                    )}
                  </Form.Field>
                )} */}
                <Form.Field width={3}>
                  <Button onClick={() => this.setState({ showPatientPassport: !showPatientPassport })}>
                    {showPatientPassport
                      ? t("patinet_card_collapse_passport") //"Свернуть паспортные данные"
                      : id
                      ? t("patinet_card_passport_edit") // "Редактировать паспортные данные"
                      : t("patinet_card_passport_label")}
                  </Button>
                </Form.Field>
                <Form.Field width={2}>
                  <Button onClick={() => this.clearPatient()}>{id ? t("new_patient") : t("main_drugs_reset")}</Button>
                </Form.Field>
              </Form.Group>
              <Divider horizontal fitted />

              {showPatientPassport && <PatientPassport editForm={() => this.props.editForm()} />}
              <Form.Group>
                <BirthDate name="birthdate" value={birthdate} onChange={(e, { name, value }) => this.handleChange(e, { name, value })} trans={t} />
                <Form.Field>
                  <label>{t("sex")}</label>
                  <Button.Group size="big">
                    <Button primary={sex === "male"} onClick={this.handleChange} name="sex" value="male">
                      {t("male")}
                    </Button>
                    <Button primary={sex === "female"} onClick={this.handleChange} name="sex" value="female">
                      {t("female")}
                    </Button>
                  </Button.Group>
                </Form.Field>
              </Form.Group>
              <Form.Group>
                <Form.Field width={5}>
                  <label>{t("growth")}</label>
                  <Input
                    size="big"
                    name="growth"
                    type="number"
                    // error={growth < 8}
                    value={growth || ""}
                    label={{ basic: true, content: t("sm") }}
                    labelPosition="right"
                    placeholder="178.5"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field width={5}>
                  <label>{t("weight")}</label>
                  <Input
                    size="big"
                    name="weight"
                    type="number"
                    // error={weight < 3}
                    value={weight || ""}
                    label={{ basic: true, content: t("kg") }}
                    labelPosition="right"
                    placeholder="60.5"
                    onChange={this.handleChange}
                  />
                </Form.Field>
                <Form.Field width={3}>
                  <label>{t("body_mass_index")}</label>
                  <Input
                    size="big"
                    name="masIndex"
                    className="readonly right labeled"
                    readOnly="readonly"
                    value={masIndex || ""}
                  >
                    <input readOnly="readonly" className="readonly" />
                    <div className="ui basic label">{t("kg_m2")}</div>
                  </Input>
                </Form.Field>
                <Form.Field width={3}>
                  <label>{t("body_surface_area")}</label>
                  <Input
                    size="big"
                    name="squareIndex"
                    className="readonly right labeled"
                    readOnly="readonly"
                    value={squareIndex || ""}
                  >
                    <input readOnly="readonly" className="readonly" />
                    <div className="ui basic label">{t("m2")}</div>
                  </Input>
                </Form.Field>
              </Form.Group>
              <Form.Group widths={1}>
                <Form.Field width={16}>
                  <label>{t("underlying_disease")}</label>
                  <Search
                    fluid
                    size="big"
                    name="disease"
                    noResultsMessage={t("main_search_notFound")}
                    loading={!searchReady}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    results={diseaseRows}
                    value={search_disease}
                    resultRenderer={this.resultRenderer}
                    resultClassName="result-wrapper"
                  />
                </Form.Field>
              </Form.Group>
              <List divided verticalAlign="middle">
                {this.disease.map((item, i) => {
                  return (
                    <List.Item key={"disease" + i} style={{ padding: "0.5em", backgroundColor: "#f6f6f0" }}>
                      <List.Content floated="right">
                        <Button size="tiny" icon="delete" onClick={() => this.handleResultUnselect("disease", item)} />
                      </List.Content>
                      <List.Icon name="heartbeat" size="big" verticalAlign="middle" />
                      <List.Content>
                        <List.Header>{item.name}</List.Header>
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
              <Form.Group widths={1}>
                <Form.Field width={16}>
                  <label>{t("accompanying_illnesses")}</label>
                  <Search
                    fluid
                    size="big"
                    name="co_disease"
                    noResultsMessage={t("main_search_notFound")}
                    loading={!searchReady}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    results={diseaseRows}
                    value={search_co_disease}
                    resultRenderer={this.resultRenderer}
                    resultClassName="result-wrapper"
                  />
                </Form.Field>
              </Form.Group>
              <List divided verticalAlign="middle">
                {this.co_disease.map((item, i) => {
                  return (
                    <List.Item key={"co_disease" + i} style={{ padding: "0.5em", backgroundColor: "#f6f6f0" }}>
                      <List.Content floated="right">
                        <Button
                          size="tiny"
                          icon="delete"
                          onClick={() => this.handleResultUnselect("co_disease", item)}
                        />
                      </List.Content>
                      <List.Icon name="heartbeat" size="big" verticalAlign="middle" />
                      <List.Content>
                        <List.Header>{item.name}</List.Header>
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
              {!misDisabled && (
                <Form.Group style={{ alignItems: "flex-end" }} widths={1}>
                  <Form.Field width={4}>
                    <label>{t("gene_mutation")}</label>
                    {/* number: {mutations.length} gene: {this.state.mutation.gene} allele1:{" "}
              {this.state.mutation.allele1} allele2: {this.state.mutation.allele2} */}
                    <Input
                      fluid
                      size="big"
                      name="gene"
                      value={this.state.mutation.gene}
                      onChange={(e) => {
                        this.setState({ mutation: { ...this.state.mutation, gene: e.target.value } });
                      }}
                    />
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("allele")} 1</label>
                    <Input
                      disabled={this.state.mutation.gene.trim().length === 0}
                      fluid
                      size="big"
                      name="allele1"
                      value={this.state.mutation.allele1}
                      onChange={(e) => {
                        this.setState({ mutation: { ...this.state.mutation, allele1: e.target.value } });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          this.handleAddLabData();
                        }
                      }}
                    />
                  </Form.Field>
                  <Form.Field width={4}>
                    <label>{t("allele")} 2</label>
                    <Input
                      disabled={this.state.mutation.gene.trim().length === 0}
                      fluid
                      size="big"
                      name="allele2"
                      value={this.state.mutation.allele2}
                      onChange={(e) => {
                        this.setState({ mutation: { ...this.state.mutation, allele2: e.target.value } });
                      }}
                    />
                  </Form.Field>
                  <Form.Field width={4}>
                    <Button
                      disabled={this.state.mutation.gene.trim().length === 0}
                      size="big"
                      icon
                      fluid
                      labelPosition="right"
                      onClick={this.handleAddMutation}
                    >
                      {t("add")}
                      <Icon name="plus" />
                    </Button>
                  </Form.Field>
                </Form.Group>
              )}
              {!boxDisabled && (
                <Form.Group widths={1}>
                  <Form.Field width={16}>
                    <label>{t("genetic_passport")}</label>
                    <Button
                      primary={genpassport_exist}
                      disabled={!id}
                      size="big"
                      fluid
                      labelPosition="left"
                      icon
                      onClick={() => this.fileUploadRef.current.click()}
                    >
                      <Icon name='file' />
                      {genpassport_exist ? t("update_patient_genetic_passport") : t("download_genetic_passport")}
                    </Button>
                    <input id="genpassport-upload" ref={this.fileUploadRef} type="file" hidden accept=".csv" />
                  </Form.Field>
                </Form.Group>
              )}
              <List divided verticalAlign="middle">
                {mutations &&
                  mutations.map((item, i) => {
                    return (
                      <List.Item key={"allergy" + i} style={{ padding: "0.5em", backgroundColor: "#f6f6f0" }}>
                        <List.Content floated="right">
                          <Button size="tiny" icon="delete" onClick={() => this.handleRemoveMutation(item, i)} />
                        </List.Content>
                        <List.Icon name="dna" size="big" verticalAlign="middle" />
                        <List.Content>
                          <List.Header>
                            {item.gene} {item.allele1} {item.allele2.trim().length > 0 ? "/" : ""} {item.allele2}
                          </List.Header>
                        </List.Content>
                      </List.Item>
                    );
                  })}
              </List>
              <Form.Group widths={1}>
                <Form.Field width={16}>
                  <label>{t("allergy")}</label>
                  <Search
                    fluid
                    size="big"
                    name="allergy"
                    noResultsMessage={t("main_search_notFound")}
                    loading={!searchReady}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    results={allergyRows}
                    value={search_allergy}
                    resultRenderer={this.resultRenderer}
                    resultClassName="result-wrapper"
                  />
                </Form.Field>
              </Form.Group>
              <List divided verticalAlign="middle">
                {allergy.map((item, i) => {
                  return (
                    <List.Item key={"allergy" + i} style={{ padding: "0.5em", backgroundColor: "#f6f6f0" }}>
                      <List.Content floated="right">
                        <Button size="tiny" icon="delete" onClick={() => this.handleResultUnselect("allergy", item)} />
                      </List.Content>
                      <List.Icon name="heartbeat" size="big" verticalAlign="middle" />
                      <List.Content>
                        <List.Header>
                          {item.name}
                          {item.type === "TN" && (
                            <span>
                              <sup>TM</sup>
                            </span>
                          )}
                        </List.Header>
                      </List.Content>
                    </List.Item>
                  );
                })}
              </List>
              {!misDisabled && false && (
                <Form.Group widths={1}>
                  <Form.Field width={16}>
                    <label>{t("laboratory_data")}</label>
                    <Input
                      fluid
                      size="big"
                      name="lab_data"
                      value={this.state.lab_data}
                      action={{
                        labelPosition: "right",
                        icon: "plus",
                        content: t("add"),
                        onClick: this.handleAddLabData,
                      }}
                      onChange={(e) => {
                        this.setState({ lab_data: e.target.value });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          this.handleAddLabData();
                        }
                      }}
                    />
                  </Form.Field>
                </Form.Group>
              )}
              <List divided verticalAlign="middle">
                {labparams &&
                  labparams.map((item, i) => {
                    return (
                      <List.Item key={"allergy" + i} style={{ padding: "0.5em", backgroundColor: "#f6f6f0" }}>
                        <List.Content floated="right">
                          <Button size="tiny" icon="delete" onClick={() => this.handleRemoveLabData(item, i)} />
                        </List.Content>
                        <List.Icon name="heartbeat" size="big" verticalAlign="middle" />
                        <List.Content>
                          <List.Header>{item}</List.Header>
                        </List.Content>
                      </List.Item>
                    );
                  })}
              </List>
              {isWoman && !veryOld && (
                <Responsive as={Form.Group} widths={"equal"} maxWidth={480}>
                  <Form.Field>
                    <Button
                      size="big"
                      icon
                      fluid
                      labelPosition="left"
                      primary={!!pregnancy}
                      onClick={this.handleChangeToggle}
                      name="pregnancy"
                      value="pregnancy"
                    >
                      <Icon name={!!pregnancy ? "check square" : "square outline"} />
                      {t("pregnancy")}
                    </Button>
                  </Form.Field>
                  <Form.Field>
                    <Button.Group size="big" fluid>
                      <Button disabled active>
                        {t("trimester")}
                      </Button>
                      <Button
                        primary={trimester == 1}
                        disabled={!isPregant}
                        onClick={this.handleChange}
                        name="trimester"
                        value={1}
                      >
                        1
                      </Button>
                      <Button
                        primary={trimester == 2}
                        disabled={!isPregant}
                        onClick={this.handleChange}
                        name="trimester"
                        value={2}
                      >
                        2
                      </Button>
                      <Button
                        primary={trimester == 3}
                        disabled={!isPregant}
                        onClick={this.handleChange}
                        name="trimester"
                        value={3}
                      >
                        3
                      </Button>
                    </Button.Group>
                  </Form.Field>
                  <Form.Field>
                    <Dropdown
                      className="big"
                      disabled={!isPregant}
                      name="gestation"
                      onChange={this.handleChange}
                      button
                      fluid
                      search
                      floating
                      options={_.map(Array(44), (item, i) => {
                        return {
                          key: i + 1,
                          text: i + 1,
                          value: i + 1,
                        };
                      })}
                      text={t("week") + " " + (gestation || "")}
                    />
                  </Form.Field>
                </Responsive>
              )}

              <Responsive as={Form.Group} widths={"equal"} maxWidth={480}>
                <Form.Field>
                  <Button
                    size="big"
                    icon
                    fluid
                    labelPosition="left"
                    primary={!!driving}
                    onClick={this.handleChangeToggle}
                    name="driving"
                    value="driving"
                  >
                    <Icon name={!!driving ? "check square" : "square outline"} />
                    {t("car_driving")}
                  </Button>
                </Form.Field>
                <Form.Field>
                  <Button
                    size="big"
                    icon
                    fluid
                    labelPosition="left"
                    primary={!!alcohol}
                    onClick={this.handleChangeToggle}
                    name="alcohol"
                    value="alcohol"
                  >
                    <Icon name={!!alcohol ? "check square" : "square outline"} />
                    {t("alcohol")}
                  </Button>
                </Form.Field>
                {isWoman && !veryOld && (
                  <Form.Field>
                    <Button
                      size="big"
                      disabled={!isWoman || veryOld}
                      icon
                      fluid
                      labelPosition="left"
                      primary={!!lactation}
                      onClick={this.handleChangeToggle}
                      name="lactation"
                      value="lactation"
                    >
                      <Icon name={!!lactation ? "check square" : "square outline"} />
                      {t("lactation")}
                    </Button>
                  </Form.Field>
                )}
              </Responsive>
              {isWoman && !veryOld && (
                <Responsive as={Form.Group} minWidth={481}>
                  <Form.Field>
                    <Button
                      size="big"
                      icon
                      labelPosition="left"
                      primary={!!pregnancy}
                      onClick={this.handleChangeToggle}
                      name="pregnancy"
                      value="pregnancy"
                    >
                      <Icon name={!!pregnancy ? "check square" : "square outline"} />
                      {t("pregnancy")}
                    </Button>
                  </Form.Field>
                  <Form.Field>
                    <Button.Group size="big" fluid>
                      <Button disabled active>
                        {t("trimester")}
                      </Button>
                      <Button
                        primary={trimester == 1}
                        disabled={!isPregant}
                        onClick={this.handleChange}
                        name="trimester"
                        value={1}
                      >
                        1
                      </Button>
                      <Button
                        primary={trimester == 2}
                        disabled={!isPregant}
                        onClick={this.handleChange}
                        name="trimester"
                        value={2}
                      >
                        2
                      </Button>
                      <Button
                        primary={trimester == 3}
                        disabled={!isPregant}
                        onClick={this.handleChange}
                        name="trimester"
                        value={3}
                      >
                        3
                      </Button>
                    </Button.Group>
                  </Form.Field>
                  <Form.Field>
                    <Dropdown
                      className="big"
                      disabled={!isPregant}
                      name="gestation"
                      onChange={this.handleChange}
                      button
                      floating
                      search
                      options={_.map(Array(44), (item, i) => {
                        return {
                          key: i + 1,
                          text: i + 1,
                          value: i + 1,
                        };
                      })}
                      text={t("week") + " " + (gestation || "")}
                    />
                  </Form.Field>
                </Responsive>
              )}
              <Responsive as={Form.Group} minWidth={481}>
                <Form.Field>
                  <Button
                    size="big"
                    icon
                    labelPosition="left"
                    primary={!!driving}
                    onClick={this.handleChangeToggle}
                    name="driving"
                    value="driving"
                  >
                    <Icon name={!!driving ? "check square" : "square outline"} />
                    {t("car_driving")}
                  </Button>
                </Form.Field>
                <Form.Field>
                  <Button
                    size="big"
                    icon
                    labelPosition="left"
                    primary={!!alcohol}
                    onClick={this.handleChangeToggle}
                    name="alcohol"
                    value="alcohol"
                  >
                    <Icon name={!!alcohol ? "check square" : "square outline"} />
                    {t("alcohol")}
                  </Button>
                </Form.Field>
                {isWoman && !veryOld && (
                  <Form.Field>
                    <Button
                      size="big"
                      disabled={!isWoman || veryOld}
                      icon
                      labelPosition="left"
                      primary={!!lactation}
                      onClick={this.handleChangeToggle}
                      name="lactation"
                      value="lactation"
                    >
                      <Icon name={!!lactation ? "check square" : "square outline"} />
                      {t("lactation")}
                    </Button>
                  </Form.Field>
                )}
              </Responsive>
            </Form>
            <Modal
              style={{ height: "70%" }}
              onClose={() => this.setState({ showProtocol: false })}
              onOpen={() => this.setState({ showProtocol: true })}
              open={showProtocol}
            >
              <Modal.Header>{t("fill_out_protocol")}</Modal.Header>
              <Modal.Content style={{ height: "100%", padding: 0 }} scrolling>
                <FormChecker patient={this.props.patients.current}/>
                {/* <iframe
                  frameborder="0"
                  width="100%"
                  height="100%"
                  id="protocol"
                  src={
                    "https://smartform.socmedica.dev/form/81/415?patient?=" +
                    JSON.stringify(this.props.patients.current)
                  }
                ></iframe> */}
              </Modal.Content>
              <Modal.Actions style={{ display: "flex", justifyContent: "space-between" }}>
                <Button color="red" onClick={() => this.setState({ showProtocol: false })}>
                  {t("close")}
                </Button>
              </Modal.Actions>
            </Modal>
          </Segment>
        );
      }
    }
  )
);

export default withTranslation()(PatientForm);
