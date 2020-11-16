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

@inject('actions', 'router', 'tools', 'drugs', 'warnings', 'dosages', 'analogs', 'druginfo')
@observer
class MiniDrug extends React.Component {
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

		// this.props.router.push('/concepts/dozes')
	}

	renderRules(){
    let {
      dosages: { getFromBase },
      tools: { names, shortnames },
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
      let dosageValue = getFromBase(helpers.dosage.id, calc.fullDosage)
      let dosageName = shortnames[helpers.dosage.id] || names[helpers.dosage.id]
      arr.push(`${_.map(dosageValue, (dos) => parseFloat(dos)).join(' + ')} ${dosageName}`)
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
			},
			router: { values },
			drugs: { selectedRows }, //drugs, drugsDosages, currDrug, setDosageParams
			dosages: { dosage: dose },
			warnings: { warning, groups, icons: warnIcons }, //warnings, warnGroups, warnIcons
			drug,
			active,
			style,
			canDrag,
		} = this.props

		let { key, name, type, dosage, helpers } = drug
		let drugDosages = dose.get(key) || {}

		let names = drugDosages.names || {}
		let nameshort = drugDosages.nameshort || {}
		// liquid/calc/1/dozes/lf/4
		// console.log({drug});
		let urlArr = ['/liquid/calc',values.liquid,'dozes']

		if(helpers.way) urlArr.push(helpers.way)
		if(helpers.step) urlArr.push(helpers.step)

		let url = urlArr.join('/')
		// let url = `/liquid/calc/${values.liquid}${(drugDosages.url && drugDosages.url.replace('/concept', '')) || '/dozes'}`
		let className = selectedDrug === drug.key ? 'selected' : ''
		className += ((selectedDrug === drug.key || active) || (!selectedDrug && !selectedConflict) )  ? '' : ' unused'

		let resultStyle = { ...(style || {}), ...(!canDrag ? { cursor: 'default' } : { cursor: 'move' }) }

		let rules = this.renderRules()
		return(
			<List.Item style={resultStyle} className={`nowarnings ${className}`}>
				<List.Content floated='right'>
					<Button as={RouterLink} to={url} onClick={this.getLF} icon>
						<Icon className='glowing' name='tint' />
					</Button>
				</List.Content>
				<div className='border' style={{ backgroundColor: 'transparent' }} />
				<Responsive as={List.Content} className='ui feed large' fireOnMount minWidth='481'>
					<Feed.Event>
						<Feed.Content>
							<Feed.Summary>
								<span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}
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
					<List.Content className='ui feed large' >
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
					</List.Content>
				</Responsive>
			</List.Item>

		)
	}

};
export default MiniDrug
