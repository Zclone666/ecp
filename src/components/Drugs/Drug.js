import React from 'react';
import { inject, observer } from 'mobx-react';

import RouterLink from '../../router/a';

import {
  Menu,
  List,
  Feed,
  Button,
  Responsive,
  Icon,
  Popup
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router')
@observer
class Drug extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }
  getLF = () => {
    let { drug } = this.props
    this.props.db.getLF(drug)
    //this.props.db.GetDuration(drug)
    this.props.db.currDrug = { ...drug }
    // this.props.router.push('/concepts/dozes')
  }
  unselectDrug = () => {
    let { drug } = this.props
    this.props.db.unselectDrug(drug)
  }
  selectDrug = (e, drugId) => {
    e.preventDefault()
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups }
    } = this.props
    let selectedWarnings = warnings[drugId]
    let groups = []
    let drugs = []
    for( let key in selectedWarnings ){
      groups = _.unionWith(groups, [selectedWarnings[key].group], (a, b) => a === b);
      drugs = _.unionWith(drugs, [key], (a, b) => a === b);
    }
    // console.log({ groups, drugs });
    if( this.props.actions.selectedDrug === drugId ){
      this.props.actions.selectedDrug = null
      this.props.actions.selectedConflict = null
      this.props.actions.activeConflicts = []
      this.props.actions.activeDrugs = []
    }else{
      this.props.actions.selectedDrug = drugId
      this.props.actions.selectedConflict = null
      this.props.actions.activeConflicts = groups
      this.props.actions.activeDrugs = drugs
    }
    //return false
  }



  render(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups, drugsDosages, warnIcons },
      drug,
      active
    } = this.props
    //console.log('drug', drug);
    let selectedWarnings = warnIcons[selectedDrug]
    let { key, name, level, tn, type, dosage } = drug
    let drugDosages = drugsDosages.data.get(key) || {}
    //console.log('drugDosages', drugDosages);
    let names = drugDosages.names || {}
    let url = drugDosages.url || {}
    let currWarning = active//activeDrugs.includes(drug.key) && (selectedWarnings && warnGroups[selectedWarnings[drug.key].group] || warnGroups[selectedConflict])
    let hasWarning = warnIcons[drug.key] && !_.isEmpty(warnIcons[drug.key])
    let maxItem = warnIcons[drug.key] //_.maxBy(_.toArray(warnings[drug.key]), function(o){ return o.value; });
    let className = selectedDrug === drug.key ? 'selected' : ''
    className += ((selectedDrug === drug.key || active) || (!selectedDrug && !selectedConflict) )  ? '' : ' unused'

    let hasBorder = selectedDrug === drug.key && maxItem

    return(
      <List.Item className={className} style={{ borderLeftColor: hasBorder && maxItem.color || '#f3f3f2' }}>
        <List.Content floated='right'>
          {/*<Responsive fireOnMount as={Button.Group} vertical basic color='blue' maxWidth='480'>
            <Button icon>
              <Icon name='ellipsis horizontal' />
            </Button>
          </Responsive>
          */}
          <Responsive fireOnMount as={Button.Group} basic color='blue' minWidth='481'>
            <Button as={RouterLink} to={url} onClick={this.getLF} icon>
              <Icon name='tint' />
            </Button>
            <Button icon>
              <Icon name='font' />
            </Button>
            <Button icon>
              <Icon name='delete' onClick={this.unselectDrug} />
            </Button>
          </Responsive>
        </List.Content>
        {(currWarning && currWarning.color) ?
          <RouterLink to={'/warning/' + drug.key} className='left floated content arrowBg' style={{ backgroundColor: currWarning.color }} >
            <List.Icon
              name='arrow alternate circle right'
              style={{ color: '#FFF' }}
              size='large'
              onClick={() => {  }}
            />
          </RouterLink>
          :
          <RouterLink to={'/warning/' + drug.key} className='left floated content arrowBg none'>
            <List.Icon
              name='arrow alternate circle right'
              style={{ color: '#FFF' }}
              size='large'
            />
          </RouterLink>
        }
        {hasWarning ?
          <List.Icon name='warning circle' style={{ color: maxItem.color }} size='large' onClick={(e) => this.selectDrug(e, drug.key)} />
          :
          <List.Icon name='warning circle' size='large' style={{ color: 'transparent', textShadow: 'unset' }} />
        }
        <Responsive as={List.Content} className='ui feed large' fireOnMount minWidth='481'>

          <Feed.Event>
            <Feed.Content>
              <Feed.Summary>
                <span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}
                <Feed.Date>
                  {dosage.form && names[dosage.form]}
                  {(dosage.method && dosage.form) && ', '}
                  {names[dosage.method] || ''}
                </Feed.Date>
              </Feed.Summary>
              <Feed.Meta>

                {dosage.pack.dosage || ''}
                {(dosage.pack.dosage && dosage.pack.pack) && ', '}
                {dosage.pack.pack || ''}
              </Feed.Meta>
            </Feed.Content>
          </Feed.Event>
        </Responsive>
        <Responsive
          as={Popup}
          maxWidth='480'
          trigger={
            <List.Content className='ui feed large'>
              <Feed.Event>
                <Feed.Content>
                  <Feed.Summary>
                    <span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}
                    <Feed.Date>{names[dosage.method] || ''}</Feed.Date>
                  </Feed.Summary>
                  <Feed.Meta>
                    {dosage.pack.dosage || ''}
                    {(dosage.pack.dosage && dosage.pack.pack) && ', '}
                    {dosage.pack.pack || ''}
                  </Feed.Meta>
                </Feed.Content>
              </Feed.Event>
            </List.Content>
          }
          on='click'
        >
          <Popup.Content>
            <Menu secondary vertical>
              <Menu.Item  as={RouterLink} to='/concept/dozes' onClick={this.getLF}>
                <Icon name='tint' />
                Дозировки
              </Menu.Item>
              <Menu.Item>
                <Icon name='font' />
                Аналоги
              </Menu.Item>
              <Menu.Item onClick={this.unselectDrug}>
                <Icon name='delete' />
                Убрать из списка
              </Menu.Item>
              <Menu.Item>
                <Icon name='ellipsis horizontal' />
                Подробнее
              </Menu.Item>
            </Menu>
          </Popup.Content>
        </Responsive>

      </List.Item>

    )
  }

};
export default Drug
