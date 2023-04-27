import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import { TYPE } from "../../constants";

import Search from "../../components/Search";
import Drugs from "../../components/Drugs";
import Conflicts from "../../components/Conflicts";

import Page from "../Page";

import "./Main.css";

import { withTranslation } from "react-i18next";

import {
  Sidebar,
  Menu,
  Icon,
  Form,
  List,
  Header,
  Segment,
  Message,
  Dropdown,
  Button,
  Responsive,
  Modal,
  Flag,
  TextArea,
  Image,
} from "semantic-ui-react";

import _ from "lodash";

const ifFree = TYPE === "free";

const Main = inject(
  "router",
  "recipes",
  "db",
  "actions",
  "drugs",
  "warnings",
  "dosages",
  "diseases",
  "clinrecs",
  "patients",
  "tools",
)(
  observer(
    class Main extends Component {
      constructor(props) {
        super(props);
        this.state = {
          open: false,
          openCautions: false,
          openClearence: false,
          showPage: false,

          isLoading: false,
          searchQuery: "",
          clinic: null,

          manualDrugInputDialog: false,
          manualDrugInputText: "",
        };
        this.contextRef = createRef();
        this.searchInput = createRef();
        this.debouncedSearch = _.debounce(this.callSearchFunction, 500, {
          leading: false,
        });
      }

      detectManualDrugInput = async () => {
        this.setState({ manualDrugInputDialog: false });
        await this.props.drugs.Parse(this.state.manualDrugInputText);
      };

      setOpen = (open, type) => {
        open = open || false;
        this.setState({ [type]: open });
      };

      logout = () => {
        this.props.actions.logout();
      };

      handleSidebar = (x) => {
        this.setState({ open: x === "close" ? false : !this.state.open });
      };

      handleResultSelect = async (e, { result }) => {
        this.setState({ searchQuery: "" });
        if (!["FG", "ATX", "MKB10", "Nozology"].includes(result.type)) {
          this.props.drugs.selectFromSearch(result);
          // this.props.drugs.selectFromSearch(result, false, false);

          const input = document.querySelector(".results.transition.result-wrapper");
          input.classList.remove("visible");
        } else if (["FG", "ATX"].includes(result.type)) {
          // console.log("fg or atx");
          this.props.drugs.searchReady = false;

          const input = document.querySelector(".results.transition.result-wrapper");
          input.classList.remove("visible");
          this.setState({ searchQuery: result.name });
          this.props.drugs.searchRows = await this.props.drugs.searchByFG(result);
          this.props.drugs.searchReady = true;
          // const input = document.querySelector(".results.transition.result-wrapper");
          input.classList.add("visible");
        } else if (["MKB10", "Nozology"].includes(result.type)) {
          // console.log("fg or atx");
          this.props.drugs.searchReady = false;

          const input = document.querySelector(".results.transition.result-wrapper");
          input.classList.remove("visible");
          this.setState({ searchQuery: result.name });
          this.props.drugs.searchRows = await this.props.drugs.searchByNZ(result);
          this.props.drugs.searchReady = true;
          // const input = document.querySelector(".results.transition.result-wrapper");
          input.classList.add("visible");
        }
      };

      callSearchFunction = (value) => {
        console.log("search", value);
        this.props.drugs.search(value);
      };

      handleSearchChange = (e, { value }) => {
        this.setState({ searchQuery: value });
        if (value.length > 1) {
          this.props.drugs.searchReady = false;
          this.debouncedSearch(value);
        }
      };

      handleResetAll = (type) => {
        this.props.actions.resetAll(type);
        this.setOpen(false, "openClearence");
      };
      returnDeleted = () => {
        this.props.drugs.returnList();
      };

      clearDeleted = () => {
        this.props.drugs.clearDeleted();
        this.props.recipes.saveList();
      };

      handleChangeClinic = (e, { name, value }) => {
        this.setState({ clinic: value });
      };

      choseClinic = () => {
        let { checkData } = this.props.actions;
        let { clinic } = this.state;
        let newLpu = _.find(checkData.lpu, { id: clinic });
        this.props.actions.clinic.id = this.props.actions.drugStructure.clinic_id = newLpu.id;
        this.props.actions.clinic.name = this.props.actions.drugStructure.clinic_name = newLpu.name;
      };

      changeLang = (lang) => {
        // console.log({ lang });
        this.props.i18n.changeLanguage(lang);
        this.props.actions.setLang(lang);
      };

      getInfoPrep = () => {
        this.props.warnings.check();
      };

      getClinrec = () => {
        this.props.clinrecs.check();
      };
      getClinrecExist = () => {
        this.props.clinrecs.getClinicalGuidelinesExist();
      };

      resultRenderer = ({ name, level, tn, type }) => {
        const icon = ["FG", "ATX", "MKB10", "Nozology"].includes(type) ? "folder open" : "pills";

        const subtitleRender = (type) => {
          const subtitles = {
            FG: "Фармакологическая группа",
            ATX: "ATX",
          }

          if (Object.keys(subtitles).includes(type)) {
            return <div className="search-result-subtitle">{subtitles[type]}</div>;
          } else {
            return "";
          }
        }

        return (
          <div>
            <Icon name={icon} />
            {/* {name} */}
            <div dangerouslySetInnerHTML={{ __html: name }} style={{ display: "inline" }} />
            {type === "TN" && <sup>TM</sup>}
            {subtitleRender(type)}
          </div>
        );
      };

      resetLiquids = () => {
        this.props.drugs.resetGroups();
        this.props.actions.makeLiquids = false;
      };

      confirmLiquids = () => {
        this.props.drugs.makeLiquids();
        this.props.actions.makeLiquids = false;
      };

      goRecipe = () => {
        this.setOpen(false, "openCautions");
        this.props.router.push("/recipe/new");
        this.props.recipes.resetState();
        this.props.recipes.emailSent = false;
      };
      saveList = () => {
        let { isPrescriptFilled } = this.props.actions;
        if (isPrescriptFilled) {
          this.props.drugs.clearDeleted();
          this.props.recipes.saveList();
          this.setOpen(false, "openCautions");
        } else {
          // this.props.recipes.saveList()
          this.props.router.push("/prescript/fill");
          this.setOpen(false, "openCautions");
        }
      };

      componentDidMount() {
        setTimeout(() => {
          this.setState({ showPage: !!(this.props.router.values && this.props.router.values.page) });
        }, 100);

        //console.log('HERE');
      }

      render() {
        const { open, openCautions, openClearence, searchQuery, clinic } = this.state;
        const { tools } = this.props;

        // console.log(this.props.tools.functional);

        const canFindAddDeleteDrugs = tools.hasFunctional("FindAddDeleteDrugs");
        const canCheckListDrugsInterface = tools.hasFunctional("CheckListDrugsInterface");
        const canAppointmentTherapy = tools.hasFunctional("AppointmentTherapy");
        const canExtractDocuments = tools.hasFunctional("ExtractDocuments");
        const canAddAndEditPatient = tools.hasFunctional("AddAndEditPatient");
        const canViewPatientCard = tools.hasFunctional("ViewPatientCard");

        let {
          height,
          active_language,
          makeLiquids,
          isLiquidsOk,
          misLinkLogin: misDisabled,
          topview_disabled,
          bottomview_disabled,

          drugStructure: { doctor_name: doctor },
          doctor: doc,
        } = this.props.actions;
        doctor = doctor || doc.name;
        let {
          drugs: {
            searchReady,
            searchRows,
            drug,
            deletedLiquids,
            deletedRows,
            unselectedRows,
            listChanged,
            drugsRemoved,
            checkLiquids,
          }, //drugs, drugsDosages, currDrug, setDosageParams
          warnings: { cautionsTitle, cautions }, //warnings, warnGroups
          actions: {
            patientForm: { disease, co_disease },
            drugStructure,
            checkData,
            disabled,
            buttonTexts,
          },
          patients,
          //t,
        } = this.props;
        const { t } = this.props.actions;
        let showPage = !!(this.props.router.values && this.props.router.values.page);
        // console.log({ showPage, values: this.props.router.values, page: this.props.router.values.page });
        // console.log('router', this.props.router);
        // let showPage2 = true
        const { id: patientId, fio } = patients.current;
        // console.log("patient Form: ", this.props.actions.patientForm);
        let isDisease = disease.length > 0 || co_disease.length > 0;

        // isDisease = false; // выключить клинреки

        // console.log({
        //   makeLiquids,
        //   checkLiquids,
        //   "drug.size": drug.size,
        //   "deletedRows.length": deletedRows.length,
        //   "deletedLiquids.length": deletedLiquids.length,
        // });

        let showMainBottomMenu =
          !(makeLiquids || !checkLiquids) && (drug.size > 0 || deletedRows.length > 0 || deletedLiquids.length > 0);

        if (!canCheckListDrugsInterface && !canFindAddDeleteDrugs && !canExtractDocuments) {
          // bottomview_disabled = true;
          showMainBottomMenu = false;
        }

        const texts = buttonTexts ? buttonTexts.text : null;

        //check if have changes on list
        let editedDrugs = false;
        drug.forEach((item, i) => {
          if (!(item.proto && !item.edit)) {
            editedDrugs = true;
          }
        });
        if (deletedRows.length > 0 || drugsRemoved) {
          editedDrugs = true;
        }
        //end check if have changes on list

        if (topview_disabled) {
          document.querySelector(".ui.body > .pushable") &&
            document.querySelector(".ui.body > .pushable").classList.remove("pushable");
        }
        if (bottomview_disabled) {
          document.querySelector(".pusherwrapper.pusher") &&
            document.querySelector(".pusherwrapper.pusher").classList.remove("pusherwrapper", "pusher");
        }
        // console.log(listChanged, cautionsTitle);
        // console.log({ makeLiquids, checkLiquids, bottomview_disabled });
        return (
          <>
            {!disabled && !topview_disabled && (
              <Menu className={`ui top huge borderless tabular nomargin main menu fixed grey${showPage && " hidden"}`}>
                {!misDisabled && (
                  <Menu.Item icon onClick={this.handleSidebar}>
                    <Icon size="large" name="content" />
                  </Menu.Item>
                )}
                {/* {misDisabled && <Image src='../ecp_mis.png' />} */}
                {misDisabled && (
                  <Image
                    src="../ecp_mis.png"
                    style={{
                      margin: "4px",
                      height: "35px",
                    }}
                  />
                )}

                {misDisabled && (
                  <Header
                    className={"menuhead"}
                    style={{ margin: "auto", marginLeft: "8px", fontWeight: "600" }}
                    as="h4"
                    content={t("name_logo")}
                    subheader={t("cdss")}
                  />
                )}

                {canViewPatientCard && <Menu.Menu position="right">
                  <Responsive as={RouterLink} to="/patient/info" fireOnMount minWidth={misDisabled ? "1" : "481"}>
                    <Menu.Item>
                      <Icon name={"bed"} className={patientId ? "" : " glowing"} />
                      {fio || t("patient_notSelected")}
                    </Menu.Item>
                  </Responsive>
                  {/* {!misDisabled && isDisease && (
                    <Responsive
                      as={RouterLink}
                      // to={`/clinrec/checker/${clinrecCheckerStep}`}
                      to="/crstartpage/default"
                      // onClick={this.getClinrec}
                      onClick={this.getClinrecExist}
                      fireOnMount
                      minWidth={misDisabled ? "1" : "481"}
                    >
                      <Menu.Item>
                        <div className={this.props.clinrecs.collectorAvailable ? "alertBlinker" : ""}>
                          <Icon name="clipboard list" />
                          {t("clinical_recommendations")}
                        </div>
                      </Menu.Item>
                    </Responsive>
                  )} */}
                  <Responsive fireOnMount as={RouterLink} to="/patient/info" maxWidth={misDisabled ? "0" : "480"}>
                    <Menu.Item icon>
                      <Icon name="bed" size="large" />
                    </Menu.Item>
                  </Responsive>
                  {!misDisabled && isDisease && (
                    <Responsive
                      fireOnMount
                      as={RouterLink}
                      // onClick={this.getClinrec}
                      onClick={this.getClinrecExist}
                      // to={`/clinrec/checker/${clinrecCheckerStep}`}
                      to="/crstartpage/default"
                      maxWidth={misDisabled ? "0" : "480"}
                    >
                      <Menu.Item icon>
                        <Icon
                          name="clipboard list"
                          size="large"
                          className={this.props.clinrecs.collectorAvailable ? "alertBlinker" : ""}
                        />
                      </Menu.Item>
                    </Responsive>
                  )}
                </Menu.Menu>}
              </Menu>
            )}

            <Sidebar.Pushable
              className={`${disabled ? "disabled" : ""}${topview_disabled ? " no-pushable-padding" : ""}`}
            >
              {unselectedRows.length > 0 && (
                <Menu secondary className={`bottom fixed`}>
                  <Menu.Item>
                    {t("amount_of_drugs_removed")}: {unselectedRows.length}
                  </Menu.Item>
                  <Menu.Item onClick={this.returnDeleted}>
                    <Icon name="undo alternate" />
                    {t("return")}
                  </Menu.Item>
                  <Menu.Item onClick={this.clearDeleted}>
                    <Icon name="delete" />
                    {t("delete_forever")}
                  </Menu.Item>
                </Menu>
              )}
              {disabled && showMainBottomMenu && (
                <Menu className={`bottom fixed menu three item huge main`}>
                  {canFindAddDeleteDrugs && <Menu.Item onClick={() => this.handleResetAll("all")}>{t("main_drugs_reset")}</Menu.Item>}
                  <Menu.Item disabled={false && ifFree} onClick={this.getInfoPrep}>
                    {t("main_drugs_check")}
                  </Menu.Item>
                </Menu>
              )}
              {drug.size > 0 && !disabled && showMainBottomMenu && !bottomview_disabled && (
                <Menu className={`bottom fixed menu three item huge main`}>
                  {canFindAddDeleteDrugs && canAddAndEditPatient && <Modal
                    closeIcon
                    onClose={() => this.setOpen(false, "openClearence")}
                    onOpen={() => this.setOpen(true, "openClearence")}
                    open={openClearence}
                    trigger={<Menu.Item>{t("main_drugs_reset")}</Menu.Item>}
                  >
                    <Modal.Header>{t("what_data_clean")}</Modal.Header>
                    <Modal.Content>
                      <Header as="h3" content={t("can_cleaned")} />
                      <List>
                        <List.Item>{t("only_patient_data")}</List.Item>
                        <List.Item>{t("sheet_appointments_completely")}</List.Item>
                        <List.Item>{t("all_selected_data")}</List.Item>
                      </List>
                    </Modal.Content>
                    <Modal.Actions>
                      <Button content={t("clear_all")} onClick={() => this.handleResetAll("all")} negative />
                      <Button
                        content={t("sheet_appointments")}
                        labelPosition="right"
                        icon="list"
                        onClick={() => this.handleResetAll("list")}
                        color="black"
                      />
                      <Button
                        content={t("patient_data")}
                        labelPosition="right"
                        icon="user"
                        onClick={() => this.handleResetAll("patient")}
                        primary
                      />
                    </Modal.Actions>
                  </Modal>}




                  {canFindAddDeleteDrugs && !canAddAndEditPatient && <Menu.Item onClick={() => this.handleResetAll("list")}>
                    {t("main_drugs_reset")}
                  </Menu.Item>}


                  {canCheckListDrugsInterface && <>
                    <Menu.Item disabled={false && ifFree} onClick={this.getInfoPrep}>
                      {t("main_drugs_check")}
                    </Menu.Item>

                    {listChanged && editedDrugs && canAppointmentTherapy ? (
                      cautionsTitle ? (
                        <Modal
                          onClose={() => this.setOpen(false, "openCautions")}
                          onOpen={() => this.setOpen(true, "openCautions")}
                          open={openCautions}
                          trigger={
                            <Menu.Item className={editedDrugs ? "glowing" : ""}>{t("main_drugs_prescribe")}</Menu.Item>
                          }
                        >
                          <Modal.Header>{cautionsTitle}</Modal.Header>
                          <Modal.Content>
                            {cautions?.length > 0 &&
                              cautions.map((item, i) => {
                                return (
                                  <Message negative key={i}>
                                    <Message.Header>{item}</Message.Header>
                                  </Message>
                                );
                              })}
                          </Modal.Content>
                          <Modal.Actions>
                            <Button color="black" onClick={() => this.setOpen(false, "openCautions")}>
                              {t("main_parser_cancel")}
                            </Button>
                            <Button
                              content={t("continue")}
                              labelPosition="right"
                              icon="checkmark"
                              onClick={() => this.saveList()}
                              positive
                            />
                          </Modal.Actions>
                        </Modal>
                      ) : canAppointmentTherapy &&
                      <Menu.Item className={editedDrugs ? "glowing" : ""} onClick={() => this.saveList()}>
                        {t("main_drugs_prescribe")}
                      </Menu.Item>
                    ) :
                      canExtractDocuments && <Menu.Item onClick={() => this.goRecipe()}>{t("main_drugs_write")}</Menu.Item>
                    }
                  </>}
                </Menu>
              )}

              <Modal open={false && !drugStructure.clinic_id}>
                <Modal.Header>{t("choose_clinic")}</Modal.Header>
                <Modal.Content>
                  <Form>
                    <Form.Field>
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
                        value={drugStructure.clinic_id || null}
                        onChange={this.handleChangeClinic}
                      />
                    </Form.Field>
                  </Form>
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    content={t("select")}
                    labelPosition="right"
                    disabled={!clinic}
                    icon="checkmark"
                    onClick={() => this.choseClinic()}
                    primary
                  />
                </Modal.Actions>
              </Modal>

              {(makeLiquids || !checkLiquids) && !bottomview_disabled && (
                <Menu className="bottom fixed menu two item huge main">
                  <Menu.Item onClick={this.resetLiquids}>{t("relieve_solutions")}</Menu.Item>
                  <Menu.Item disabled={!isLiquidsOk} onClick={this.confirmLiquids}>
                    {t("apply")}
                  </Menu.Item>
                </Menu>
              )}
              <Sidebar
                width="very wide"
                direction="left"
                animation="overlay"
                visible={showPage}
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <Page />
              </Sidebar>

              {!misDisabled && (
                <Sidebar
                  style={{ paddingTop: "3.6em" }}
                  animation="overlay"
                  onClick={() => this.handleSidebar("close")}
                  onHide={() => this.handleSidebar("close")}
                  visible={open}
                  as={Menu}
                  vertical
                  size="huge"
                >
                  <Message style={{ margin: "0" }}>{doctor}</Message>

                  <Menu.Item as={RouterLink} to="/patient/list">
                    <Icon name="address book" />
                    {t("patient_patients")}
                  </Menu.Item>

                  {texts && texts.agreementheader && (
                    <Menu.Item as={RouterLink} to="/license-agreement">
                      <Icon name="file alternate" />
                      {texts.agreementheader}
                    </Menu.Item>
                  )}
                  {texts && texts.manualheader && (
                    <Menu.Item as={RouterLink} to="/manual">
                      <Icon name="clipboard list" />
                      {texts.manualheader}
                    </Menu.Item>
                  )}
                  {false && (
                    <Menu.Item as={RouterLink} to="/clinics/list">
                      <Icon name="hospital" />
                      {t("main_menu_clinics")}
                    </Menu.Item>
                  )}
                  {/* <Menu.Item as={RouterLink} to="/settings/my">
                    <Icon name="user md" />
                    {t("main_menu_settings")}
                  </Menu.Item> */}
                  {false && (
                    <Menu.Item disabled as={RouterLink} to="/profile/show">
                      <Icon name="user md" />
                      {t("main_menu_profile")}
                    </Menu.Item>
                  )}
                  {true && (
                    // (window.location.href.includes("socmedica.dev") || window.location.href.includes("localhost")) && (
                    <div>
                      {/* <Menu.Item disabled>
                        <Icon name="list ul" />
                        Текущие назначения
                      </Menu.Item>
                      <Menu.Item disabled>
                        <Icon name="clipboard list" />
                        История назначений
                      </Menu.Item> */}
                      <Dropdown
                        // disabled
                        item
                        // icon={active_language === "ru" ? <Flag name="ru" /> : <Flag name="gb" />}
                        text={active_language === "ru" ? "Русский " : "English "}
                      >
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => this.changeLang("en")}>
                            <Flag name="gb" />
                            English
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => this.changeLang("ru")}>
                            <Flag name="ru" />
                            Русский
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      {/* <Menu.Item disabled>
                        <Icon name="book" />
                        Инструкция
                      </Menu.Item>
                      <Menu.Item disabled>
                        <Icon name="chat" />
                        Подсказки
                      </Menu.Item> */}
                    </div>
                  )}
                  {/*<Menu.Item>
              <Icon name='user' />
              Поделиться
            </Menu.Item>*/}
                  <Menu.Item onClick={this.logout}>
                    <Icon name="sign-out" />
                    {t("main_menu_exit")}
                  </Menu.Item>
                </Sidebar>
              )}

              <Sidebar.Pusher dimmed={open || showPage} className="pusherwrapper">
                {canFindAddDeleteDrugs && !disabled && !topview_disabled && (
                  <Menu className="fluid one item ui top huge text menu searchwrapper" style={{ margin: 0 }}>
                    <Menu.Item>
                      <Segment basic className="fluid">
                        <Search
                          ref={this.searchInput}
                          id="searchInput"
                          fluid
                          size="huge"
                          height={height - 130}
                          loading={!searchReady}
                          onResultSelect={this.handleResultSelect}
                          onSearchChange={this.handleSearchChange}
                          noResultsMessage={t("main_search_notFound")}
                          results={searchRows}
                          value={searchQuery}
                          resultRenderer={this.resultRenderer}
                          resultclassname="result-wrapper"
                          minCharacters={2}
                          icon={
                            <Icon
                              name="pencil"
                              style={{ cursor: "pointer", "pointerEvents": "all" }}
                              onClick={() => {
                                this.setState({ manualDrugInputDialog: true, manualDrugInputText: "" });
                              }}
                            />
                          }
                        />
                      </Segment>
                    </Menu.Item>
                  </Menu>
                )}
                <div className={`scrollwrapper`}>
                  <Segment
                    className="basic no-padding"
                    width={16}
                    style={{ boxShadow: "0 0 9px #ccc", borderBottom: "1px solid #fff" }}
                  >
                    {drug.size > 0 ? (
                      <Drugs />
                    ) : (
                      !disabled &&
                      !topview_disabled &&
                      canFindAddDeleteDrugs && <Segment basic>
                        <Message info>
                          <Icon name="info" />
                          {t("main_search_tip")}&nbsp;{" "}
                          <span
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => this.setState({ manualDrugInputDialog: true, manualDrugInputText: "" })}
                          >
                            {t("main_parser_tip")}
                          </span>
                        </Message>
                      </Segment>
                    )}
                  </Segment>
                  {drug.size > 0 && (
                    <Segment className="basic no-padding" basic width={16} style={{ paddingTop: 0 }}>
                      <Conflicts />
                    </Segment>
                  )}
                </div>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
            <Modal
              onClose={() => this.setState({ manualDrugInputDialog: false })}
              onOpen={() => this.setState({ manualDrugInputDialog: true, manualDrugInputText: "" })}
              open={this.state.manualDrugInputDialog}
            >
              <Modal.Header>{t("main_parser_header")}</Modal.Header>
              <Modal.Content>
                <Form>
                  <TextArea
                    autoFocus
                    rows={4}
                    name="drugs"
                    value={this.state.manualDrugInputText}
                    placeholder={t("main_parser_tip2")}
                    onChange={(e) => this.setState({ manualDrugInputText: e.target.value })}
                  />
                </Form>
              </Modal.Content>
              <Modal.Actions style={{ display: "flex", justifyContent: "space-between" }}>
                <Button color="red" onClick={() => this.setState({ manualDrugInputDialog: false })}>
                  {t("main_parser_cancel")}
                </Button>
                <Button color="blue" onClick={this.detectManualDrugInput}>
                  {t("main_parser_parse")}
                </Button>
              </Modal.Actions>
            </Modal>
          </>
        );
      }
    }
  )
);

export default withTranslation()(Main);
