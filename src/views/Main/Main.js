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

@inject('router', 'db', 'actions')
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

  handleSidebar = () => {
    this.setState({ open: !this.state.open })
  };

  handleResultSelect = async (e, { result }) => {
    await this.props.db.selectFromSearch(result)
    this.setState({ searchQuery: '' })
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ searchQuery: value })
    if(value.length > 1){
      this.props.db.searchReady = false
      this.props.db.getSearch(value)
    }

  }

  handleResetAll = () => {
    this.props.db.clearData(true)
  }

  getInfoPrep = () => {
    this.props.db.getInfoPrep()
  }

  resultRenderer = ({ name, level, tn }) => {
    return <div>{name}{tn && <sup>TM</sup>}</div>
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
    let { searchReady, searchRows, selectedRows, warnings, warnGroups } = this.props.db
    let selectedWarnings = warnings[selectedDrug]
    let showPage = !!(this.props.router.values && this.props.router.values.page)
    // console.log('router', this.props.router);
    return (
      <>
        <Menu className="ui top huge borderless tabular nomargin main menu fixed grey">

          <Menu.Item icon onClick={this.handleSidebar}>
            <Icon size='large' name='content' color='blue' />
          </Menu.Item>


          <Menu.Menu position='right'>
            <Menu.Item>
              <Button basic color='blue' as={RouterLink} to='/patient/new'>
                <Icon name='user' />
                Данные пациента
              </Button>
            </Menu.Item>
          </Menu.Menu>

        </Menu>


        <Sidebar.Pushable>
          <Menu className="ui fluid one item ui top huge text menu fixed menu searchwrapper">
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
          <Menu className="bottom fixed menu two item huge main">
            {selectedRows.length > 0 &&
              <Menu.Item color='red' onClick={this.handleResetAll}>
                Сбросить
              </Menu.Item>
            }
            {selectedRows.length > 0 &&
              <Menu.Item onClick={this.getInfoPrep}>
                Проверить
              </Menu.Item>
            }
          </Menu>
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
          <Sidebar animation='overlay' visible={open} as={Menu} vertical size='huge'>
            <Menu.Item>
              <Icon name='user' />
              Пациенты
            </Menu.Item>
            <Menu.Item>
              <Icon name='user' />
              Пациенты
            </Menu.Item>
            <Menu.Item>
              <Icon name='user' />
              Пациенты
            </Menu.Item>
            <Menu.Item onClick={this.logout}>
              <Icon name='sign-out' />
              Выход
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={open || showPage} className='pusherwrapper'>

            <div className='scrollwrapper'>
              <Grid>
                <Grid.Column width={16}>
                  {selectedRows.length > 0 ?
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
                {selectedRows.length > 0 &&
                  <Grid.Column width={16}>
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
