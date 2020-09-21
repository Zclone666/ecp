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
  List,
  Feed,
  Button,
  Responsive,
  Grid
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions', 'drugs', 'warnings', 'dosages')
@observer
class Main extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      showPage: false,

      isLoading: false,
      searchQuery: ''
    }
    this.contextRef = createRef()
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

  getInfoPrep = () => {
    this.props.warnings.check()
  }

  resultRenderer = ({ name, level, tn, type }) => {
    return <div>{name}{type === 'TN' && <sup>TM</sup>}</div>
  }

  componentDidMount(){
    setTimeout(() => {
      this.setState({ showPage: !!(this.props.router.values && this.props.router.values.page) })
    }, 100)

    //console.log('HERE');
  }

  render() {
    const { open, searchQuery, selectedDrug, selectedConflict } = this.state
    let { currentPage, height } = this.props.actions
    let {
      drugs: { searchReady, searchRows, selectedRows, drug }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage },
      warnings: { warning, groups }, //warnings, warnGroups
    } = this.props
    let selectedWarnings = warning[selectedDrug]
    let showPage = !!(this.props.router.values && this.props.router.values.page)
    // console.log('router', this.props.router);
    return (
      <>
        <Menu className={`ui top huge borderless tabular nomargin main menu fixed grey${showPage && ' hidden'}`}>

          <Menu.Item icon onClick={this.handleSidebar}>
            <Icon size='large' name='content' />
          </Menu.Item>


          <Menu.Menu position='right'>
            <Responsive fireOnMount as={Menu.Item} minWidth='481'>
              <Button as={RouterLink} to='/patient/new'>
                <Icon name='bed' />
                Данные пациента
              </Button>
            </Responsive>
            <Responsive fireOnMount as={RouterLink} to='/patient/new' maxWidth='480'>
              <Menu.Item icon>
                <Icon name='bed' size='large' />
              </Menu.Item>
            </Responsive>
          </Menu.Menu>

        </Menu>


        <Sidebar.Pushable>

          {drug.size > 0 &&
            <Menu className="bottom fixed menu three item huge main">
              <Menu.Item color='red' onClick={this.handleResetAll}>
                Сбросить
              </Menu.Item>
              <Menu.Item onClick={this.getInfoPrep}>
                Проверить
              </Menu.Item>
              <RouterLink className='item primary' to='/recipe/new'>
                Выписать
              </RouterLink>
            </Menu>
          }
          <Sidebar
            width='very wide'
            direction='right'
            animation='overlay'
            visible={showPage}
            vertical
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <Page />
          </Sidebar>
          <Sidebar style={{ paddingTop: '3.6em' }} animation='overlay' onHide={() => this.handleSidebar('close')} visible={open} as={Menu} vertical size='huge'>
            <Menu.Item>
              <Icon name='address book' />
              Пациенты
            </Menu.Item>
            {/*<Menu.Item disabled>
              <Icon name='clipboard' />
              Назначения
            </Menu.Item>*/}
            <Menu.Item disabled>
              <Icon name='clipboard outline' />
              Рецепты
            </Menu.Item>
            <Menu.Item>
              <Icon name='globe' />
              Язык
            </Menu.Item>
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
                    results={searchRows}
                    value={searchQuery}
                    resultRenderer={this.resultRenderer}
                    resultClassName='result-wrapper'
                  />
                </Segment>
              </Menu.Item>
            </Menu>
            <div className='scrollwrapper'>
              <Grid>
                <Grid.Column width={16} style={{boxShadow: '0 0 9px #ccc', borderBottom: '1px solid #fff'}}>
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
                </Grid.Column>
                {drug.size > 0 &&
                  <Grid.Column width={16} style={{paddingTop: 0}}>
                    <Conflicts />
                  </Grid.Column>
                }

              </Grid>
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>

      </>



    );
  }
};
export default Main
