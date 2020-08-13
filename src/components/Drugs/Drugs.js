import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Drug from './Drug';
import RecipeDrug from './RecipeDrug';

import {
  // Menu,
  List,
  // Feed,
  Button,
  // Responsive,
  // Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions')
@observer
class Drugs extends Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }

  get warnDrugs(){
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { selectedRows, warnings, warnGroups, warnIcons }
    } = this.props
    let drugsObj = {}

    Array.from(warnings.data.values()).forEach(( warn, i ) => {
      // console.log({ warn });
      if(selectedConflict){
        if(warn.type === selectedConflict){
          let arr = _.filter(warn.subjects, (o) => { return o.drugkey !== selectedConflict; }) || []
          // console.log({ arr });
          arr.forEach(( item, x ) => {
            // console.log({ item });
            if( !drugsObj[item.drugkey] || drugsObj[item.drugkey].value < warn.value ){
              drugsObj[item.drugkey] = {
                value: warn.value,
                group: warn.group,
                color: warn.color,
              }
            }
          })
        }
      }else{
        if(_.find(warn.subjects, { 'drugkey': selectedDrug }) && warn.type === 'interdrug' ){
          let arr = _.filter(warn.subjects, (o) => { return o.drugkey !== selectedDrug; }) || []
          // console.log({ arr });
          arr.forEach(( item, x ) => {
            // console.log({ item });
            if( !drugsObj[item.drugkey] || drugsObj[item.drugkey].value < warn.value ){
              drugsObj[item.drugkey] = {
                value: warn.value,
                group: warn.group,
                color: warn.color,
              }
            }
          })
        }
      }

    })
    // console.log({drugsObj});
    return drugsObj
  }

  onBeforeDragStart = () => {

  }
  onDragStart = () => {

  }
  onDragUpdate = () => {

  }
  onDragEnd = () => {

  }

  render(){
    // const { selectedDrug, selectedConflict } = this.state
    let {
      actions: {
        selectedDrug,
        selectedConflict,
        activeDrugs,
        activeConflicts
      },
      db: { warnings, warnGroups, drugs },
      isRecipe
    } = this.props
    let selectedWarnings = warnings[selectedDrug]
    // console.log('activeDrugs', activeDrugs);
    let iterator = Array.from(drugs.data.values())

    let warnDrugs = this.warnDrugs
    // console.log('iterator', iterator);
    let colors = [
      'red',
      'blue',
      'green',
      'yellow'
    ]
    return (
      <>
        {!isRecipe &&
          <DragDropContext
            onBeforeDragStart={this.onBeforeDragStart}
            onDragStart={this.onDragStart}
            onDragUpdate={this.onDragUpdate}
            onDragEnd={this.onDragEnd}
          >
          <List divided selection verticalAlign='middle' size='big' className={isRecipe ? '' : 'drugslist'}>
          <Droppable droppableId={`drug_1`} type="DRUG" >
            {(prov, snap) => (
              <div
                ref={prov.innerRef}
                style={{ backgroundColor: snap.isDraggingOver ? colors[0] : '' }}
                {...prov.droppableProps}
              >

                  {iterator.map(( drug, i ) => {
                    return(

                        <Draggable draggableId={`drug_${i}`} index={i} key={`drug_${i}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Drug active={warnDrugs[drug.key] || false} drug={drug} key={`drug_${i}`} />

                            </div>
                          )}
                        </Draggable>


                      )
                    })}

                  {prov.placeholder}
                </div>
              )}
            </Droppable>
            </List>
          </DragDropContext>

        }
        {isRecipe &&
          <List divided selection verticalAlign='middle' size='big' className={isRecipe ? '' : 'drugslist'}>
            {iterator.map(( drug, i ) => {
              return(
                <RecipeDrug drug={drug} key={`drug_${i}`} />

              )
            })}
          </List>
        }
        </>



    )
  }

};
export default Drugs
