import React, { Component, Fragment, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import {
  Segment,
  List,
  Message,
  Header,
  Icon,
  Popup,
  Divider
} from 'semantic-ui-react'
import _ from 'lodash';

@inject('router', 'db', 'actions', 'drugs', 'warnings')
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
      drugs: { drug, selectedRows },
      warnings: { info },
      router: { values },
      tab
    } = this.props

    const getDrug = (item) => {
      if(item.type === 'drug'){
        return drug.get(item.drugkey)
      }else if(['allergy', 'disease'].includes(item.type)){
        return _.find(patientForm[item.type], { key: item.drugkey });
      }else{
        return { name: info.names[item.drugkey] }
      }
    }

    //сортировка какой элемент идет первым плюс усовие, если оба совпадают
    let c = 0
    let arr = _.groupBy(tab.subjects, (x) => {
      let name = 'last'
      if(c < (tab.delimiter||1)){
        name = 'first'
      }
      c++
      return name
    })
    // console.log({arr});
    //console.log({warnInfo});

    let needIcon = (tab.id && tab.id.length > 0) && info.outcome[tab.id]
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
                  <List.Header>{item.subjectid ? info.names[item.subjectid] : drug.name}</List.Header>
                  {!!item.subjectid && drug.name}
                  </List.Content>
                </List.Item>
              )
            })}
            {tab.delimiter &&
              <List.Item key='100500'><Divider /></List.Item>
            }
            {((tab.id && tab.id.length > 0) && info.outcome[tab.id]) &&
              <List.Item key='2'>

                {info.outcome[tab.id].map(( outcome, d ) => {
                  return(
                    <Message size='tiny' key={'outcome'+d}>
                      <Message.Content>
                        {info.names[outcome]}
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
                    <List.Header>{item.subjectid ? info.names[item.subjectid] : drug.name}</List.Header>
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
              info.description[tab.id] && info.description[tab.id].map(( desc, d ) => {
                return(
                  <Segment vertical key={`desc_${d}`} dangerouslySetInnerHTML={{__html: info.names[desc]}} />

                )
              })
            }
            {(tab.id && tab.id.length > 0) &&
              <>
                {info.literature[tab.id] && <Header as='h3'>Источники</Header>}
                {info.literature[tab.id] && info.literature[tab.id].map(( lit, l ) => {
                  if( lit && info.urls[lit] ){
                    return(
                      <Segment vertical key={`lit_${l}`}>
                        <a href={info.urls[lit]} target='_blank'>{info.names[lit]} <Icon name='external alternate' /></a>
                      </Segment>
                    )
                  }
                  return(
                    <Segment vertical key={`lit_${l}`}>
                      {info.names[lit]}
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
