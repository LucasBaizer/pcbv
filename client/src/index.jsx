import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Swagger from 'swagger-client';
import Api from './Api';
import Homepage from './ui/pages/Homepage';
import ApplicationNavbar from './ui/components/ApplicationNavbar';

(async () => {
    const api = await Swagger('http://localhost:8080/api-docs');
    Api.api = api.apis;

    const history = createBrowserHistory();

    ReactDOM.render(
        <Router history={history}>
            <Route path="/" component={ApplicationNavbar} />
            <Switch>
                <Route path="/" exact={true} component={Homepage} />
            </Switch>
        </Router>, document.getElementById('root'));
})();
