import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

class HtmlFile extends Component {

  render() {
    const { data } = this.props;
    // console.log(data, "data");
    return <div style={{ margin: "10mm 10mm 20mm 20mm" }}>
      <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"right", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>УТВЕРЖДЕНА</span></p>
    <p style={{ marginTop:"0pt", marginBottom:"0pt", textAlign:"right", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>распоряжением министерства </span><br/><span
        style={{fontFamily:"Times New Roman CYR"}}>здравоохранения </span><br/><span
        style={{fontFamily:"Times New Roman CYR"}}>Московской области</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"right", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>от 28.12.2020 № 186-р</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"right", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"right", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"right", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>Форма</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>ПРОТОКОЛ</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>врачебного консилиума по профилю </span>
        <span style={{fontFamily:"Times New Roman"}}>«онкология»</span>
        </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>&nbsp;</span></p>

    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman CYR"}}>Протокол №</span>



<span
        style={{fontFamily:"Times New Roman"}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </span>
      
      <span style={{fontFamily:"Times New Roman"}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </span>

      <span style={{fontFamily:"Times New Roman"}}>от «</span>

    

      
      <span style={{fontFamily:"Times New Roman"}}>__»</span>
     

      <span style={{fontFamily:"Times New Roman"}}> __________ 20</span>
     
<span style={{fontFamily:"Times New Roman"}}>__г.</span>
</p>
    {/* </p> */}
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Состав онкологического консилиума:</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt" }}><span
        style={{fontFamily:"Times New Roman"}}>Председатель:</span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" , }}>
        {data.predsed}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>
        ___________________________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>(ФИО)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Члены комиссии:</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" }}>
        {data.comis1}
      </span>
        <span
        style={{fontFamily:"Times New Roman"}}>
        _________________________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>(ФИО)</span>
    </p>

    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"9.5pt"}}>
    <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" }}>
        {data.comis2}
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>
        _____________________________________________________________________________________________________
      </span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>(ФИО)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"9.5pt"}}>
      
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" }}>
        {data.comis3}
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>
        _____________________________________________________________________________________________________
      </span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}>
      
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>(ФИО)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"9.5pt"}}>
    <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" }}>
        {data.comis4}
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>
        _____________________________________________________________________________________________________
      </span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"Times New Roman CYR", fontStyle:"italic"}}>(ФИО)</span></p>

    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Ф.И.О. пациента:</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" }}>
        {data.patient}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>
        _________________________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Адрес места жительства пациента:</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em" }}>
        {data.address}
      </span>
        <span
        style={{fontFamily:"Times New Roman"}}> ___________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Дата рождения пациента: «</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dateDR[0]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__»</span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.dateDR[1]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__________ </span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dateDR[2]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>____г.</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Код льготы:</span>
   <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.cod}
      </span>
        <span style={{fontFamily:"Times New Roman"}}>
        ______________________________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Диагноз:</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>основной:</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.diagnoz}
      </span>
        <span
        style={{fontFamily:"Times New Roman"}}>
        _______________________________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Дата постановки основного диагноза: «</span>

  <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dateDiagnoz[0]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__»</span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.dateDiagnoz[1]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__________ </span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dateDiagnoz[2]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>____г.</span>

      </p>
      {/* soput: "",
                osloj: "", */}
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>сопутствующий:</span>
           <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.soput}
      </span>
        <span style={{fontFamily:"Times New Roman"}}>
        __________________________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>осложнения:</span>
           <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.osloj}
      </span>
        <span style={{fontFamily:"Times New Roman"}}>
        _____________________________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Представленные медицинские документы: </span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>заключения (консультации) специалистов:</span>
           <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.doc}
      </span>
        <span style={{fontFamily:"Times New Roman"}}> ____________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>выписки из медицинской документации </span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>копии лабораторных исследований </span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>копии инструментальных исследований</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"8pt", textAlign:"justify", lineHeight:"108%", fontSize:"12pt"}}>
      <br />

        </p>
{/* //////////////////////2 стр////////////////////// */}
 {/* diagnozMet: "",
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
                osoboeMne: "" */}

    <div style={{pageBreakBefore: "always"}}/>

    <p style={{ lineHeight:"normal",paddingTop:"2em", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}>      
      <span
        style={{fontFamily:"Times New Roman"}}>РЕШЕНИЕ:</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Рекомендуемая тактика обследования и лечения: </span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Рекомендовать диагностический метод:</span>
           <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.diagnozMet}
      </span>
        <span style={{fontFamily:"Times New Roman"}}> ______________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Место проведения:</span></p>
    
    <ul type="disc" style={{margin:"0pt", paddingLeft:"0pt"}}>
      
      {!data.mestoDia || data.mestoDia === "1" ? <li style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>в стационаре</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________________</span>
      </li>: null}
      {!data.mestoDia || data.mestoDia === "2" ? <li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>амбулаторно</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________________</span>
      </li>: null}
    </ul>

    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Очередность проведения методов лечения:</span>
           <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.ochered}
      </span>
        <span style={{fontFamily:"Times New Roman"}}> ___________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Рекомендовать хирургическое лечение (указать метод):</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.recHir}
      </span>
        <span style={{fontFamily:"Times New Roman"}}> _________________________________</span>
    </p>
    {/* ///////////////////////// */}
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Место проведения:</span></p>
    <ul type="disc" style={{margin:"0pt", paddingLeft:"0pt"}}>
      <li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>в стационаре</span>

        <span style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________________</span>
      </li>
    </ul>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>планируемая дата госпитализации: «</span>

        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dataHos[0]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__»</span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.dataHos[1]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__________ </span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dataHos[2]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>____г.</span>
      
      </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Рекомендовать лучевую терапию (указать метод):</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.luch}
      </span>
        <span style={{fontFamily:"Times New Roman"}}> ______________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Место проведения: </span></p>
    <ul type="disc" style={{margin:"0pt", paddingLeft:"0pt"}}>
      {!data.mestoLuch || data.mestoLuch === "1" ?<li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>в стационаре</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________________</span>
      </li>: null}
      {!data.mestoLuch || data.mestoLuch === "2" ?<li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>в дневном стационаре</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________</span>
      </li>:null}
    </ul>
      {/*     lekarst: "",
                dataLek: "",
                dlit: "",
                mestoTer: "",  */}
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>планируемая дата начала лучевой терапии: «</span>

 <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dataLuch[0]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__»</span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.dataLuch[1]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__________ </span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dataLuch[2]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>____г.</span>

        {/* <span
        style={{fontFamily:"Times New Roman"}}>«__»</span><span style={{fontFamily:"Times New Roman"}}>
      </span><span style={{fontFamily:"Times New Roman"}}>__________ 20__г.</span> */}

      </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Рекомендовать схему лекарственной терапии (указать
        МНН,</span><span style={{fontFamily:"Times New Roman"}}> торговое наименование (при необходимости:
        непереносимость или
        неэффективность аналогов и дженериков), дозу, форму выпуска, кратность приема в сутки, пути введения,
        длительность приема лекарственного препарата):</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.lekarst}
      </span>
        <span style={{fontFamily:"Times New Roman"}}>
        ______________________________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Планируемая дата начала лекарственной терапии: «</span>

         <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dataLek[0]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__»</span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.dataLek[1]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__________ </span>
      <span style={{fontFamily:"Times New Roman"}}>        
      </span>
      <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute"}}>
        {data.dataLek[2]}
      </span>
      <span style={{fontFamily:"Times New Roman"}}>____г.</span>

        {/* <span
        style={{fontFamily:"Times New Roman"}}>«__»</span><span style={{fontFamily:"Times New Roman"}}>
      </span>
      <span style={{fontFamily:"Times New Roman"}}>__________ 20__г.</span> */}
      
      </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Планируемая длительность терапии (месяцев): </span>
         <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.dlit}
      </span>
        <span
        style={{fontFamily:"Times New Roman"}}>________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Место проведения:</span></p>
    <ul type="disc" style={{margin:"0pt", paddingLeft:"0pt"}}>
    {!data.mestoTer || data.mestoTer === "1" ? <li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", 
        AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>в стационаре</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________________</span>
      </li>: null}
      {!data.mestoTer || data.mestoTer === "2" ? <li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", 
        AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>амбулаторно</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________________</span>
      </li>: null}
      {!data.mestoTer || data.mestoTer === "3" ? <li
        style={{marginLeft:"28.52pt", textAlign:"justify", paddingLeft:"7.48pt", fontFamily:"serif", fontSize:"12pt", 
        AwFontFamily:"Symbol", AwFontWeight:"normal", AwNumberFormat:"" }}>
        <span style={{fontFamily:"Times New Roman"}}>в дневном стационаре</span><span
          style={{fontFamily:"Times New Roman"}}>
          _______________________________________________________</span>
      </li>: null}
    </ul>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Обоснование рекомендуемой тактики обследования и
        лечения:</span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.osoboeRec}
      </span>
        <span
        style={{fontFamily:"Times New Roman"}}> ___________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Особое мнение участника консилиума - </span>
        <span style={{fontFamily:"Times New Roman CYR", fontStyle:"italic", position: "absolute", paddingLeft: "1em"}}>
        {data.osoboeMne}
      </span>
        <span
        style={{fontFamily:"Times New Roman"}}>______________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(Ф.И.О., специализация, квалификация)</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Вариант в случае проведения дистанционного консилиума:</span></p>


