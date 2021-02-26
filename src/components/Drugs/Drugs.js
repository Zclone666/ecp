import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import RouterLink from '../../router/a';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Drug from './Drug';
import RecipeDrug from './RecipeDrug';

import {
  // Menu,
  List,
  // Feed,
  Button,
  // Responsive,
  Icon,
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'drugs', 'dosages', 'warnings')
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

    let currDrug = null

    Array.from(warning.values()).forEach(( warn, i ) => {
      // console.log({ warn });
      if(selectedConflict){
        if(warn.type === selectedConflict){
          let arr = _.filter(warn.subjects, (o) => { return o.drugkey !== selectedConflict; }) || []
          // console.log({ arr });
          arr.forEach(( item, x ) => {
            // console.log({ item });
            if( !drugsObj[item.drugkey] || drugsObj[item.drugkey].group < warn.group ){
              drugsObj[item.drugkey] = {
                value: warn.value,
                group: warn.group,
                color: warn.color,
              }
            }
          })
        }
      }else{
        currDrug = _.find(warn.subjects, { 'drugkey': selectedDrug })
        // console.log({currDrug});
        if(currDrug){ // && warn.type === 'interdrug' ){
          let arr = _.filter(warn.subjects, (o) => { return (o.drugkey !== selectedDrug && !o.hidekeys.includes(currDrug.drugkey) ) }) || []
          // console.log({ arr });
          arr.forEach(( item, x ) => {
            // console.log({ item });
            if( !drugsObj[item.drugkey] || drugsObj[item.drugkey].group < warn.group ){
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

  get drugsWithGroups(){
    let {
      drugs: { drug: drugs },
      dosages: { dosage },
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

  onBeforeDragStart = (result) => {
    // console.log('onBeforeDragStart', result);
  }
  onDragStart = (result) => {
    // console.log('onDragStart', result);
  }
  onDragUpdate = (result) => {
    // console.log('onDragUpdate', result);
  }
  onDragEnd = (result) => {
    // console.log('onDragEnd', result);
    if(!result.destination || !result.destination.droppableId) return
    let group = parseInt(_.replace(result.destination.droppableId, 'drug_place_', ''));
    let key = [result.draggableId]

    this.props.drugs.setGroup(key, group)
  }

  getLiqParams = (id) => {
    let {
      drugs: { makeLiquids },
    } = this.props
    makeLiquids()
  }

  removeLiquid = (drugs) => {
    let keys = []
    drugs.forEach((drug, i) => {
      keys.push(drug.key)
    })

    this.props.drugs.setGroup(keys, 0)
  }

  onRemove = (key, drugs) => {
    if(drugs.length < 3){
      this.removeLiquid(drugs)
    }else{
      this.props.drugs.setGroup([key], 0)
    }
  }

  render(){
    let {
      actions: {
        selectedDrug,
        makeLiquids
      },
      drugs: { drug: drugs, liquid: liquidList, checkLiquids },
      warnings: { warning }, //warnings, warnGroups
      dosages: { dosage },
      isRecipe
    } = this.props

    let {
      groups, grouped, iterator, canDrag
    } = this.drugsWithGroups

    let warnDrugs = this.warnDrugs

    let colors = [
      '#F3F4F5',
      '#DFF0FF',
      '#FBFDEF',
      '#F6E7FF',
      '#E1F7F7',
      '#FBFDEF',
      '#FFEDDE'
    ]

    let borderColors = [
      '#DCDDDE',
      '#54C8FF',
      '#FFE21F',
      '#DC73FF',
      '#6DFFFF',
      '#D9E778',
      '#FF851B'
    ]
    // console.log({ drugs: Array.from(drugs.values()), liquids: Array.from(liquidList.values()) });
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
              {groups.map(( liquid, l ) => {
                let current = liquidList.get(liquid)
                if(liquid === 0){
                  return(
                    <Droppable isCombineEnabled droppableId={`drug_place_${liquid}`} type="DRUG"  key={`drug_place_${liquid}`}>
                      {(prov, snap) => {

                        return(
                          <div
                            ref={prov.innerRef}
                            style={{
                              backgroundColor: snap.isDraggingOver ? colors[liquid] : '',
                              borderColor: borderColors[liquid]
                            }}
                            {...prov.droppableProps}
                          >
                            {grouped[liquid].map(( drug, i ) => {
                              // let dosages = dosage.get(drug.key)
                              // let isLiquid = (dosages && dosages.solute)
                              // console.log({drug})
                              return(
                                <Draggable isDragDisabled={!drug.solute || !canDrag} draggableId={drug.key} index={i} key={`drug_${drug.key}`}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={snapshot.isDragging ? 'dragging' : ''}
                                    >
                                      <Drug canDrag={!(!drug.solute || !canDrag)} active={warnDrugs[drug.key] || false} drug={drug} key={`drug_${i}`} />
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {prov.placeholder}
                          </div>
                        )
                      }}
                    </Droppable>
                  )
                }else{
                  return (
                    <Droppable droppableId={`drug_place_${liquid}`} type="DRUG"  key={`drug_place_${liquid}`}>
                      {(prov, snap) => {

                        return(
                          <div
                            className={`liquidcontainer${snap.isDraggingOver ? ' active' : ''}`}
                            ref={prov.innerRef}
                            style={{
                              backgroundColor: snap.isDraggingOver ? colors[liquid] : '',
                              borderColor: grouped[liquid] ? borderColors[liquid] : borderColors[0]
                            }}
                            {...prov.droppableProps}
                          >
                            {(!grouped[liquid]) && <div className={'abstext'}>Перетащите сюда не менее двух составляющих для раствора</div>}
                            {grouped[liquid] && <div className={'text'}>
                              <Icon name='delete' className='right floated' onClick={() => this.removeLiquid(grouped[liquid])} />
                              {(current && checkLiquids && !makeLiquids) && <RouterLink disabled={!current} onClick={() => this.getLiqParams(liquid)} to={'/liquid/calc/'+liquid}><Icon name='lab' className='right floated'  /></RouterLink>}
                              Раствор {liquid}
                            </div>}

                            {grouped[liquid] && grouped[liquid].map(( drug, i ) => {
                              return(
                                <Draggable isDragDisabled draggableId={drug.key} index={i} key={`drug_${drug.key}`}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={snapshot.isDragging ? 'dragging' : ''}
                                    >
                                      <Drug
                                        style={{ backgroundColor: snap.isDraggingOver ? colors[liquid] : '' }}
                                        active={warnDrugs[drug.key] || false}
                                        drug={drug}
                                        key={`drug_${i}`}
                                        minus={true}
                                        onRemove={() => this.onRemove(drug.key, grouped[liquid])}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {prov.placeholder}
                            {(grouped[liquid] && grouped[liquid].length === 1) && <div className={'bottomtext'}>
                              Добавьте еще хотя бы один элемент
                            </div>}
                          </div>
                        )
                      }}
                    </Droppable>
                  )
                }

              })}
            </List>
          </DragDropContext>

        }
        {isRecipe &&
          <List divided selection verticalAlign='middle' size='big'>
            {iterator.map(( drug, i ) => {
              // console.log({drug});
              return(
                <RecipeDrug drugKey={drug.key} key={`drug_${i}`} />
              )
            })}
          </List>
        }
        {/* !isRecipe &&
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
        */}
        </>



    )
  }

};
export default Drugs
