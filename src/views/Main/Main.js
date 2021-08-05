import React, { Component, createRef } from "react";
import { observer, inject } from "mobx-react";

import RouterLink from "../../router/a";

import { TYPE } from "../../constants";

import Spinner from "../../components/Spinner";
import Search from "../../components/Search";
import Drugs from "../../components/Drugs";
import Conflicts from "../../components/Conflicts";

import Page from "../Page";

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
  Grid,
  Modal,
  Flag,
  TextArea,
} from "semantic-ui-react";

import _ from "lodash";

const ifFree = TYPE == "free";

@inject("router", "recipes", "db", "actions", "drugs", "warnings", "dosages", "diseases", "clinrecs", "patients")
@observer
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
      leading: true,
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
    // this.props.drugs.searchRows = [
    //   {
    //     key: null,
    //     id: "cyP8RzdZUco9PaSp+Zbmug==",
    //     fpid: null,
    //     type: "DV",
    //     level: 283,
    //     name: "Минералокортикоиды",
    //     namesearch: null,
    //     group: 0,
    //     main: false,
    //   },
    //   {
    //     key: null,
    //     id: "DpRCvhJYBTNl8S32CoaWAw==",
    //     fpid: null,
    //     type: "DV",
    //     level: 283,
    //     name: "Глюкокортикоиды",
    //     namesearch: null,
    //     group: 0,
    //     main: false,
    //   },
    // ];
    // this.props.drugs.searchRows = await this.props.drugs.searchByFG(result);
    // this.setState({ searchQuery: "e pa pa" });
    // console.log("search input ", this.searchInput.current);
    // const input = document.querySelector(".results.transition.result-wrapper");
    // input.classList.add("visible");
    // console.log({ input });

    // console.log("search rows: ", this.props.drugs.searchRows);
    // return;

    this.setState({ searchQuery: "" });
    if (!["FG", "ATX"].includes(result.type)) {
      await this.props.drugs.selectFromSearch(result);
      const input = document.querySelector(".results.transition.result-wrapper");
      input.classList.remove("visible");
    } else if (["FG", "ATX"].includes(result.type)) {
      // console.log("fg or atx");
      this.props.drugs.searchReady = false;
      this.setState({ searchQuery: result.name });
      this.props.drugs.searchRows = await this.props.drugs.searchByFG(result);
      this.props.drugs.searchReady = true;
      const input = document.querySelector(".results.transition.result-wrapper");
      input.classList.add("visible");
    }
  };

  callSearchFunction = (value) => {
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
    // if (window.confirm("Сбросить все?")) this.props.actions.resetAll();
  };
  returnDeleted = () => {
    this.props.drugs.returnList();
  };

  clearDeleted = () => {
    this.props.drugs.clearDeleted();
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
    this.props.actions.setLang(lang);
  };

  getInfoPrep = () => {
    this.props.warnings.check();
  };

  getClinrec = () => {
    this.props.clinrecs.check();
  };

  resultRenderer = ({ name, level, tn, type }) => {
    return (
      <div>
        {name}
        {type === "TN" && <sup>TM</sup>}
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
    const { open, openCautions, openClearence, searchQuery, selectedDrug, selectedConflict, clinic } = this.state;
    let {
      currentPage,
      height,
      active_language,
      makeLiquids,
      isLiquidsOk,
      misLinkLogin: misDisabled,
      topview_disabled,
      bottomview_disabled,
    } = this.props.actions;
    let {
      drugs: { searchReady, searchRows, selectedRows, drug, deletedLiquids, deletedRows, listChanged, checkLiquids }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage },
      warnings: { warning, groups, cautionsTitle, cautions }, //warnings, warnGroups
      actions: {
        patientForm: { disease, co_disease },
        clinrecCheckerStep,
        isPrescriptFilled,
        patientPassport,
        drugStructure,
        checkData,
        disabled,
        buttonTexts,
      },
      patients,
    } = this.props;
    let selectedWarnings = warning[selectedDrug];
    let showPage = !!(this.props.router.values && this.props.router.values.page);
    // console.log('router', this.props.router);
    // let showPage2 = true
    const { id: patientId, email, fio } = patients.current;
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
    let showRevert = drug.size == 0 && deletedRows.length > 0;

    const texts = buttonTexts ? buttonTexts.text : null;

    return (
      <>
        {!disabled && !topview_disabled && (
          <Menu className={`ui top huge borderless tabular nomargin main menu fixed grey${showPage && " hidden"}`}>
            {!misDisabled && (
              <Menu.Item icon onClick={this.handleSidebar}>
                <Icon size="large" name="content" />
              </Menu.Item>
            )}

            <Menu.Menu position="right">
              <Responsive as={RouterLink} to="/patient/info" fireOnMount minWidth="481">
                <Menu.Item>
                  <Icon name={"bed"} className={patientId ? "" : " glowing"} />
                  {fio || "Пациент не выбран"}
                </Menu.Item>
              </Responsive>
              {!misDisabled && isDisease && (
                <Responsive
                  as={RouterLink}
                  to={`/clinrec/checker/${clinrecCheckerStep}`}
                  onClick={this.getClinrec}
                  fireOnMount
                  minWidth="481"
                >
                  <Menu.Item>
                    <Icon name="clipboard list" />
                    Клинреки
                  </Menu.Item>
                </Responsive>
              )}
              <Responsive fireOnMount as={RouterLink} to="/patient/info" maxWidth="480">
                <Menu.Item icon>
                  <Icon name="bed" size="large" />
                </Menu.Item>
              </Responsive>
              {!misDisabled && isDisease && (
                <Responsive
                  fireOnMount
                  as={RouterLink}
                  onClick={this.getClinrec}
                  to={`/clinrec/checker/${clinrecCheckerStep}`}
                  maxWidth="480"
                >
                  <Menu.Item icon>
                    <Icon name="clipboard list" size="large" />
                  </Menu.Item>
                </Responsive>
              )}
            </Menu.Menu>
          </Menu>
        )}

        <Sidebar.Pushable className={`${disabled ? "disabled" : ""}${topview_disabled ? " no-pushable-padding" : ""}`}>
          {deletedRows.length > 0 && (
            <Menu secondary className={`bottom fixed`}>
              <Menu.Item>Удалено строк: {deletedRows.length}</Menu.Item>
              <Menu.Item onClick={this.returnDeleted}>
                <Icon name="undo alternate" />
                Вернуть
              </Menu.Item>
              <Menu.Item onClick={this.clearDeleted}>
                <Icon name="delete" />
                Удалить насовсем
              </Menu.Item>
            </Menu>
          )}
          {disabled && showMainBottomMenu && (
            <Menu className={`bottom fixed menu three item huge main`}>
              <Menu.Item onClick={() => this.handleResetAll("all")}>Сбросить</Menu.Item>
              <Menu.Item disabled={false && ifFree} onClick={this.getInfoPrep}>
                Проверить
              </Menu.Item>
            </Menu>
          )}
          {!disabled && showMainBottomMenu && !bottomview_disabled && (
            <Menu className={`bottom fixed menu three item huge main`}>
              <Modal
                closeIcon
                onClose={() => this.setOpen(false, "openClearence")}
                onOpen={() => this.setOpen(true, "openClearence")}
                open={openClearence}
                trigger={<Menu.Item>Сбросить</Menu.Item>}
              >
                <Modal.Header>{"Какие данные вы хотите очистить?"}</Modal.Header>
                <Modal.Content>
                  <Header as="h3" content="Можно очистить:" />
                  <List>
                    <List.Item>Только данные по пациенту, включая текущий лист назначений и анамнез</List.Item>
                    <List.Item>Лист назначений полностью</List.Item>
                    <List.Item>Все выбранные данные, включая клинику, пациента и лист назначений</List.Item>
                  </List>
                </Modal.Content>
                <Modal.Actions>
                  <Button content="Очистить все" onClick={() => this.handleResetAll("all")} negative />
                  <Button
                    content="Лист назначений"
                    labelPosition="right"
                    icon="list"
                    onClick={() => this.handleResetAll("list")}
                    color="black"
                  />
                  <Button
                    content="Данные пациента"
                    labelPosition="right"
                    icon="user"
                    onClick={() => this.handleResetAll("patient")}
                    primary
                  />
                </Modal.Actions>
              </Modal>
              <Menu.Item disabled={false && ifFree} onClick={this.getInfoPrep}>
                Проверить
              </Menu.Item>
              {listChanged ? (
                cautionsTitle ? (
                  <Modal
                    onClose={() => this.setOpen(false, "openCautions")}
                    onOpen={() => this.setOpen(true, "openCautions")}
                    open={openCautions}
                    trigger={<Menu.Item>Назначить</Menu.Item>}
                  >
                    <Modal.Header>{cautionsTitle}</Modal.Header>
                    <Modal.Content>
                      {cautions.length > 0 &&
                        cautions.map((item, i) => {
                          return (
                            <Message negative>
                              <Message.Header>{item}</Message.Header>
                            </Message>
                          );
                        })}
                    </Modal.Content>
                    <Modal.Actions>
                      <Button color="black" onClick={() => this.setOpen(false, "openCautions")}>
                        Отмена
                      </Button>
                      <Button
                        content="Продолжить"
                        labelPosition="right"
                        icon="checkmark"
                        onClick={() => this.saveList()}
                        positive
                      />
                    </Modal.Actions>
                  </Modal>
                ) : (
                  <Menu.Item onClick={() => this.saveList()}>Назначить</Menu.Item>
                )
              ) : (
                <Menu.Item onClick={() => this.goRecipe()}>Выписать</Menu.Item>
              )}
            </Menu>
          )}

          <Modal open={false && !drugStructure.clinic_id}>
            <Modal.Header>Выберите клинику</Modal.Header>
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
                    placeholder="Клиника"
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
                content="Выбрать"
                labelPosition="right"
                disabled={!clinic}
                icon="checkmark"
                onClick={() => this.choseClinic()}
                primary
              />
            </Modal.Actions>
          </Modal>

          {(makeLiquids || !checkLiquids) && (
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item onClick={this.resetLiquids}>Сбросить растворы</Menu.Item>
              <Menu.Item disabled={!isLiquidsOk} onClick={this.confirmLiquids}>
                Применить
              </Menu.Item>
            </Menu>
          )}
          <Sidebar
            width="very wide"
            direction="right"
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
              <Menu.Item as={RouterLink} to="/patient/list">
                <Icon name="address book" />
                Пациенты
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
                  Клиники
                </Menu.Item>
              )}
              {false && (
                <Menu.Item disabled as={RouterLink} to="/profile/show">
                  <Icon name="user md" />
                  Профиль
                </Menu.Item>
              )}
              {false && (
                <div>
                  <Menu.Item disabled>
                    <Icon name="list ul" />
                    Текущие назначения
                  </Menu.Item>
                  <Menu.Item disabled>
                    <Icon name="clipboard list" />
                    История назначений
                  </Menu.Item>
                  <Dropdown
                    disabled
                    item
                    text={
                      active_language == "ru" ? (
                        <>
                          Русский <Flag name="ru" />
                        </>
                      ) : (
                        <>
                          English <Flag name="gb" />
                        </>
                      )
                    }
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
                  <Menu.Item disabled>
                    <Icon name="book" />
                    Инструкция
                  </Menu.Item>
                  <Menu.Item disabled>
                    <Icon name="chat" />
                    Подсказки
                  </Menu.Item>
                </div>
              )}
              {/*<Menu.Item>
              <Icon name='user' />
              Поделиться
            </Menu.Item>*/}
              <Menu.Item onClick={this.logout}>
                <Icon name="sign-out" />
                Выход
              </Menu.Item>
            </Sidebar>
          )}

          <Sidebar.Pusher dimmed={open || showPage} className="pusherwrapper">
            {!disabled && !topview_disabled && (
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
                      noResultsMessage="Ничего не найдено."
                      results={searchRows}
                      value={searchQuery}
                      resultRenderer={this.resultRenderer}
                      resultClassName="result-wrapper"
                      icon={
                        <Icon
                          name="pencil"
                          style={{ cursor: "pointer", "pointer-events": "all" }}
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
                  !topview_disabled && (
                    <Segment basic>
                      <Message info>
                        <Icon name="info" />
                        Внесите лекарственные препараты с помощью строки поиска наверху или&nbsp;{" "}
                        <a
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => this.setState({ manualDrugInputDialog: true, manualDrugInputText: "" })}
                        >
                          напишите их свободным текстом
                        </a>
                      </Message>
                    </Segment>
                  )
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
          <Modal.Header>Введите препараты</Modal.Header>
          <Modal.Content>
            <Form>
              <TextArea
                autoFocus
                rows={4}
                name="drugs"
                value={this.state.manualDrugInputText}
                placeholder="Можно указать несколько препаратов с дозировками, система попытается их распознать"
                onChange={(e) => this.setState({ manualDrugInputText: e.target.value })}
              />
            </Form>
          </Modal.Content>
          <Modal.Actions style={{ display: "flex", justifyContent: "space-between" }}>
            <Button color="red" onClick={() => this.setState({ manualDrugInputDialog: false })}>
              Отмена
            </Button>
            <Button color="blue" onClick={this.detectManualDrugInput}>
              Распознать
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}
export default Main;
