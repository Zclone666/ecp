import React, { Component } from "react";
import { Provider, observer } from "mobx-react";
import stores from "./stores";
import Layout from "./Layout";
// import Spinner from './spinner';
import { PROJECT_TITLE } from "./lib/connect";
import "semantic-ui-less/semantic.less";
import "./index.less";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// import { I18nextProvider } from "react-i18next";
// import i18n from "./i18n";

const App = observer(
  class App extends Component {
    componentDidMount() {
      document.title = PROJECT_TITLE;
    }
    render() {
      return (
        <Provider {...stores}>
          {/* <I18nextProvider i18n={i18n}> */}
          {/*<Spinner>*/}
          <Layout />
          {/*</Spinner>*/}
          {/* </I18nextProvider> */}
        </Provider>
      );
    }
  }
);

export default App;
