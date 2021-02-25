import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import Search from '../../components/Search'
import Drugs from '../../components/Drugs'
import Conflicts from '../../components/Conflicts'

import Page from '../Page'

import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  Dropdown,
  Button,
  Responsive,
  Grid,
  Modal,
  Flag
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'recipes', 'db', 'actions', 'drugs', 'warnings', 'dosages', 'diseases', 'clinrecs')
@observer
class Main extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      openCautions: false,
      showPage: false,

      isLoading: false,
      searchQuery: ''
    }
    this.contextRef = createRef()
  }

  setOpen = (openCautions) => {
    openCautions = openCautions || false
    this.setState({ openCautions })
  }

  logout = () => {
    this.props.actions.logout()
  }


  handleSidebar = (x) => {
    this.setState({ open: (x === 'close' ? false : !this.state.open) })
  };

  handleResultSelect = async (e, { result }) => {
    await this.props.drugs.selectFromSearch(result)
    this.setState({ searchQuery: '' })
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ searchQuery: value })
    if(value.length > 1){
      this.props.drugs.searchReady = false
      this.props.drugs.search(value)
    }

  }

  handleResetAll = () => {
    if(window.confirm('Сбросить все?')) this.props.db.clearData(true)
  }

  changeLang = (lang) => {
    this.props.actions.setLang(lang)
  }

  getInfoPrep = () => {
    this.props.warnings.check()
  }

  getClinrec = () => {
    this.props.clinrecs.check()
  }

  resultRenderer = ({ name, level, tn, type }) => {
    return <div>{name}{type === 'TN' && <sup>TM</sup>}</div>
  }

  resetLiquids = () => {
    this.props.drugs.resetGroups()
    this.props.actions.makeLiquids = false
  }

  confirmLiquids = () => {
    this.props.drugs.makeLiquids()
    this.props.actions.makeLiquids = false
  }

  goRecipe = () => {
    this.setOpen(false)
    this.props.router.push('/recipe/new')
  }
  saveList = () => {
    let { isPrescriptFilled } = this.props.actions
    if( isPrescriptFilled ){
      this.props.recipes.saveList()
      this.setOpen(false)
    }else{
      // this.props.recipes.saveList()
      this.props.router.push('/prescript/fill')
      this.setOpen(false)
    }

  }

  componentDidMount(){
    setTimeout(() => {
      this.setState({ showPage: !!(this.props.router.values && this.props.router.values.page) })
    }, 100)

    //console.log('HERE');
  }

  render() {
    const { open, openCautions, searchQuery, selectedDrug, selectedConflict } = this.state
    let { currentPage, height, active_language, makeLiquids, isLiquidsOk } = this.props.actions
    let {
      drugs: { searchReady, searchRows, selectedRows, drug, listChanged, checkLiquids }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage },
      warnings: { warning, groups, cautionsTitle, cautions }, //warnings, warnGroups
      actions: { patientForm: { disease, co_disease }, clinrecCheckerStep, isPrescriptFilled, patientPassport }
    } = this.props
    let selectedWarnings = warning[selectedDrug]
    let showPage = !!(this.props.router.values && this.props.router.values.page)
    // console.log('router', this.props.router);
    // let showPage2 = true
    const {
      id: patientId,
      email,
      fio
    } = patientPassport
    let isDisease = disease.length > 0 || co_disease.length > 0
    return (
      <>
        <Menu className={`ui top huge borderless tabular nomargin main menu fixed grey${showPage && ' hidden'}`}>

          <Menu.Item icon onClick={this.handleSidebar}>
            <Icon size='large' name='content' />
          </Menu.Item>


          <Menu.Menu position='right'>
            <Responsive as={RouterLink} to='/patient/info' fireOnMount minWidth='481'>
              <Menu.Item>
                <Icon name={'bed' + (patientId ? '' : ' glowing')} />
                {( fio && fio.length > 2 ) ? fio : 'Пациент не выбран'}
              </Menu.Item>
            </Responsive>
            {isDisease && <Responsive as={RouterLink} to={`/clinrec/checker/${clinrecCheckerStep}`} onClick={this.getClinrec} fireOnMount minWidth='481'>
              <Menu.Item>
                <Icon name='clipboard list' />
                Клинреки
              </Menu.Item>
            </Responsive>}
            <Responsive fireOnMount as={RouterLink} to='/patient/info' maxWidth='480'>
              <Menu.Item icon>
                <Icon name='bed' size='large' />
              </Menu.Item>
            </Responsive>
            {isDisease && <Responsive fireOnMount as={RouterLink} onClick={this.getClinrec} to={`/clinrec/checker/${clinrecCheckerStep}`} maxWidth='480'>
              <Menu.Item icon>
                <Icon name='clipboard list' size='large' />
              </Menu.Item>
            </Responsive>}
          </Menu.Menu>

        </Menu>


        <Sidebar.Pushable>

          {(!(makeLiquids || !checkLiquids) && drug.size > 0) &&
            <Menu className="bottom fixed menu three item huge main">
              <Menu.Item onClick={this.handleResetAll}>
                Сбросить
              </Menu.Item>
              <Menu.Item onClick={this.getInfoPrep}>
                Проверить
              </Menu.Item>
              {( listChanged ?
                (cautionsTitle ?
                  <Modal
                    onClose={() => this.setOpen(false)}
                    onOpen={() => this.setOpen(true)}
                    open={openCautions}
                    trigger={<Menu.Item>
                      Назначить
                    </Menu.Item>}
                  >
                    <Modal.Header>{cautionsTitle}</Modal.Header>
                    <Modal.Content>
                      {cautions.length > 0 && cautions.map((item, i) => {
                        return(
                          <Message negative>
                            <Message.Header>{item}</Message.Header>
                          </Message>
                        )
                      })}
                    </Modal.Content>
                    <Modal.Actions>
                      <Button color='black' onClick={() => this.setOpen(false)}>
                        Отмена
                      </Button>
                      <Button
                        content="Продолжить"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => this.saveList()}
                        positive
                      />
                    </Modal.Actions>
                  </Modal>
                  :
                  <Menu.Item onClick={() => this.saveList()}>
                    Назначить
                  </Menu.Item>)
                  :
                  <Menu.Item onClick={() => this.goRecipe()}>
                    Выписать
                  </Menu.Item>
                )

              }


            </Menu>
          }
          {(makeLiquids || !checkLiquids) &&
            <Menu className="bottom fixed menu two item huge main">
              <Menu.Item onClick={this.resetLiquids}>
                Сбросить растворы
              </Menu.Item>
              <Menu.Item disabled={!isLiquidsOk} onClick={this.confirmLiquids}>
                Применить
              </Menu.Item>
            </Menu>
          }
          <Sidebar
            width='very wide'
            direction='right'
            animation='overlay'
            visible={showPage}
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <Page />
          </Sidebar>

          <Sidebar style={{ paddingTop: '3.6em' }} animation='overlay' onClick={() => this.handleSidebar('close')} onHide={() => this.handleSidebar('close')} visible={open} as={Menu} vertical size='huge'>
            <Menu.Item as={RouterLink} to='/patient/list'>
              <Icon name='address book' />
              Пациенты
            </Menu.Item>
            <Menu.Item disabled>
              <Icon name='list ul' />
              Текущие назначения
            </Menu.Item>
            <Menu.Item disabled>
              <Icon name='clipboard list' />
              История назначений
            </Menu.Item>
            <Dropdown disabled item text={(active_language == 'ru' ? <>Русский <Flag name='ru' /></> : <>English <Flag name='gb' /></>)}>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => this.changeLang('en')}><Flag name='gb' />English</Dropdown.Item>
                <Dropdown.Item onClick={() => this.changeLang('ru')}><Flag name='ru' />Русский</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Menu.Item disabled>
              <Icon name='book' />
              Инструкция
            </Menu.Item>
            <Menu.Item disabled>
              <Icon name='chat' />
              Подсказки
            </Menu.Item>
            {/*<Menu.Item>
              <Icon name='user' />
              Поделиться
            </Menu.Item>*/}
            <Menu.Item onClick={this.logout}>
              <Icon name='sign-out' />
              Выход
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={open || showPage} className='pusherwrapper'>
            <Menu className="fluid one item ui top huge text menu searchwrapper" style={{margin: 0}}>
              <Menu.Item>
                <Segment basic className='fluid'>
                  <Search
                    fluid
                    size='huge'
                    height={height-130}
                    loading={!searchReady}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                      leading: true,
                    })}
                    noResultsMessage='Ничего не найдено.'
                    results={searchRows}
                    value={searchQuery}
                    resultRenderer={this.resultRenderer}
                    resultClassName='result-wrapper'
                  />
                </Segment>
              </Menu.Item>
            </Menu>
            <div className='scrollwrapper'>
                <Segment className='basic no-padding' width={16} style={{boxShadow: '0 0 9px #ccc', borderBottom: '1px solid #fff'}}>
                  {drug.size > 0 ?
                    <Drugs />
                    :
                    <Segment basic>
                      <Message info>
                        <Icon name='info' />
                        Внесите лекарственные препараты с помощью строки поиска наверху
                      </Message>
                    </Segment>
                  }
                </Segment>
                {drug.size > 0 &&
                  <Segment className='basic no-padding' basic width={16} style={{paddingTop: 0}}>
                    <Conflicts />
                  </Segment>
                }

            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>

      </>



    );
  }
};
export default Main
