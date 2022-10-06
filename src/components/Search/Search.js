import React from 'react';
import cx from 'classnames'
import { Search, SearchResults } from 'semantic-ui-react'

class SearchInput extends Search {

  renderResultsMenu = () => {
    const { open } = this.state
    const { resultclassname, height } = this.props
    const resultsClasses = open ? 'visible' : ''
    const menuContent = this.renderMenuContent()
    const classes = cx(resultsClasses, resultclassname)

    if (!menuContent) return

    return (
      <div className={'results transition ' + classes} style={{ height }}>
        <SearchResults className={'visible'}>{menuContent}</SearchResults>
      </div>
    )
  }


};
export default SearchInput
