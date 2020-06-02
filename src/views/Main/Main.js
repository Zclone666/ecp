import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import Search from '../../components/Search'

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
      selectedDrug: null,

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

  handleResultSelect = (e, { result }) => {
    this.props.db.selectedRows = _.unionWith(this.props.db.selectedRows, [{ ...result }], (a, b) => a.id === b.id);
    this.setState({ searchQuery: '' })
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ searchQuery: value })
    if(value.length > 1){
      this.props.db.searchReady = false
      this.props.db.getSearch(value)
    }

  }

  getInfoPrep = () => {
    this.props.db.getInfoPrep()
  }

  resultRenderer = ({ name, level, tn }) => {
    return <div>{name}{tn && <sup>TM</sup>}</div>
  }

  render() {
    const { open, searchQuery, selectedDrug } = this.state
    let { currentPage, height } = this.props.actions
    let { searchReady, searchRows, selectedRows, warnings } = this.props.db
    let selectedWarnings = warnings[selectedDrug]
    return (
      <>
        <Menu className="ui top huge borderless tabular nomargin main menu fixed grey">

          <Menu.Item icon onClick={this.handleSidebar}>
            <Icon size='large' name='content' color='blue' />
          </Menu.Item>


          <Menu.Menu position='right'>
            <Menu.Item>
              <Button basic color='blue'>
                <Icon name='user' />
                Данные пациента
              </Button>
            </Menu.Item>
          </Menu.Menu>

        </Menu>

        <Sidebar.Pushable>
          <Sidebar animation='overlay' visible={open} as={Menu} vertical size='huge'>

            <Menu.Item onClick={this.logout}>
              <Icon name='sign-out' />
              Выход
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={open}>
            <Grid>
              <Grid.Column width={16} style={{ paddingBottom: 0 }}>
                <Segment basic>
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
              </Grid.Column>
              <Grid.Column width={16} style={{ paddingTop: 0 }}>
                {selectedRows.length > 0 ?

                  <List divided selection verticalAlign='middle' size='big'>
                    {selectedRows.map(( drug, i ) => {
                      let { name, level, tn } = drug
                      let currWarning = (selectedWarnings && selectedWarnings[drug.id]) || {}
                      let hasWarning = warnings[drug.id] && !_.isEmpty(warnings[drug.id])
                      console.log('warnings[drug.id]', warnings[drug.id]);
                      let maxItem = _.maxBy(_.toArray(warnings[drug.id]), function(o){ return o.value; });

                      console.log('maxItem', maxItem);
                      return(
                        <List.Item key={`drug_${i}`}>
                          <List.Content floated='right'>
                            <Responsive fireOnMount as={Button.Group} vertical basic color='blue' maxWidth='480'>
                              <Button icon>
                                <Icon name='ellipsis horizontal' />
                              </Button>
                            </Responsive>
                            <Responsive fireOnMount as={Button.Group} basic color='blue' minWidth='481'>
                              <Button icon>
                                <Icon name='tint' />
                              </Button>
                              <Button icon>
                                <Icon name='font' />
                              </Button>
                              <Button icon>
                                <Icon name='delete' />
                              </Button>
                            </Responsive>
                          </List.Content>
                          {(currWarning && currWarning.valuecolor) ?
                            <div className='left floated content arrowBg' style={{ backgroundColor: currWarning.valuecolor }} >
                              <List.Icon
                                name='arrow alternate circle right'
                                style={{ color: '#FFF' }}
                                size='large'
                                onClick={() => this.setState({ selectedDrug: drug.id })}
                              />
                            </div>
                            :
                            <div className='left floated content arrowBg none'></div>
                          }
                          {hasWarning ?
                            <List.Icon name='warning circle' style={{ color: maxItem.valuecolor }} size='large' onClick={() => this.setState({ selectedDrug: drug.id })} />
                            :
                            <List.Icon name='warning circle' size='large' style={{ color: 'transparent' }} />
                          }

                          <List.Content className='ui feed large'>
                            <Feed.Event>
                              <Feed.Content>
                                <Feed.Summary>
                                  <span className='underlined'>{name}</span>{tn && <span><sup>TM</sup></span>}
                                  <Feed.Date>внутривенное введение, 1 мл</Feed.Date>
                                </Feed.Summary>
                                <Feed.Meta>
                                  р-р для в/в и в/м введ 0.1 % (1 мг/мл) (ампула 1 мл)
                                </Feed.Meta>
                              </Feed.Content>
                            </Feed.Event>
                          </List.Content>
                        </List.Item>
                      )
                    })}
                  </List>
                  :
                  <Segment basic>
                    <Message info>
                      <Icon name='info' />
                      Внесите лекарственные препараты с помощью строки поиска наверху
                    </Message>
                  </Segment>
                }
              </Grid.Column>
            </Grid>
            <Segment basic>
              <Button onClick={this.getInfoPrep}>Получить</Button>
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>

      </>



    );
  }
};
export default Main
