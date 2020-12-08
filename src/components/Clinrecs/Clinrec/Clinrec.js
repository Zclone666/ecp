import React, { Component,Fragment } from 'react';
import { inject, observer } from 'mobx-react';

import { Collapse } from 'react-collapse';

import {
  // Menu,
  List,
  Transition,
  Button,
  Icon,
  Segment,
  Label,
  Table,
  Dimmer,
  Header,
  Feed,
  Checkbox,
  Responsive
} from 'semantic-ui-react'

import _ from 'lodash';

@inject('db', 'actions', 'druginfo', 'router', 'drugs', 'clinrecs', 'warnings')
@observer
class Clinrec extends Component {
  constructor(props){
    super(props)


    this.state = {
      opened: null
    }
  }

  collapse = (opened) => {
    if(this.state.opened === opened){
      this.setState({ opened: null })
    }else{
      this.setState({ opened })
    }
  }

  renderHtml = (item) => {
    return(
      <Segment basic dangerouslySetInnerHTML={{__html: item.text}}></Segment>
    )
  }
  renderList = (item) => {
    return (
      <Segment basic>
        <Feed>
          {item.items && _.map(item.items, ( listitem, i ) => {
            return(
              <Feed.Event key={'infoItem'+i}>
                <Feed.Content>
                  {listitem.bold ?
                    <Feed.Summary style={{ fontWeight: 700 }}>
                      {listitem.text}
                    </Feed.Summary>
                    :
                    <Feed.Summary style={{ fontWeight: 700 }}>
                      {listitem.code} <span style={{ fontWeight: 'normal' }}>{listitem.text}</span>
                    </Feed.Summary>
                  }
                </Feed.Content>
              </Feed.Event>
            )
          })}
        </Feed>
      </Segment>
    )
  }
  renderText = (item) => {
    return(
      <Segment basic>{item.text}</Segment>
    )
  }

  renderTree(items, parent){
    let iteratable = _.keys(items)
    return iteratable.map(( id ) => {
      let item = items[id]
      if((!item.parent_ids && !parent) || (item.parent_ids && item.parent_ids.includes(parent))){

        return(
          <List.Item key={id}>
            {item.bold?
              <List.Icon name='chevron circle right' size='small' />
              :
              <List.Icon name='circle' size='small' />
            }
            <List.Content>
              <List.Description><strong>{item.code}</strong> {item.bold? <strong>{item.text}</strong> : item.text}</List.Description>
              {(item.child_ids && item.child_ids.length > 0) &&
                <List.List>
                  {this.renderTree(items, id)}
                </List.List>
              }
            </List.Content>
          </List.Item>
        )
      }else{
        return null
      }
    })
  }

  renderCourse = (course) => {
    // check: null
    // childs: ["1i/z3fg1gP6Tr5TKlg+IQg==", "7NYRZMZPBxOQOW4BwDXDSw==", "Ilv0pGwya9+HyFgV1WljPw==",…]
    // 0: "1i/z3fg1gP6Tr5TKlg+IQg=="
    // 1: "7NYRZMZPBxOQOW4BwDXDSw=="
    // 2: "Ilv0pGwya9+HyFgV1WljPw=="
    // 3: "Qh/pMznIJMRgKd2FZSLnNQ=="
    // 4: "fqsmaVvunAmIhALINE6hPA=="
    // comment: ""
    // concept: null
    // dosage: []
    // drug: null
    // efficiency: null
    // form: []
    // intervalpreset: []
    // method: []
    // name: "симптоматическая терапия"
    // parents: "FcnCCLq3ZiMW50R2nGTiNQ=="
    // schedulepreset: []
    // trust: 0.5
    // type: "Regimen"
    // warning: 1
    // let { name, type, childs }
    return(
      null
    )
  }

  handleChangeRadio = ({ name, parent }) => {
    let arr = _.cloneDeep(this.props.clinrecs.clinrec[parent].childs)
    arr.forEach((item, i) => {
      if(this.props.clinrecs.clinrec[item]){
        this.props.clinrecs.clinrec[item].check = false
      }

    });
    this.props.clinrecs.clinrec[name].check = true
  }
  handleChangeCheckbox = ({ name }) => {
    if(this.props.clinrecs.clinrec[name]){
      this.props.clinrecs.clinrec[name].check = !this.props.clinrecs.clinrec[name].check
    }
  }

