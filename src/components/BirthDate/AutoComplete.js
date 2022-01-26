import React, { Component, createRef } from 'react';
import cx from 'classnames'
import { Search, SearchResults, Input } from 'semantic-ui-react'
import { withTranslation } from "react-i18next";
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

function declension(forms, val) {
  const cases = [ 2, 0, 1, 1, 1, 2 ];
  return forms[(val % 100 > 4 && val % 100 < 20) ? 2 : cases[(val % 10 < 5) ? val % 10 : 5]];
}

const ref_days = ["day", "a_day", "days"],
  ref_weeks = ["week_time", "weeks", "week_min"],
  ref_months = ["month", "a_month", "months"],
  ref_years = ["year", "of_the_year", "years"]


class MySearch extends Search {
  constructor(props){
    super(props)

  }
  renderSearchInput = (rest) => {
    const { icon, input } = this.props
    const { value } = this.state

    return Input.create(input, {
      autoGenerateKey: false,
      defaultProps: {
        ...rest,
        input: { className: 'prompt', tabIndex: '0', autoComplete: 'off' },
        onChange: this.handleSearchChange,
        onClick: this.handleInputClick,
        value,
      },
    })
  }
  renderResultsMenu = () => {
    const { open } = this.state
    const { resultClassName, height } = this.props
    const resultsClasses = open ? 'visible' : ''
    const menuContent = this.renderMenuContent()
    const classes = cx(resultsClasses, resultClassName)

    if (!menuContent) return

    return (
      <div className={'results transition ' + classes} style={{ height }}>
        <SearchResults className={'visible'}>{menuContent}</SearchResults>
      </div>
    )
  }


};
const AutoComplete = inject(
  "actions",
)(
  observer(
class AutoComplete extends Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,

      results: [],
      isLoading: false,
      searchQuery: ''
    }
    this.contextRef = createRef()
  }
  handleResultSelect = (e, { result }) => {
    let { onChange } = this.props

    onChange && onChange(this, { value: result.title })
    this.setState({ searchQuery: result.title })
  }

  handleSearchChange = (e, { value }) => {
    let { onChange } = this.props;
    const { t } = this.props.actions;
    if (value.length < 1) {
      this.setState({results: [], isLoading: false, searchQuery: ''});
      onChange && onChange(this, { value: '' })
      return
    }
    this.setState({ searchQuery: value }, () => {
      onChange && onChange(this, { value })

      let results = []
      let noYears = false, noMonths = false, noWeeks = false, noDays = false
      let resArr = value.split(', ')
      if(resArr.length < 2) resArr = value.split(' ')
      let num = parseInt(resArr[resArr.length-1])

      resArr.forEach((val) => {
        if(ref_years.includes(val)) noYears = true
        if(ref_months.includes(val)) {noMonths = true; noYears = true}
        if(ref_weeks.includes(val)) {noWeeks = true; noMonths = true; noYears = true}
        if(ref_days.includes(val)) {noDays = true; noWeeks = true; noMonths = true; noYears = true}
      })

      //let num = parseInt(value)
      if( value.length === 4 ) results.push({ id: '1', title: `${value} ${t("year_birth")}` })
      if( num < 121 && !noYears ) results.push({ id: '2', title: `${value} ${t(declension(ref_years, num))}` })
      if( num <= 12 && !noMonths ) results.push({ id: '3', title: `${value} ${t(declension(ref_months, num))}` })
      if( num <= 44 && !noWeeks ) results.push({ id: '4', title: `${value} ${t(declension(ref_weeks, num))}` })
      if( num <= 31 && !noDays ) results.push({ id: '5', title: `${value} ${t(declension(ref_days, num))}` })
      this.setState({ results })
    })
  }

  resultRenderer = ({ title, level, tn }) => {
    return <div>{title}{tn && <sup>TM</sup>}</div>
  }
  render() {
    const { isLoading, searchQuery, results } = this.state
    const { value } = this.props
    const { t } = this.props.actions
    return (
      <MySearch
        size='big'
        placeholder={t("age_enter_number")}
        loading={isLoading}
        onResultSelect={this.handleResultSelect}
        onSearchChange={_.debounce(this.handleSearchChange, 500, {
          leading: true,
        })}
        results={results}
        value={value}
        resultRenderer={this.resultRenderer}
        resultClassName='result-wrapper'
      />
    );
  }
}
));
export default withTranslation()(AutoComplete)
