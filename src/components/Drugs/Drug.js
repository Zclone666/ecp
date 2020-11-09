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

@inject('db', 'actions', 'router', 'tools', 'drugs', 'warnings', 'dosages', 'analogs', 'druginfo')
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

  renderRules(){
    let {
      dosages: { getFromBase },
      tools: { names, shortnames, round },
      drug: {
        freq,
        duration,
        calc,
        dosage,
        helpers
      },
      drug,
      actions: { UIText }
    } = this.props

    let arr = []

    // console.log({drug});

    if(calc.fullDosage && helpers.dosage && helpers.dosage.id ){
      let dosageValue = getFromBase(drug.calc.dosageUnit, calc.fullDosage)
      let dosageName = shortnames[drug.calc.dosageUnit] || names[drug.calc.dosageUnit]
      arr.push(`${_.map(dosageValue, (dos) => parseFloat(round(dos))).join(' + ')} ${dosageName}`)
    }

    if(freq && UIText.freq[freq]) arr.push(UIText.freq[freq])
    if(duration && UIText.duration[duration]) arr.push(UIText.duration[duration])

    return {
      empty: arr.length < 1,
      text: arr.join(', ')
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
      drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
      dosages: { dosage: dose },
      warnings: { warning, groups, icons: warnIcons }, //warnings, warnGroups, warnIcons
      drug,
      active,
      style,
      minus,
      onRemove,
      canDrag
    } = this.props
    //console.log('drug', drug);
    let selectedWarnings = warnIcons[selectedDrug]
    let { key, name, level, tn, type, dosage, helpers } = drug
    let drugDosages = dose.get(key) || {}
    let hasWarnings = warning.size > 0
    //console.log('drugDosages', drugDosages);
    let names = drugDosages.names || {}
    let nameshort = drugDosages.nameshort || {}
    let url = drugDosages.url || '/concept/dozes'
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

    let resultStyle = { ...(style || {}), ...(!canDrag ? { cursor: 'default' } : { cursor: 'move' }) }

    let rules = this.renderRules()
    // console.log({style})
    return(
      <List.Item style={resultStyle} className={`${!hasWarnings ? 'nowarnings ' : ''}${className}`}>

        <List.Content floated='right'>
          <Responsive fireOnMount as={Button.Group} minWidth='481'>
            <Button disabled={drug.group !== 0} as={RouterLink} to={url} onClick={this.getLF} icon>
              <Icon name='tint' />
            </Button>
            <Button disabled={drug.group !== 0} icon as={RouterLink} to={`/analog/${drug.key}`} onClick={this.getAnalog}>
              <Icon name='font' />
            </Button>
            <Button icon>
              <Icon name='delete' onClick={this.unselectDrug} />
            </Button>
            {minus && <Button icon>
              <Icon name='minus' onClick={onRemove} />
            </Button>}
          </Responsive>
          {minus && <Responsive fireOnMount as={Button.Group} maxWidth='480'>
            <Button icon>
              <Icon name='minus' onClick={onRemove} />
            </Button>
          </Responsive>}

        </List.Content>
        <div className='border' style={{ backgroundColor: hasBorder && maxItem.color || 'transparent' }} />
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
                  {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) && ', '}
                  {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || ''}
                </Feed.Date>
              </Feed.Summary>
              <Feed.Meta>
                {(nameshort[dosage.method] || names[dosage.method]) || ''}
                {!rules.empty && ', '}
                {rules.text}
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
                      {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) && ', '}
                      {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || ''}
                      {(nameshort[dosage.method] || names[dosage.method]) && ', '}
                      {rules.empty && ((nameshort[dosage.method] || names[dosage.method]) || '')}
                    </Feed.Meta><br />
                    {!rules.empty && <Feed.Meta>
                      {(nameshort[dosage.method] || names[dosage.method]) || ''}, &nbsp;
                      {rules.text}
                    </Feed.Meta>}

                  </Feed.Content>
                </Feed.Event>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item
                  disabled={drug.group !== 0}
                  icon='tint'
                  as={RouterLink}
                  to={url}
                  onClick={this.getLF}
                  text='Дозировка'
                />
                <Dropdown.Item
                  disabled={drug.group !== 0}
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
        {canDrag && <div className='draghandler'>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>}

      </List.Item>

    )
  }

};
export default Drug
