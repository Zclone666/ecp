import React, { Component, Fragment, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import {
  Segment,
  List,
  Message,
  Header,
  Icon,
  Popup
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

    //сортировка какой элемент идет первым плюс усовие, если оба совпадают
    let c = 0
    let arr = _.groupBy(tab.subjects, (x) => {
      let name = 'last'
      if((values.page === x.drugkey || selectedDrug === x.drugkey) && c<1){
        c++
        name = 'first'
      }
      return name
    })
    // console.log({arr});
    //console.log({warnInfo});

    let needIcon = (tab.id && tab.id.length > 0) && warnInfo.outcome[tab.id]
    let icon = tab.icon || 'info'
    let popupText = icon === 'syringe' ? 'Фармокологическое взаимодействие' : 'Взаимодействие на уровне ферментов'
    // syringe - Фармокологическое взаимодействие
    // cloud upload - Взаимодействие на уровне ферментов

    return (
      <Segment basic>
        <Segment vertical className='warningcontainer'>
          <div className='arrowcontainer' style={{ borderColor: tab.color }}>
            {(arr.first && arr.first[0] && arr.first[0].arrow) &&
              <Icon
                className='toparrow'
                name='angle right'
                style={{ color: tab.color }}
                size='big'
              />
            }
            {needIcon && (icon === 'info' || icon === 'question' ?
              <div className='iconround' style={{ backgroundColor: tab.color }}>
                <Icon
                  name={icon}
                  style={{ color: '#FFF' }}
                  size='large'
                />
              </div>
              :
              <Popup content={popupText} on={['hover','click']} trigger={
                <div className='iconround' style={{ backgroundColor: tab.color }}>
                  <Icon
                    name={icon}
                    style={{ color: '#FFF' }}
                    size='large'
                  />
                </div>
              } />
            )}
            {(arr.last && arr.last[0] && arr.last[0].arrow) &&
              <Icon
                className='bottomarrow'
                name='angle right'
                style={{ color: tab.color }}
                size='big'
              />
            }
          </div>
          <List size='big'>
            {arr.first && arr.first.map(( item, i ) => {
              let drug = getDrug(item)
              return(
                <List.Item key='1'>
                  <List.Content>
                  <List.Header>{item.subjectid ? warnInfo.names[item.subjectid] : drug.name}</List.Header>
                  {!!item.subjectid && drug.name}
                  </List.Content>
                </List.Item>
              )
            })}
            {((tab.id && tab.id.length > 0) && warnInfo.outcome[tab.id]) && 
              <List.Item key='2'>

                {warnInfo.outcome[tab.id].map(( outcome, d ) => {
                  return(
                    <Message size='tiny' key={'outcome'+d}>
                      <Message.Content>
                        {warnInfo.names[outcome]}
                      </Message.Content>
                    </Message>
                  )
                })}
              </List.Item>
            }
            {arr.last && arr.last.map(( item, i ) => {
              let drug = getDrug(item)
              return(
                <List.Item key='3'>
                  <List.Content>
                    <List.Header>{item.subjectid ? warnInfo.names[item.subjectid] : drug.name}</List.Header>
                    {!!item.subjectid && drug.name}
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
                  <Segment vertical key={`desc_${d}`} dangerouslySetInnerHTML={{__html: warnInfo.names[desc]}} />

                )
              })
            }
            {(tab.id && tab.id.length > 0) &&
              <>
                {warnInfo.literature[tab.id] && <Header as='h3'>Источники</Header>}
                {warnInfo.literature[tab.id] && warnInfo.literature[tab.id].map(( lit, l ) => {
                  if( lit && warnInfo.urls[lit] ){
                    return(
                      <Segment vertical key={`lit_${l}`}>
                        <a href={warnInfo.urls[lit]} target='_blank'>{warnInfo.names[lit]} <Icon name='external alternate' /></a>
                      </Segment>
                    )
                  }
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
