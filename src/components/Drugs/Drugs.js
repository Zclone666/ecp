import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

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

@inject('db', 'actions', 'drugs', 'warnings')
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
      drugs: { drug },
      warnings: { warning, groups }, //warnings, warnGroups
    } = this.props
    let drugsObj = {}

    Array.from(warning.values()).forEach(( warn, i ) => {
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

  onBeforeDragStart = (result) => {
    console.log('onBeforeDragStart', result);
  }
  onDragStart = (result) => {
    console.log('onDragStart', result);
  }
  onDragUpdate = (result) => {
    console.log('onDragUpdate', result);
  }
  onDragEnd = (result) => {
    console.log('onDragEnd', result);
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
      drugs: { drug },
      warnings: { warning, groups }, //warnings, warnGroups
      isRecipe
    } = this.props
    let selectedWarnings = warning[selectedDrug]
    // console.log('activeDrugs', activeDrugs);
    let iterator = Array.from(drug.values())
    iterator = _.orderBy(iterator, ['group'], ['desc']);
    let warnDrugs = this.warnDrugs
    // console.log('iterator', iterator);
    let colors = [
      '#ccc',
      'blue',
      'green',
      'yellow'
    ]
    return (
      <>
        {/* !isRecipe &&
          <DragDropContext
            onBeforeDragStart={this.onBeforeDragStart}
            onDragStart={this.onDragStart}
            onDragUpdate={this.onDragUpdate}
            onDragEnd={this.onDragEnd}
          >
          <List divided selection verticalAlign='middle' size='big' className={isRecipe ? '' : 'drugslist'}>


                  {iterator.map(( drug, i ) => {
                    return(
                      <Droppable droppableId={`drug_place_${i}`} type="DRUG"  key={`drug_place_${i}`}>
                        {(prov, snap) => {

                          return(<div
                            ref={prov.innerRef}
                            style={{ backgroundColor: snap.isDraggingOver ? colors[0] : '' }}
                            {...prov.droppableProps}
                          >
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
                        {prov.placeholder}
                        </div>
                        )}}
                        </Droppable>

                      )
                    })}


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
        */}
        {!isRecipe &&
          <DndProvider backend={HTML5Backend}>
            <List divided selection verticalAlign='middle' size='big' className={isRecipe ? '' : 'drugslist'}>
              {iterator.map(( drug, i ) => {
                return(
                  <Drug
                    active={warnDrugs[drug.key] || false}
                    drug={drug}
                    key={`drug_${i}`}
                  />
                )
              })}
            </List>
          </DndProvider>
        }
        </>



    )
  }

};
export default Drugs
