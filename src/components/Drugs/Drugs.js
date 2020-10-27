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
  Icon,
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
    // const { selectedDrug, selectedConflict } = this.state
    let {
      actions: {
        selectedDrug,
        // selectedConflict,
        // activeDrugs,
        // activeConflicts
      },
      drugs: { drug: drugs },
      warnings: { warning, groups }, //warnings, warnGroups
      isRecipe
    } = this.props
    // let selectedWarnings = warning[selectedDrug]
    // console.log('activeDrugs', activeDrugs);
    let iterator = Array.from(drugs.values())
    iterator = _.orderBy(iterator, ['group'], ['desc']);

    // let c = 0
    let liquids = []
    let iteratorObj = _.groupBy(iterator, (x) => {
      if(liquids.indexOf(x.group) === -1){
        liquids.push(x.group)
      }
      return x.group
    })

    liquids.push((_.max(liquids) + 1));

    liquids = _.sortBy(liquids, [function(o) { return -o; }]);// _.reverse(_.sortedUniq(liquids));

    let warnDrugs = this.warnDrugs
    // console.log('iterator', iterator);
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
              {liquids.map(( liquid, l ) => {
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
                            {iteratorObj[liquid].map(( drug, i ) => {
                              return(
                                <Draggable draggableId={drug.key} index={i} key={`drug_${drug.key}`}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={snapshot.isDragging ? 'dragging' : ''}
                                    >
                                      <Drug style={{ cursor: 'move' }} active={warnDrugs[drug.key] || false} drug={drug} key={`drug_${i}`} />
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
                              borderColor: iteratorObj[liquid] ? borderColors[liquid] : borderColors[0]
                            }}
                            {...prov.droppableProps}
                          >
                            {(!iteratorObj[liquid]) && <div className={'abstext'}>Перетащите сюда не менее двух составляющих для раствора</div>}
                            {iteratorObj[liquid] && <div className={'text'}>
                              <Icon name='delete' className='right floated' onClick={() => this.removeLiquid(iteratorObj[liquid])} />
                              <Icon name='lab' className='right floated'  />
                              Раствор {liquid}
                            </div>}

                            {iteratorObj[liquid] && iteratorObj[liquid].map(( drug, i ) => {
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
                                        onRemove={() => this.onRemove(drug.key, iteratorObj[liquid])}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {prov.placeholder}
                            {(iteratorObj[liquid] && iteratorObj[liquid].length === 1) && <div className={'bottomtext'}>
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
          <List divided selection verticalAlign='middle' size='big' className={isRecipe ? '' : 'drugslist'}>
            {iterator.map(( drug, i ) => {
              return(
                <RecipeDrug drug={drug} key={`drug_${i}`} />

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
