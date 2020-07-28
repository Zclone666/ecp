import React, { Component, Fragment, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import {
  Segment,
  List,
  Message,
  Header
} from 'semantic-ui-react'

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
        activeConflicts
      },
      db: { drugs, selectedRows, warnings, warnGroups, warnIcons, warnInfo },
      tab
    } = this.props

    //console.log({warnInfo});
    return (
      <Segment basic>
        <Segment vertical className='warningcontainer'>
          <div className='arrowcontainer' style={{ borderColor: tab.color }}></div>
          <List size='big'>
            {tab.subjects && tab.subjects.map(( item, i ) => {
              let drug = item.type === 'drug' ? drugs.data.get(item.drugkey) : { name: warnInfo.names[item.drugkey] }
              if( i === 0 ){
                return(
                  <Fragment key='i'>
                    <List.Item key='1'>
                      <List.Content>
                      <List.Header>{warnInfo.names[item.subjectid]}</List.Header>
                      {drug.name}
                      </List.Content>
                    </List.Item>
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
                  </Fragment>
                )
              }else{
                return(
                  <List.Item key='3'>
                    <List.Content>
                      <List.Header>{warnInfo.names[item.subjectid]}</List.Header>
                      {drug.name}
                    </List.Content>
                  </List.Item>
                )
              }

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
