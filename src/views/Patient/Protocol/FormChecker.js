/* eslint-disable jsx-a11y/iframe-has-title */
import React, { Component, createRef } from 'react';
// import { observer, inject } from 'mobx-react';
import { Checkbox, Container, Divider, Form, Header, Segment, } from 'semantic-ui-react';
// import BlockSlider from '../../components/Blocks/BlockSlider';
// import BlockSearch from '../../components/Blocks/BlockSearch';
// import BlockBlock from '../../components/Blocks/BlockBlock';
// import { DatePickerInput } from 'rc-datepicker';
import HtmlFile from './HtmlFile';
import Calendar from './Calendar';

import moment from "moment";

// const options = [
//     { text: 'Доктор', value: 'doctor' },
//     { text: 'Пациент', value: 'dialog_patient' },
// ]

// @inject('router', 'db', 'actions')
// @observer
class FormChecker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lib: "",
            id: "",
            Rebuild: false,
            quest: "Interviewer",
            dialog: "doctor",
            protocol: "",
            patient: 0,
            openEMC: false,
            open: false,

            data: {
                predsed: '',
                comis1: "",
                comis2: "",
                comis3: "",
                comis4: "",

                patient: "",
                address: "",
                dateDR: [],
                dateForm: null,
                cod: "",

                diagnoz: "",
                dateDiagnoz: [],
                soput: "",
                osloj: "",
                doc: "",
                // стр 2
                diagnozMet: "",
                mestoDia: "",

                ochered: "",

                recHir: "",
                mestoHir: "",
                dataHos: "",

                luch: "",
                mestoLuch: "",
                dataLuch: "",

                lekarst: "",
                dataLek: "",
                dlit: "",
                mestoTer: "",
                // 
                osoboeRec: "",
                osoboeMne: ""

            }
        }
        this.sliderRef = createRef()
    }

    componentDidMount() {
        let { data } = this.state
        // let { lib, id } = this.props.router.values;
        // let patient = this.props.router.location.search

        // let urlQuery = new URLSearchParams(document.location.search.substring(1));
        // let quid = urlQuery.get("patient?") || urlQuery.get("patient")
        // let json = JSON.parse(decodeURI(quid))
        let json = this.props.patient
        // console.log(json, "patient");

        const birthdate = moment(new Date(json?.birthdate), 'YYYY-MM-DD').format('LL');

        let birthdateJson = birthdate.split(" ")

        // console.log(birthdateJson);
        this.setState({
            data: {
                ...data,
                patient: json?.fio,
                address: json?.main_address || "",
                dateDR: birthdateJson,
                dateForm: json?.birthdate,
                // cod: "",
            }

        })
    }

    handleEditName = async (e) => {
        e.preventDefault()
        this.setState({ open: !this.state.open })

        // postAnalize
    }

    handleChange = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let { name, value } = e.target;

        this.setState({ [name]: value })
    }

    handleChangeData = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let { name, value } = e.target;
        let { data } = this.state
        // console.log(name, value);
        this.setState({ data: { ...data, [name]: value } })
    }

    handleChangeDataCh = (e, { name, value }) => {
        let { data } = this.state
        // console.log(name, value);
        this.setState({ data: { ...data, [name]: value } })
    }

    handleChangeDate = (e, { name, value }) => {

        const date = moment(new Date(value), 'YYYY-MM-DD').format('LL');

        let test = date.split(" ")
        let { data } = this.state
        // console.log(name, value, date, test);
        this.setState({ data: { ...data, [name]: test } })
    }

    // handleChangeDataCh = (e) => {
    //     e.stopPropagation();
    //     e.preventDefault();

    //     let { name, value } = e.target;
    //     let { data } = this.state
    //     console.log(name, value);
    //     this.setState({ data: { ...data, [name]: value } })
    // }

    handleCheck = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let { name, value } = e.target;

        this.setState({ [name]: value })
    }


    // this.setState({ [name]: value })

    handleChangedialog = (e, { value }) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ dialog: value })
    }

    printForm = (e) => {
        // e.preventDefault()
        var printContents = document.getElementById("divcontents").innerHTML;

        var originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;

        window.print();

        document.body.innerHTML = originalContents;
        window.location.reload();

        return null;
    }



    render() {

        let { data } = this.state


        return <div >

            <iframe id="ifmcontentstoprint" style={{
                height: '0px',
                width: '0px',
                top: "-999999px",
                left: "-999999px",
                position: 'fixed', background: "none"
            }}>
                <div id={"divcontents"} style={{ display: "none", background: "none" }}>
                    <HtmlFile data={data} />
                </div>
            </iframe>



            <Container text>
                <Segment basic style={{ padding: "5em 0" }}>
                    <Header>
                        ПРОТОКОЛ
                        <Header.Subheader>
                            врачебного консилиума по профилю «онкология»
                        </Header.Subheader>
                    </Header>

                    <Form style={{ flexDirection: "column" }}>
                        {/* <Form.Group style={{ flexDirection: "column" }}> */}


                        <label>Председатель</label>
                        <Form.Input required size='big'
                            fluid name="predsed"
                            onChange={this.handleChangeData} />

                        <label>Члены комиссии</label>
                        <Form.Input required size='big'
                            fluid name="comis1"
                            onChange={this.handleChangeData} />
                        <Form.Input required size='big'
                            fluid name="comis2"
                            onChange={this.handleChangeData} />
                        <Form.Input required size='big'
                            fluid name="comis3"
                            onChange={this.handleChangeData} />
                        <Form.Input required size='big'
                            fluid name="comis4"
                            onChange={this.handleChangeData} />

                        <Divider />

                        <Header> Пациент: </Header>

                        <label>Ф.И.О. пациента</label>
                        <Form.Input required size='big'
                            fluid name="patient" value={data.patient}
                            onChange={this.handleChangeData} />

                        <label>Адрес места жительства пациента</label>
                        <Form.Input required size='big'
                            fluid name="address" value={data.address}
                            onChange={this.handleChangeData} />

                        <label>Дата рождения</label>
                        <br />
                        <Calendar name="dateDR" value={data.dateForm} onChange={this.handleChangeDate} maxDate={new Date()} />
                        <br />
                        <br />
                        <label>Код льготы</label>
                        <Form.Input required size='big'
                            fluid name="cod"
                            onChange={this.handleChangeData} />

                        <Divider />


                        <label>Диагноз основной</label>
                        <Form.Input required size='big'
                            fluid name="diagnoz"
                            onChange={this.handleChangeData} />

                        <label>Дата постановки основного диагноза</label>
                        <br />
                        <Calendar name="dateDiagnoz" value={data.dateDiagnoz} onChange={this.handleChangeDate} maxDate={new Date()} />
                        <br />
                        <br />
                        <label>сопутствующий</label>
                        <Form.Input required size='big'
                            fluid name="soput"
                            onChange={this.handleChangeData} />

                        <label>осложнения</label>
                        <Form.Input required size='big'
                            fluid name="osloj"
                            onChange={this.handleChangeData} />

                        <Divider />

                        <label>Представленные медицинские документы</label>
                        <Form.Input required size='big'
                            fluid name="doc"
                            onChange={this.handleChangeData} />

                        <br />

                        <Header> РЕШЕНИЕ: </Header>

                        <label>Рекомендовать диагностический метод</label>
                        <Form.Input required size='big'
                            fluid name="diagnozMet"
                            onChange={this.handleChangeData} />
                        <Form style={{ marginBottom: "1em" }}>
                            <Form.Field>
                                Место проведения
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='в стационаре'
                                    name='mestoDia'
                                    value='1'
                                    checked={String(this.state.data.mestoDia) === '1'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='амбулаторно'
                                    name='mestoDia'
                                    value='2'
                                    checked={String(this.state.data.mestoDia) === '2'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                        </Form>

                        <label>Очередность проведения методов лечения</label>
                        <Form.Input required size='big'
                            fluid name="ochered"
                            onChange={this.handleChangeData} />

                        <br />

                        <label>Рекомендовать хирургическое лечение (указать метод)</label>
                        <Form.Input required size='big'
                            fluid name="recHir"
                            onChange={this.handleChangeData} />

                        <label>Планируемая дата госпитализации</label>
                        <br />
                        <Calendar name="dataHos" onChange={this.handleChangeDate} maxDate={new Date()} />
                        <br />

                        <br />

                        <label>Рекомендовать лучевую терапию (указать метод)</label>
                        <Form.Input required size='big'
                            fluid name="luch"
                            onChange={this.handleChangeData} />
                        <Form style={{ marginBottom: "1em" }}>
                            <Form.Field>
                                Место проведения
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='в стационаре'
                                    name='mestoLuch'
                                    value='1'
                                    checked={String(this.state.data.mestoLuch) === '1'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='в дневном стационаре '
                                    name='mestoLuch'
                                    value='2'
                                    checked={String(this.state.data.mestoLuch) === '2'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                        </Form>

                        <label>Дата начала лучевой терапии</label>
                        <br />
                        <Calendar name="dataLuch" value={data.dataLuch} onChange={this.handleChangeDate} maxDate={new Date()} />
                        <br />

                        <br />


                        <label  >Рекомендовать схему лекарственной терапии </label>
                        <Form.Input required size='big'
                            fluid name="lekarst"
                            onChange={this.handleChangeData} />

                        <label>Планируемая дата начала лекарственной терапии</label>
                        <br />
                        <Calendar name="dataLek" value={data.dataLek} onChange={this.handleChangeDate} maxDate={new Date()} />
                        <br />
                        <br />
                        <label>Планируемая длительность терапии (месяцев)</label>
                        <Form.Input required size='big'
                            fluid name="dlit"
                            onChange={this.handleChangeData} />
                        <Form style={{ marginBottom: "1em" }}>
                            <Form.Field>
                                Место проведения
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='в стационаре'
                                    name='mestoTer'
                                    value='1'
                                    checked={String(this.state.data.mestoTer) === '1'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='амбулаторно'
                                    name='mestoTer'
                                    value='2'
                                    checked={String(this.state.data.mestoTer) === '2'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox style={{ padding: "4px" }}
                                    radio
                                    label='в дневном стационаре'
                                    name='mestoTer'
                                    value='3'
                                    checked={String(this.state.data.mestoTer) === '3'}
                                    onChange={this.handleChangeDataCh}
                                />
                            </Form.Field>
                        </Form>

                        <label>Обследования и лечения</label>
                        <Form.Input required size='big'
                            fluid name="osoboeRec"
                            onChange={this.handleChangeData} />
                        <label>Особое мнение участника </label>
                        <Form.Input required size='big'
                            fluid name="osoboeMne"
                            onChange={this.handleChangeData} />
                        {/*  */}
                        <br />
                        <Form.Button primary floated="right" size="big" onClick={() => this.printForm()} >
                            Печать
                        </Form.Button>

                    </Form>
                </Segment>
            </Container>


        </div>
    }
}

export default FormChecker