  renderCheck = (childs, id) => {
    let {
      clinrecs: { clinrec }
    } = this.props
    return(
      <List.Item>
        <List.Content className='large'>
          <List.Description>
            Выберите один или несколько вариантов:
          </List.Description>
          <List.List>
            {childs.childs && childs.childs.map((childId) => {
              let child = clinrec[childId]
              if(!child) return null
              return(
                <div className='checkContainer'>
                  <Checkbox
                    name={id}
                    checked={child.check}
                    onChange={() => this.handleChangeCheckbox({ name: childId, parent: id })}
                  />
                  {this.renderPure(child, childId)}
                </div>
              )
            })}
          </List.List>
        </List.Content>
      </List.Item>
    )
  }

  renderRadio = (childs, id) => {
    let {
      clinrecs: { clinrec }
    } = this.props
    return(
      <List.Item>
        <List.Content className='large'>
          <List.Description>
            Выберите один из вариантов:
          </List.Description>
          <List.List>
            {childs.childs && childs.childs.map((childId) => {
              let child = clinrec[childId]
              if(!child) return null
              return(
                <div className='checkContainer'>
                  <Checkbox
                    radio
                    name={id}
                    checked={child.check}
                    onChange={() => this.handleChangeRadio({ name: childId, parent: id })}
                  />
                  {this.renderPure(child, childId)}
                </div>
              )
            })}
          </List.List>
        </List.Content>
      </List.Item>
    )
  }

  renderPure = (child, childId) => {
    switch (child.type) {
      case 'Drug':
        return this.renderDrug(child)
        break;
      case 'GroupSeq':
        return this.renderGroup(child)
        break;
      case 'Regimen':
        return this.renderRegimen(child)
        break;
      case 'OR':
        return this.renderRadio(child, childId)
        break;
      case 'AND':
        return this.renderCheck(child, childId)
        break;
      case 'FG':
        return this.renderFG(child)
        break;
      case 'Unknown':
        return this.renderFG(child)
        break;
      default:
        return this.renderRecoursive(child, childId)
    }

  }

  renderGroup = (child) => {
    return(
      <List.Item>
        <List.Content className='large'>
          <List.Description>
            {child.name}
          </List.Description>
          <List.List>
            {this.renderRecoursive(child)}
          </List.List>
        </List.Content>
      </List.Item>
    )
  }

  renderFG = (child) => {
    return(
      <List.Item>
        <List.Content className='large'>
          <List.Description>
            <strong>{child.name}</strong>
          </List.Description>
          {child.comment && <List.Description>
            {child.comment}
          </List.Description>}
          <List.List>
            {this.renderRecoursive(child)}
          </List.List>
        </List.Content>
      </List.Item>
    )
  }

  renderRegimen = (child) => {
    return(
      <List.Item>
        <List.Content className='large'>
          <List.Header>{child.name}</List.Header>
          <List.Item>
            <List.List>
              {this.renderRecoursive(child)}
            </List.List>
          </List.Item>
        </List.Content>
      </List.Item>
    )
  }

