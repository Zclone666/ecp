import React, { Fragment } from 'react';
import { inject, observer } from 'mobx-react';

import { useDrag } from 'react-dnd'

import RouterLink from '../../router/a';

import {
  Menu,
  List,
  Feed,
  Button,
  Responsive,
  Icon,
  Popup,
  Dropdown
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'router', 'drugs', 'warnings', 'dosages', 'analogs', 'druginfo')
@observer
class Drug extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      open: true,
    }
  }
  getLF = async () => {
    let {
      drugs: { current }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage },
      warnings: { warning, groups }, //warnings, warnGroups
      router: { location },
      drug
    } = this.props
    this.props.drugs.current = { ...drug }
    // await getDosageParams(location.pathname)
    await this.props.dosages.get(drug)
    //this.props.db.GetDuration(drug)

    // this.props.router.push('/concepts/dozes')
  }
  getAnalog = async () => {
    let {
      drug
    } = this.props
    await this.props.analogs.get(drug)
  }

  getInfo = async () => {
    let {
      drug
    } = this.props
    await this.props.druginfo.get(drug)
  }

  unselectDrug = () => {
    let { drug } = this.props
    this.props.drugs.unselectDrug(drug)
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
      drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage },
      warnings: { warning, groups: warnGroups }, //warnings, warnGroups
    } = this.props
    let selectedWarnings = warning[drugId]
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
      drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage: dose },
      warnings: { warning, groups, icons: warnIcons }, //warnings, warnGroups, warnIcons
      drug,
      active
    } = this.props
    //console.log('drug', drug);
    let selectedWarnings = warnIcons[selectedDrug]
    let { key, name, level, tn, type, dosage } = drug
    let drugDosages = dose.get(key) || {}
    let hasWarnings = warning.size > 0
    //console.log('drugDosages', drugDosages);
    let names = drugDosages.names || {}
    let nameshort = drugDosages.nameshort || {}
    let url = drugDosages.url || {}
    let currWarning = active//activeDrugs.includes(drug.key) && (selectedWarnings && warnGroups[selectedWarnings[drug.key].group] || warnGroups[selectedConflict])
    let hasWarning = warnIcons[drug.key] && !_.isEmpty(warnIcons[drug.key])
    let maxItem = warnIcons[drug.key] //_.maxBy(_.toArray(warnings[drug.key]), function(o){ return o.value; });
    let className = selectedDrug === drug.key ? 'selected' : ''
    className += ((selectedDrug === drug.key || active) || (!selectedDrug && !selectedConflict) )  ? '' : ' unused'

    let hasBorder = selectedDrug === drug.key && maxItem
    // const [{ opacity }, drag] = useDrag({
    //   item: { name, type },
    //   collect: (monitor) => ({
    //     opacity: monitor.isDragging() ? 0.4 : 1,
    //   }),
    // })
    // console.log({currWarning});
    return(
      <List.Item className={`${!hasWarnings ? 'nowarnings ' : ''}${className}`}>
        <div className='border' style={{ backgroundColor: hasBorder && maxItem.color || 'transparent' }} />
        <List.Content floated='right'>
          {/*<Responsive fireOnMount as={Button.Group} vertical basic color='blue' maxWidth='480'>
            <Button icon>
              <Icon name='ellipsis horizontal' />
            </Button>
          </Responsive>
          */}
          <Responsive fireOnMount as={Button.Group} minWidth='481'>
            <Button as={RouterLink} to={url} onClick={this.getLF} icon>
              <Icon name='tint' />
            </Button>
            <Button icon as={RouterLink} to={`/analog/${drug.key}`} onClick={this.getAnalog}>
              <Icon name='font' />
            </Button>
            <Button icon>
              <Icon name='delete' onClick={this.unselectDrug} />
            </Button>
          </Responsive>
        </List.Content>
        <div className='arrowholder'>
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
        </div>
        {hasWarnings && (hasWarning ?
          <List.Icon name='warning circle' style={{ color: maxItem.color }} size='large' onClick={(e) => this.selectDrug(e, drug.key)} />
          :
          <List.Icon name='warning circle' size='large' style={{ color: 'transparent', textShadow: 'unset' }} />
        )}
        <Responsive as={List.Content} className='ui feed large' fireOnMount minWidth='481'>

          <Feed.Event>
            <Feed.Content>
              <Feed.Summary>
                <RouterLink to={`/druginfo/${drug.key}`} onClick={this.getInfo} className='underlined'>{name}</RouterLink>{type === 'TN' && <span><sup>TM</sup></span>}
                <Feed.Date>
                  {dosage.form && (nameshort[dosage.form] || names[dosage.form])}{' '}
                  {(dosage.pack.dosage && (dosage.pack.dosage.short || dosage.pack.dosage.full)) && ', '}
                  {(dosage.pack.dosage && (dosage.pack.dosage.short || dosage.pack.dosage.full)) || ''}
                </Feed.Date>
              </Feed.Summary>
              <Feed.Meta>

                
                {/*(dosage.pack.dosage && (dosage.pack.dosage.short || dosage.pack.dosage.full) && dosage.pack.pack && (dosage.pack.pack.short || dosage.pack.pack.full)) && ', '*/}
                {/*(dosage.pack.pack && (dosage.pack.pack.short || dosage.pack.pack.full)) || ''*/}
                {/*((dosage.pack.pack || dosage.pack.dosage) && dosage.form) && ', '*/}
                {/*(nameshort[dosage.method] || names[dosage.method]) && ', '*/}
                {(nameshort[dosage.method] || names[dosage.method]) || ''}
              </Feed.Meta>
            </Feed.Content>
          </Feed.Event>
        </Responsive>
        <Responsive
          as={Fragment}
          maxWidth='480'
        >
            <List.Content className='ui feed large' as={Dropdown} floating fluid icon={null}
              trigger={
                <Feed.Event>
                  <Feed.Content>
                    <Feed.Summary>
                      <span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}
                    </Feed.Summary>
                    
                    <Feed.Meta>
                      {dosage.form && (nameshort[dosage.form] || names[dosage.form])}{' '}
                      {(dosage.pack.dosage && (dosage.pack.dosage.short || dosage.pack.dosage.full)) && ', '}
                      {(dosage.pack.dosage && (dosage.pack.dosage.short || dosage.pack.dosage.full)) || ''}
                      {(nameshort[dosage.method] || names[dosage.method]) && ', '}
                      {(nameshort[dosage.method] || names[dosage.method]) || ''}
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item
                  icon='tint'
                  as={RouterLink}
                  to={url}
                  onClick={this.getLF}
                  text='Дозировка'
                />
                <Dropdown.Item
                  icon='font'
                  as={RouterLink}
                  to={`/analog/${drug.key}`}
                  onClick={this.getAnalog}
                  text='Аналоги'
                />
                <Dropdown.Item
                  icon='ellipsis horizontal'
                  as={RouterLink} 
                  to={`/druginfo/${drug.key}`}
                  text='Подробнее'
                  onClick={this.getInfo}
                />
                <Dropdown.Item
                  icon='delete'
                  onClick={this.unselectDrug}
                  text='Убрать из списка'
                />
              </Dropdown.Menu>
            </List.Content>


        </Responsive>

      </List.Item>

    )
  }

};
export default Drug
