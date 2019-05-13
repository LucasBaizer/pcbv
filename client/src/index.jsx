import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Api from './Api';
import Homepage from './ui/pages/Homepage';
import SwaggerClient from 'swagger-client';
import CreatePCB from './ui/pages/CreatePCB';
import ViewPCB from './ui/pages/ViewPCB';
import ApplicationNavbar from './ui/components/ApplicationNavbar';
import './index.css';

(async () => {
	const client = await new SwaggerClient('http://localhost:8080/api-docs');
	Api.api = client.apis;

	const history = createBrowserHistory();

	ReactDOM.render(
		<Router history={history}>
			<Route path="/" component={ApplicationNavbar} />
			<Switch>
				<Route path="/" exact={true} component={Homepage} />
				<Route path="/create" exact={true} component={CreatePCB} />
				<Route path="/view/:circuitId" exact={true} component={ViewPCB} />
			</Switch>
		</Router>, document.getElementById('root'));
})();