  renderDrug = (obj) => {
    let {
      clinrecs: { clinrec, names, shortnames },
      warnings: { getGroup }
    } = this.props
    // console.log(obj);
    if(!obj) return null
    let { name, type } = obj.drug
    let { method, form, intervalpreset, schedulepreset, dosage } = obj
    let helpers = { }
    if(dosage && dosage.length > 0){
      helpers.dosage = {
        short: `${dosage[0].value_1} ${shortnames[dosage[0].id_1]}`
      }
    }
    let rules = []
    if(intervalpreset){
      intervalpreset.forEach((item, i) => {
        rules.push(names[item])
      });
    }
    if(schedulepreset){
      schedulepreset.forEach((item, i) => {
        rules.push(names[item])
      });
    }
    let { color, group } = getGroup(obj.warning)

    return(
      <List.Item className={`nowarnings`}>
				{false && <div className='border' style={{ backgroundColor: color }} />}
				<Responsive as={List.Content} className='ui feed large' fireOnMount minWidth='481'>
					<Feed.Event>
						<Feed.Content>
							<Feed.Summary>
								<span className='underlined'>{name}</span>{type === 'TN' && <span><sup>TM</sup></span>}
								<Feed.Date>
									{form && (shortnames[form] || names[form])}{' '}
									{(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) && ', '}
									{(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || ''}
								</Feed.Date>
							</Feed.Summary>
							<Feed.Meta>
								{!!names[method] && `${names[method]}`}
								{(!!names[method] && rules.length > 0) && ', '}
                {rules.join(', ')}
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
                  {form && (shortnames[form] || names[form])}{' '}
                  {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) && ', '}
                  {(helpers.dosage && (helpers.dosage.short || helpers.dosage.full)) || ''}
	              </Feed.Meta><br />
								<Feed.Meta>
                  {!!names[method] && `${names[method]}`}
                  {(!!names[method] && rules.length > 0) && ', '}
                  {rules.join(', ')}
								</Feed.Meta>

              </Feed.Content>
            </Feed.Event>
					</List.Content>
				</Responsive>
			</List.Item>
    )
  }

  renderRecoursive = (childs) => {
    let {
      clinrecs: { clinrec }
    } = this.props
    //childs.type
    return(
      <>
        {childs.childs && childs.childs.map((childId) => {
          let child = clinrec[childId]
          if(!child) return null
          if(child.type === 'Drug') return this.renderDrug(child)
          if(child.type === 'GroupSeq') return this.renderGroup(child)
          if(child.type === 'Regimen') return this.renderRegimen(child)
          if(child.type === 'OR') return this.renderRadio(child, childId)
          if(child.type === 'AND') return this.renderCheck(child, childId)
          return(
            <List.Item
              key={'calc'+childId}
            >
              <List.Content className='large'>
                <List.Header>{child.name}</List.Header>
                {child.comment && <List.Description>
                  {child.comment}
                </List.Description>}
                <List.Description>
                  {child.type}<br />
                  {child.efficiency}
                </List.Description>
                <List.Item>
                  <List.List>
                    {this.renderRecoursive(child)}
                  </List.List>
                </List.Item>
              </List.Content>
            </List.Item>
          )
        })}
      </>
    )
  }


  render(){
    let {
      router,
      clinrecs: { clinrec, ready }
    } = this.props
    let { opened } = this.state


    return (
      <>
        <Segment basic>
          {_.keys(clinrec).map((id) => {
            let rec = clinrec[id] || {}
            if(rec.parents) return null
            return(
              <>
                <Header as='h3' className='stretched'>
                  <Icon name='unordered list' />
                  <Header.Content>{rec.name}</Header.Content>
                </Header>
                <List divided relaxed className='draginfo clinrec' verticalAlign='middle' size='large' >
                  {rec.childs.map(( courseId, i ) => {
                    let course = clinrec[courseId]
                    if(!course) return null
                    // console.log({item});
                    return(
                      <List.Item
                        key={'calc'+i}
                        style={{ cursor: 'pointer' }}

                      >
                        <List.Content className='large'>
                          <List.Header onClick={() => this.collapse('calc'+courseId)}>{course.name}</List.Header>
                          <Collapse isOpened={true} initialStyle={{height: 0, overflow: 'hidden'}}>
                            {'calc'+courseId === opened &&
                              <List.Item>
                                <List.List>
                                  {this.renderRecoursive(course)}
                                </List.List>
                              </List.Item>
                            }
                          </Collapse>
                        </List.Content>

                      </List.Item>
                    )

                  })}
                </List>
              </>
            )
          })}

        </Segment>
        {(ready && this.items.instr.length < 1 && this.items.calc.length < 1) &&
          <Dimmer.Dimmable as={Segment} basic dimmed={true} className='h100'>
            <Dimmer active={true} inverted>
              <Header as='h2' icon color='grey'>
                <Icon name='dont' />
                Нет информации
              </Header>
            </Dimmer>
          </Dimmer.Dimmable>
        }
      </>
    )
  }

};
export default Clinrec
