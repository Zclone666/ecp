import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';

import RouterLink from '../../router/a'

import Spinner from '../../components/Spinner'
import BirthDate from '../../components/BirthDate'
import Search from '../../components/Search'


import {
  Sidebar,
  Menu,
  Icon,
  // Search,
  Segment,
  Message,
  List,
  Feed,
  Button,
  Responsive,
  Grid,
  Form,
  Input,
  Checkbox,
  Header,
  Dropdown
} from 'semantic-ui-react'

import _ from 'lodash';
import moment from 'moment';


@inject('router', 'diseases', 'actions')
@observer
class PatientForm extends Component {
  constructor(props){
    super(props)
    this.state = {
      search_disease: '',
      search_co_disease: '',
      search_allergy: '',
      lab_data: ''
    }
    //this.contextRef = createRef()
  }

  handleChange = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }

    if( name === 'weight' || name === 'growth' ){
      if( value === '' || value === 0 || value === '0' || value === '.' || value.split('.')[1] === '' ) {
        this.props.actions.patientForm[name]=value
      }else{
        this.props.actions.patientForm[name]=parseFloat(value)
      }

      this.props.actions.patientForm.masIndex = this.props.actions.patientForm.weight/Math.pow((this.props.actions.patientForm.growth/100), 2)
    }else{
      this.props.actions.patientForm[name] = value
    }
    if( name === 'sex' && value !== 'woman' ){
      this.props.actions.patientForm.pregnancy = false
      this.props.actions.patientForm.gestation = null
      this.props.actions.patientForm.trimester = null
      this.props.actions.patientForm.lactation = false
    }
    if( name === 'trimester' ){
      this.props.actions.patientForm.gestation = null
    }
    if( name === 'gestation' ){
      this.props.actions.patientForm.trimester = value > 14 ? ( value > 26 ? 3 : 2) : 1
    }
    // console.log({ name, value, res: this.props.actions.patientForm[name] });
  }
  handleChangeToggle = (e, { name, value }) => {
    if( !name && !value ){
      let { name, value } = e.target
    }
    this.props.actions.patientForm[name] = !this.props.actions.patientForm[name]
    if( name === 'pregnancy' && !this.props.actions.patientForm.pregnancy ){
      this.props.actions.patientForm.gestation = null
      this.props.actions.patientForm.trimester = null
    }
    //console.log({ name, value });
  }
  handleAddLabData = () => {
    this.props.actions.patientForm.lab_data.push(this.state.lab_data)
    this.setState({ lab_data: '' })
  }
  handleRemoveLabData = (item, i) => {
    this.props.actions.patientForm.lab_data.splice(i, 1)
  }
  handleResultSelect = async (e, { name, result }) => {
    // console.log({ name, result });
    //let newName = name === 'co_disease' ? 'disease' : name
    await this.props.actions.selectPatient(result, name)
    this.setState({ [`search_${name}`]: '' })
  }
  handleResultUnselect = async ( name, result ) => {
    // console.log({ name, result });
    //let newName = name === 'co_disease' ? 'disease' : name
    await this.props.actions.unselectPatient(result, name)
    this.forceUpdate()
    // this.setState({ [`search_${name}`]: '' })
  }

  handleSearchChange = (e, { name, value }) => {
    this.setState({ [`search_${name}`]: value })
    if(value.length > 1){
      this.props.diseases.searchReady = false
      if( name === 'allergy' ){
        this.props.diseases.getSearchAllergy(value, name)
      }else{
        this.props.diseases.getSearchDisease(value, name)
      }

    }

  }

  resultRenderer = ({ name, level, tn, type }) => {
    return <div>{name}{type === 'TN' && <sup>TM</sup>}</div>
  }
  get disease(){
    const {
      disease,
    } = this.props.actions.patientForm
    let arr = []
    disease.forEach((item, i) => {
       arr.push(item)
    });
    return arr
  }
  get co_disease(){
    const {
      co_disease,
    } = this.props.actions.patientForm
    let arr = []
    co_disease.forEach((item, i) => {
       arr.push(item)
    });
    return arr
  }
  render() {
    const {
      birthdate,
      age,
      sex,
      growth,
      weight,
      disease,
      co_disease,
      lab_data,
      pregnancy,
      gestation,
      trimester,
      lactation,
      driving,
      allergy,
      alcohol,
      masIndex
    } = this.props.actions.patientForm
    let { diseaseRows, allergyRows } = this.props.diseases
    let { search_disease, search_co_disease, search_allergy } = this.state
    let searchReady = true, searchRows=[], searchQuery=''

    let isWoman = sex === 'woman'
    let isPregant = !!pregnancy

    // console.log({birthdate});
    let veryOld = moment().diff(((birthdate && moment(birthdate, 'x')) || moment()), 'years') >= 60
    // console.log({veryOld});

    return (
      <Segment basic>
        <Form>
          <Form.Group>
            <BirthDate name='birthdate' value={birthdate} onChange={this.handleChange} />
            <Form.Field>
              <label>Пол</label>
              <Button.Group size='big'>
                <Button primary={sex === 'man'} onClick={this.handleChange} name='sex' value='man'>Мужчина</Button>
                <Button primary={sex === 'woman'} onClick={this.handleChange} name='sex' value='woman'>Женщина</Button>
              </Button.Group>
            </Form.Field>
          </Form.Group>
          <Form.Group>
            <Form.Field width={7}>
              <label>Рост</label>
              <Input
                size='big'
                name='growth'
                value={growth || ''}
                label={{ basic: true, content: 'см' }}
                labelPosition='right'
                placeholder='178.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={7}>
              <label>Вес</label>
              <Input
                size='big'
                name='weight'
                value={weight || ''}
                label={{ basic: true, content: 'кг' }}
                labelPosition='right'
                placeholder='60.5'
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field width={2}>
              <label>Индекс <i>m</i></label>
              <Input
                size='big'
                name='masIndex'
                className='readonly'
                readonly="readonly"
                value={masIndex || ''}
              >
                <input readonly="readonly" className='readonly' />
              </Input>
            </Form.Field>
          </Form.Group>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Основное заболевание</label>
              <Search
                fluid
                size='big'
                name='disease'
                loading={!searchReady}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  leading: true,
                })}
                results={diseaseRows}
                value={search_disease}
                resultRenderer={this.resultRenderer}
                resultClassName='result-wrapper'
              />
            </Form.Field>

          </Form.Group>
          <List divided verticalAlign='middle'>
            {this.disease.map((item, i) => {
              return(
                <List.Item key={'disease'+i} style={{ padding: '0.5em', backgroundColor: '#f6f6f0' }}>
                  <List.Content floated='right'>
                    <Button size='tiny' icon='delete' onClick={() => this.handleResultUnselect('disease', item)}/>
                  </List.Content>
                  <List.Icon name='heartbeat' size='big' verticalAlign='middle' />
                  <List.Content><List.Header>{item.name}</List.Header></List.Content>
                </List.Item>
              )
            })}
          </List>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Сопутствующие заболевания</label>
              <Search
                fluid
                size='big'
                name='co_disease'
                loading={!searchReady}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  leading: true,
                })}
                results={diseaseRows}
                value={search_co_disease}
                resultRenderer={this.resultRenderer}
                resultClassName='result-wrapper'
              />
            </Form.Field>
          </Form.Group>
          <List divided verticalAlign='middle'>
            {this.co_disease.map((item, i) => {
              return(
                <List.Item key={'co_disease'+i} style={{ padding: '0.5em', backgroundColor: '#f6f6f0' }}>
                  <List.Content floated='right'>
                    <Button size='tiny' icon='delete' onClick={() => this.handleResultUnselect('co_disease', item)}/>
                  </List.Content>
                  <List.Icon name='heartbeat' size='big' verticalAlign='middle' />
                  <List.Content><List.Header>{item.name}</List.Header></List.Content>
                </List.Item>
              )
            })}
          </List>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Аллергия</label>
              <Search
                fluid
                size='big'
                name='allergy'
                loading={!searchReady}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, {
                  leading: true,
                })}
                results={allergyRows}
                value={search_allergy}
                resultRenderer={this.resultRenderer}
                resultClassName='result-wrapper'
              />
            </Form.Field>
          </Form.Group>
          <List divided verticalAlign='middle'>
            {allergy.map((item, i) => {
              return(
                <List.Item key={'allergy'+i} style={{ padding: '0.5em', backgroundColor: '#f6f6f0' }}>
                  <List.Content floated='right'>
                    <Button size='tiny' icon='delete' onClick={() => this.handleResultUnselect('allergy', item)}/>
                  </List.Content>
                  <List.Icon name='heartbeat' size='big' verticalAlign='middle' />
                  <List.Content><List.Header>{item.name}{item.type === 'TN' && <span><sup>TM</sup></span>}</List.Header></List.Content>
                </List.Item>
              )
            })}
          </List>
          <Form.Group widths={1}>
            <Form.Field width={16}>
              <label>Лабораторные данные</label>
              <Input
                fluid
                size='big'
                name='lab_data'
                value={this.state.lab_data}
                action={{
                  labelPosition: 'right',
                  icon: 'plus',
                  content: 'Добавить',
                  onClick: this.handleAddLabData
                }}
                onChange={(e) => {
                  this.setState({ lab_data: e.target.value })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    this.handleAddLabData()
                  }
                }}
              />

            </Form.Field>
          </Form.Group>
          <List divided verticalAlign='middle'>
            {lab_data && lab_data.map((item, i) => {
              return(
                <List.Item key={'allergy'+i} style={{ padding: '0.5em', backgroundColor: '#f6f6f0' }}>
                  <List.Content floated='right'>
                    <Button size='tiny' icon='delete' onClick={() => this.handleRemoveLabData(item, i)}/>
                  </List.Content>
                  <List.Icon name='heartbeat' size='big' verticalAlign='middle' />
                  <List.Content><List.Header>{item}</List.Header></List.Content>
                </List.Item>
              )
            })}
          </List>
          {(isWoman && !veryOld) &&
            <Responsive as={Form.Group} widths={'equal'} maxWidth={480}>
              <Form.Field>
                <Button
                  size='big'
                  icon
                  fluid
                  labelPosition='left'
                  primary={!!pregnancy}
                  onClick={this.handleChangeToggle}
                  name='pregnancy'
                  value='pregnancy'
                >
                  <Icon name={!!pregnancy ? 'check square' : 'square outline'} />
                  Беременность
                </Button>
              </Form.Field>
              <Form.Field>
                <Button.Group size='big' fluid>
                  <Button
                    disabled
                    active
                  >
                    Триместр
                  </Button>
                  <Button
                    primary={trimester == 1}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={1}
                  >
                    1
                  </Button>
                  <Button
                    primary={trimester == 2}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={2}
                  >
                    2
                  </Button>
                  <Button
                    primary={trimester == 3}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={3}
                  >
                    3
                  </Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Dropdown
                  className='big'
                  disabled={!isPregant}
                  name='gestation'
                  onChange={this.handleChange}
                  button
                  fluid
                  search
                  floating
                  options={_.map(Array(44), (item, i) => {
                    return {
                      key: i+1,
                      text: i+1,
                      value: i+1
                    }
                  })}
                  text={'Неделя ' + (gestation || '')}
                />
              </Form.Field>
            </Responsive>
          }

          <Responsive as={Form.Group} widths={'equal'} maxWidth={480}>
            <Form.Field>
              <Button
                size='big'
                icon
                fluid
                labelPosition='left'
                primary={!!driving}
                onClick={this.handleChangeToggle}
                name='driving'
                value='driving'
              >
                <Icon name={!!driving ? 'check square' : 'square outline'} />
                Вождение авто
              </Button>
            </Form.Field>
            <Form.Field>
              <Button
                  size='big'
                  icon
                  fluid
                  labelPosition='left'
                  primary={!!alcohol}
                  onClick={this.handleChangeToggle}
                  name='alcohol'
                  value='alcohol'
              >
                <Icon name={!!alcohol ? 'check square' : 'square outline'} />
                Алкоголь
              </Button>
            </Form.Field>
            {isWoman && <Form.Field>
              <Button
                size='big'
                disabled={!isWoman || veryOld}
                icon
                fluid
                labelPosition='left'
                primary={!!lactation}
                onClick={this.handleChangeToggle}
                name='lactation'
                value='lactation'
              >
                <Icon name={!!lactation ? 'check square' : 'square outline'} />
                Кормление грудью
              </Button>
            </Form.Field>}
          </Responsive>
          {(isWoman && !veryOld) &&
            <Responsive as={Form.Group} minWidth={481}>
              <Form.Field>
                <Button
                  size='big'
                  icon
                  labelPosition='left'
                  primary={!!pregnancy}
                  onClick={this.handleChangeToggle}
                  name='pregnancy'
                  value='pregnancy'
                >
                  <Icon name={!!pregnancy ? 'check square' : 'square outline'} />
                  Беременность
                </Button>
              </Form.Field>
              <Form.Field>
                <Button.Group size='big' fluid>
                  <Button
                    disabled
                    active
                  >
                    Триместр
                  </Button>
                  <Button
                    primary={trimester == 1}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={1}
                  >
                    1
                  </Button>
                  <Button
                    primary={trimester == 2}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={2}
                  >
                    2
                  </Button>
                  <Button
                    primary={trimester == 3}
                    disabled={!isPregant}
                    onClick={this.handleChange}
                    name='trimester'
                    value={3}
                  >
                    3
                  </Button>
                </Button.Group>
              </Form.Field>
              <Form.Field>
                <Dropdown
                  className='big'
                  disabled={!isPregant}
                  name='gestation'
                  onChange={this.handleChange}
                  button
                  floating
                  search
                  options={_.map(Array(44), (item, i) => {
                    return {
                      key: i+1,
                      text: i+1,
                      value: i+1
                    }
                  })}
                  text={'Неделя ' + (gestation || '')}
                />
              </Form.Field>
            </Responsive>
          }
          <Responsive as={Form.Group} minWidth={481}>
            <Form.Field>
              <Button
                size='big'
                icon
                labelPosition='left'
                primary={!!driving}
                onClick={this.handleChangeToggle}
                name='driving'
                value='driving'
              >
                <Icon name={!!driving ? 'check square' : 'square outline'} />
                Вождение авто
              </Button>
            </Form.Field>
            <Form.Field>
              <Button
                  size='big'
                  icon
                  labelPosition='left'
                  primary={!!alcohol}
                  onClick={this.handleChangeToggle}
                  name='alcohol'
                  value='alcohol'
              >
                <Icon name={!!alcohol ? 'check square' : 'square outline'} />
                Алкоголь
              </Button>
            </Form.Field>
            {isWoman && <Form.Field>
              <Button
                size='big'
                disabled={!isWoman || veryOld}
                icon
                labelPosition='left'
                primary={!!lactation}
                onClick={this.handleChangeToggle}
                name='lactation'
                value='lactation'
              >
                <Icon name={!!lactation ? 'check square' : 'square outline'} />
                Кормление грудью
              </Button>
            </Form.Field>}
          </Responsive>
        </Form>
      </Segment>
    );
  }
};
export default PatientForm
