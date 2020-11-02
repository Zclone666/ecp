import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Drug from '../../Drugs/Drug';

import {
	List,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject( 'actions', 'drugs' )
@observer
class LiquidDrugs extends Component {
	constructor(props){
		super(props)
		
		this.state = {
		
		}
	}
	
	get drugsWithGroups(){
		let {
			drugs: { drug: drugs },
		} = this.props
		
		let groups = []
		let iterator = []
		let grouped = {}
		let hasSolute = 0
		
		drugs.forEach(( drugObj, key ) => {
			
			// let dos = dosage.get(drugObj.key) || {}
			
			let drug = { ...drugObj }
			// drug.solute = dos.solute
			
			if(drug.solute) hasSolute++
			
			if(groups.indexOf(drug.group) === -1){
				groups.push(drug.group)
			}
			iterator.push(drug)
			grouped[drug.group] = grouped[drug.group] ? [ ...grouped[drug.group], drug ] : [ drug ]
		})
		
		if(hasSolute > 1) groups.push((_.max(groups) + 1));
		
		groups = _.sortBy(groups, [function(o) { return -o; }]);
		
		return {
			groups, grouped, iterator, canDrag: (hasSolute > 1)
		}
	}
	
	render(){
		let {
			liquid
		} = this.props
		let {
			groups, grouped, iterator, canDrag
		} = this.drugsWithGroups
		
		
		
		

		return (
      <List divided selection verticalAlign='middle' size='big' className='drugslist'>
        {grouped[liquid] && grouped[liquid].map(( drug, i ) => {
          return(
            <Drug
	            drug={drug}
	            key={`drug_${i}`}
	            onRemove={() => {}}
            />
          )
        })}
      </List>
      
		)
	}
	
};
export default LiquidDrugs
