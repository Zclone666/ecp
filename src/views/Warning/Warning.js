import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'

import WarningTab from '../../components/WarningTab'

import {
  // Sidebar,
  Menu,
  Tab,
  Statistic,
  Dropdown,
  Icon,
  Segment
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class Warning extends Component {
  constructor(props){
    super(props)
    this.state = {
      activeIndex: 0,
      open: false
    }
    //this.contextRef = createRef()
  }

  errorReport = () => {


  }

  toggleOpen = () => {
    this.setState({ open: !this.st })
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

    let warnArr = _.orderBy(Array.from(warnings.data.values()), ['step'], ['asc']);
    let isConflict = !!_.find(warnGroups, { 'type': values.page });
    //console.log({isConflict, selectedDrug});
    warnArr.forEach(( warn, i ) => {
      if(selectedConflict){
        subjFrom = ( warn.type === selectedConflict )//_.find(warn.subjects, (o) => { return o.drugkey === selectedConflict; })
        subjTo = _.find(warn.subjects, (o) => { return o.drugkey === values.page; })
      }else if(isConflict && selectedDrug){
        //console.log({ selectedDrug, subj: warn.subjects});
        subjFrom = warn.type === values.page ? warn : false
        subjTo = _.find(warn.subjects, (o) => { return o.drugkey === selectedDrug; })
      }else{
        subjFrom = _.find(warn.subjects, (o) => { return o.drugkey === selectedDrug; })
        subjTo = _.find(warn.subjects, (o) => { return o.drugkey === values.page; })
      }

      //console.log({ subjFrom, subjTo });
      if( subjFrom && subjTo ) tabs.push(warn)
    })
    //console.log({tabs});
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
    let {
      activeIndex
    } = this.state

    //console.log({ length: this.tabs.length});

    let arr = this.tabs.length > 13 ? this.tabs.slice(0, 11) : this.tabs.slice(0, 12)

    return arr.map(( warn, i ) => {
      let interaction = getElement('interaction', warn.value)
      let trust = getElement('trust', warn.trust)
      return (
          <Menu.Item
            key={'tab'+i}
            active={i===activeIndex}
            style={{ backgroundColor: warn.color }}
            onClick={() => this.handleTabChange(null, { activeIndex: i })} >
            {trust.substring(0, 1).toUpperCase()}
          </Menu.Item>
        )
        // render: () => (
          // <Tab.Pane style={{ backgroundColor: warn.color, textAlign: 'center' }}>
          //   <Statistic inverted size='small'>
          //     <Statistic.Label>{interaction}</Statistic.Label>
          //     <Statistic.Value text>
          //       {trust}
          //     </Statistic.Value>
          //   </Statistic>
          // </Tab.Pane>
        // )

    })

  }
  renderMenuItems(){
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

    let arr = this.tabs.slice(11)
    // console.log({arr, tabs: this.tabs});

    return arr.map(( warn1, i ) => {
      let interaction = getElement('interaction', warn1.value)
      let trust = getElement('trust', warn1.trust)
      // console.log(i);
      return(
        <Dropdown.Item value={i+10} key={`tab${i+10}`} onClick={() => this.handleTabChange(null, { activeIndex: i+11 })}>
          <Icon name='circle' style={{ color: warn1.color }} />
          {trust.substring(0, 1).toUpperCase()}
        </Dropdown.Item>
      )
    })
  }

  render() {
    let {
      actions: {
        getElement
      }
    } = this.props
    let {
      activeIndex, open
    } = this.state
    let widths = this.tabs.length ? (this.tabs.length < 13 ? this.tabs.length : 12) : 1
    let warn = this.tabs[activeIndex]
    let interaction = getElement('interaction', warn.value)
    let trust = getElement('trust', warn.trust)
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
          <Menu widths={widths} attached='top' inverted style={{position: 'relative', zIndex: 105}}>
            {this.renderTabs()}
            {(this.tabs.length && this.tabs.length > 12) &&
              <div className={(activeIndex > 11) ? 'active item' : 'item'} style={{ backgroundColor: warn.color }}>
                <Dropdown
                  style={{textAlign: 'center'}}
                  icon='ellipsis horizontal'
                  fluid
                  scrolling

                >
                  <Dropdown.Menu direction='left'>
                    {this.renderMenuItems()}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            }
          </Menu>
          <Segment attached='bottom' style={{ backgroundColor: warn.color, textAlign: 'center' }}>
            <Statistic inverted size='small'>
              <Statistic.Label>{interaction}</Statistic.Label>
              <Statistic.Value text>
                {trust}
              </Statistic.Value>
            </Statistic>
          </Segment>

          <WarningTab tab={this.tabs[activeIndex]} />
        </div>

      </>



    );
  }
};
export default Warning
