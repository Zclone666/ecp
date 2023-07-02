import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Segment, Header, Menu, Container } from 'semantic-ui-react';
import { withTranslation } from "react-i18next";
import { useEffect } from 'react';

import { POST } from "../../lib/connect";

const About = (props) => {
  const [texts, setTexts] = useState({});
  const { onExit, actions } = props;
  const { t } = actions;

  const code = "system_information_ecp";//"system_information_ecp";

  useEffect(() => {
    POST({
      path: `Info/TextByCode`,
      data: {
        active_language: "ru",
        codes: [code],
      },
      success: async (data) => {
        if (data.texts) {
          setTexts(data.texts);
        }
      },
      fail: async () => {
      },

    });

  }, []);

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      props.router.push('/')
    }
  }

  return (
    <Container text style={{ padding: "1em 0em" }}>

      <Segment style={{ padding: "3em 1em" }}>

        <Header style={{ textAlign: "center" }}>{texts[code]?.title}</Header>
        <div dangerouslySetInnerHTML={{ __html: texts[code]?.text }} />

      </Segment>
      <Menu className="bottom fixed menu one item huge main">
        <Menu.Item onClick={handleExit}>{t("back")}</Menu.Item>
      </Menu>
    </Container>
  );

};

export default withTranslation()(inject('actions', 'router')(observer(About)));
