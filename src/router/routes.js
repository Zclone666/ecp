import React from 'react';
import Main from '../views/Main'; //
import Login from '../views/Login';
import Signup from '../views/Signup';
import Confirm from '../views/Confirm';
import Getconfirm from '../views/Getconfirm';

export default {
  '/':                                        { section: 'main', name: 'main',       render: <Main />       },
  '/concept':                                 { section: 'main', name: 'main',       render: <Main />       },
  '/concept/:page':                           { section: 'main', name: 'concept',    render: <Main />       },
  '/concept/:page/:way':                      { section: 'main', name: 'concept',    render: <Main />       },
  '/concept/:page/:way/:step':                { section: 'main', name: 'concept',    render: <Main />       },
  '/concept/:page/:way/:step/:id1':           { section: 'main', name: 'concept',    render: <Main />       },
  '/concept/:page/:way/:step/:id1/:id2':      { section: 'main', name: 'concept',    render: <Main />       },
  '/concept/:page/:way/:step/:id1/:id2/id3':  { section: 'main', name: 'concept',    render: <Main />       },

  '/warning/:page':                           { section: 'main', name: 'warning',    render: <Main />       },

  '/patient/:page':                           { section: 'main', name: 'patient',    render: <Main />       },

  '/login':                                   { section: 'auth', name: 'auth',       render: <Login />      },
  '/signup':                                  { section: 'auth', name: 'auth',       render: <Signup/>      },
  '/confirm':                                 { section: 'auth', name: 'auth',       render: <Confirm/>     },
  '/getconfirm':                              { section: 'auth', name: 'auth',       render: <Getconfirm/>  },
  '/confirm/:code/:email/:service':           { section: 'auth', name: 'auth',       render: <Confirm/>     },
}
