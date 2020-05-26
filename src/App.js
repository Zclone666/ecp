import React from 'react';
import { Message, Icon } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

function App() {
  return (
    <Message info icon>
      <Icon name="circle notched" loading />
      <Message.Content>
        <Message.Header>Just one second</Message.Header>
        We're fetching that content for you.
      </Message.Content>
    </Message>
  );
}

export default App;
