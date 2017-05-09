// src/routes.js
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import App from './App';
import NotFound from './NotFound';
import DoctorLogin from './Login'

const Routes = (props) => (
  <BrowserRouter>
    <div>
        <Route exact path="/" component={App} />
        <Route path="/servicerequest" component={DoctorLogin} />
    </div>
  </BrowserRouter>
);

export default Routes;