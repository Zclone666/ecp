import React from 'react';
import Main from '../views/Main'; //
import Login from '../views/Login';
import Signup from '../views/Signup';
import Confirm from '../views/Confirm';
import Getconfirm from '../views/Getconfirm';

export default {
  '/':                                        { name: 'main',       render: <Main />       },
  '/pages/:page':                             { name: 'main',       render: <Main />       },
  '/login':                                   { name: 'auth',       render: <Login />      },
  '/signup':                                  { name: 'auth',       render: <Signup/>      },
  '/confirm':                                 { name: 'auth',       render: <Confirm/>     },
  '/getconfirm':                              { name: 'auth',       render: <Getconfirm/>  },
  '/confirm/:code/:email/:service':           { name: 'auth',       render: <Confirm/>     },
}
