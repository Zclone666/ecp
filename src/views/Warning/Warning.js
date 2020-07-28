import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import WarningTab from '../../components/WarningTab'

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic
  // Icon,
  // Search,
  // Segment,
  // Message,
  // List,
  // Feed,
  // Button,
  // Responsive,
  // Grid
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class Warning extends Component {
  constructor(props){
    super(props)
    this.state = {
      activeIndex: 0
    }
    //this.contextRef = createRef()
  }

  errorReport = () => {


  }

  back = () => {
    this.props.router.push('/')

  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({ activeIndex })
  }

  get tabs(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups, warnIcons },
      router: { values }
    } = this.props

    // console.log(router);
    //
    // let values = {}

    let tabs = []
    let subjFrom = false
    let subjTo = false

    Array.from(warnings.data.values()).forEach(( warn, i ) => {
      if(selectedConflict){
        subjFrom = ( warn.type === selectedConflict )//_.find(warn.subjects, (o) => { return o.drugkey === selectedConflict; })
      }else{
        subjFrom = _.find(warn.subjects, (o) => { return o.drugkey === selectedDrug; })
      }
      subjTo = _.find(warn.subjects, (o) => { return o.drugkey === values.page; })
      //console.log({ subjFrom, subjTo });
      if( subjFrom && subjTo ) tabs.push(warn)
    })
    return tabs
  }

  renderTabs(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        getElement
      },
      db: { selectedRows, warnings, warnGroups, warnIcons }
    } = this.props

    return this.tabs.map(( warn, i ) => {
      let interaction = getElement('interaction', warn.value)
      let trust = getElement('trust', warn.trust)
      return {
        menuItem: (
          <Menu.Item key={'messages'+i} style={{ backgroundColor: warn.color }} >
            {trust.substring(0, 1).toUpperCase()}
          </Menu.Item>
        ), render: () => (
          <Tab.Pane style={{ backgroundColor: warn.color, textAlign: 'center' }}>
            <Statistic inverted size='small'>
              <Statistic.Label>{interaction}</Statistic.Label>
              <Statistic.Value text>
                {trust}
              </Statistic.Value>
            </Statistic>
          </Tab.Pane>
        )
      }
    })

  }

  render() {
    let {
      activeIndex
    } = this.state

    return (
      <>
        <Menu className="bottom fixed menu two item huge main">
          <Menu.Item color='red' onClick={this.back}>
            Назад
          </Menu.Item>
          <Menu.Item onClick={this.errorReport}>
            Сообщить об ошибке
          </Menu.Item>
        </Menu>

        <div className='scrollwrapper'>
          <Tab
            menu={{ inverted: true, widths: this.tabs.length || 1, attached: 'top' }}
            panes={this.renderTabs()}
            activeIndex={activeIndex}
            onTabChange={this.handleTabChange}
          />
          <WarningTab tab={this.tabs[activeIndex]} />
        </div>

      </>



    );
  }
};
export default Warning