<p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify",  fontSize:"12pt"}}>
      <span style={{fontFamily:"Times New Roman", }}>
        Мнение участника дистанционного консилиума врачей с его слов внесено в протокол</span>

        <span style={{fontFamily:"Times New Roman"}}>
        ________________________________________________________________________________</span>
        </p>
<p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(ФИО. специализация, квалификация) </span></p> 


    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>находящимся рядом с пациентом.</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>&nbsp;</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>С содержанием заключения ознакомлен:</span><span
        style={{fontFamily:"Times New Roman"}}> _____________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(подпись пациента или его законного представителя)
        (нужное подчеркнуть)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Подпись председателя консилиума</span><span
        style={{fontFamily:"Times New Roman"}}>: __________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(подпись, дата)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"12pt"}}><span
        style={{fontFamily:"Times New Roman"}}>Подписи членов консилиума:</span><span
        style={{fontFamily:"Times New Roman"}}>
        _______________________________________________________</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(подпись, дата)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"8pt"}}><span
        style={{fontFamily:"Calibri", fontStyle:"italic"}}>_________________________________________________________________________________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(подпись, дата)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"8pt"}}><span
        style={{fontFamily:"Calibri", fontStyle:"italic"}}>_________________________________________________________________________________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(подпись, дата) </span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"justify", fontSize:"8pt"}}><span
        style={{fontFamily:"Calibri", fontStyle:"italic"}}>_________________________________________________________________________________________________________________________</span>
    </p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"0pt", textAlign:"center", fontSize:"8pt"}}><span
        style={{fontFamily:"TimesNewRomanPSMT", fontStyle:"italic"}}>(подпись, дата)</span></p>
    <p style={{ lineHeight:"normal",marginTop:"0pt", marginBottom:"8pt", textAlign:"justify", lineHeight:"108%", fontSize:"11pt"}}><span
        style={{fontFamily:"Calibri"}}>&nbsp;</span></p>


    </div>
  }
}

HtmlFile.propTypes = {
  data: PropTypes.object,
};

export default HtmlFile