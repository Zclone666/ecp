import React, { Component, Fragment, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import {
  Segment,
  List,
  Message,
  Header
} from 'semantic-ui-react'
import _ from 'lodash';

@inject('router', 'db', 'actions')
@observer
class WarningTab extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }

  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts,
        patientForm
      },
      db: { drugs, selectedRows, warnings, warnGroups, warnIcons, warnInfo },
      router: { values },
      tab
    } = this.props

    const getDrug = (item) => {
      if(item.type === 'drug'){
        return drugs.data.get(item.drugkey)
      }else if(['allergy', 'disease'].includes(item.type)){
        return _.find(patientForm[item.type], { key: item.drugkey });
      }else{
        return { name: warnInfo.names[item.drugkey] }
      }
    }

    let arr = _.groupBy(tab.subjects, (x) => (values.page === x.drugkey || selectedDrug === x.drugkey) ? 'first' : 'last');
    // console.log({arr});
    //console.log({warnInfo});
    return (
      <Segment basic>
        <Segment vertical className='warningcontainer'>
          <div className='arrowcontainer' style={{ borderColor: tab.color }}></div>
          <List size='big'>
            {arr.first && arr.first.map(( item, i ) => {
              let drug = getDrug(item)
              return(
                <List.Item key='1'>
                  <List.Content>
                  <List.Header>{warnInfo.names[item.subjectid]}</List.Header>
                  {drug.name}
                  </List.Content>
                </List.Item>
              )
            })}
            <List.Item key='2'>
              {(tab.id && tab.id.length > 0) &&
                warnInfo.outcome[tab.id] && warnInfo.outcome[tab.id].map(( outcome, d ) => {
                  return(
                    <Message size='tiny'>
                      <Message.Content>
                        {warnInfo.names[outcome]}
                      </Message.Content>
                    </Message>
                  )
                })
              }
            </List.Item>
            {arr.last && arr.last.map(( item, i ) => {
              let drug = getDrug(item)
              return(
                <List.Item key='3'>
                  <List.Content>
                    <List.Header>{warnInfo.names[item.subjectid]}</List.Header>
                    {drug.name}
                  </List.Content>
                </List.Item>
              )
            })}

          </List>
        </Segment>
        <Segment vertical>
          <Segment basic>
            {(tab.id && tab.id.length > 0) &&
              warnInfo.description[tab.id] && warnInfo.description[tab.id].map(( desc, d ) => {
                return(
                  <Segment vertical key={`desc_${d}`}>
                    {warnInfo.names[desc]}
                  </Segment>
                )
              })
            }
            {(tab.id && tab.id.length > 0) &&
              <>
                {warnInfo.literature[tab.id] && <Header as='h3'>Источники</Header>}
                {warnInfo.literature[tab.id] && warnInfo.literature[tab.id].map(( lit, l ) => {
                  return(
                    <Segment vertical key={`lit_${l}`}>
                      {warnInfo.names[lit]}
                    </Segment>
                  )
                })}
              </>
            }
          </Segment>
        </Segment>
      </Segment>
    )
  }

};
export default WarningTab
