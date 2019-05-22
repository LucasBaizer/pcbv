import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Api from './Api';
import Homepage from './ui/pages/Homepage';
import SwaggerClient from 'swagger-client';
import CreatePCB from './ui/pages/CreatePCB';
import ViewPCB from './ui/pages/ViewPCB';
import NotFound from './ui/pages/NotFound';
import ApplicationNavbar from './ui/components/ApplicationNavbar';
import './index.css';

(async () => {
	const client = await new SwaggerClient(Api.prefix + '/api-docs');
	Api.api = client.apis;

	const history = createBrowserHistory();

	ReactDOM.render(
		<Router history={history}>
			<Route path="/" component={ApplicationNavbar} />
			<Switch>
				<Route path="/" exact={true} component={Homepage} />
				<Route path="/create" exact={true} component={CreatePCB} />
				<Route path="/view/:circuitId" exact={true} component={ViewPCB} />
				<Route path="/404" exact={true} component={NotFound} />
				<Route path="*" component={NotFound} />
			</Switch>
		</Router>, document.getElementById('root'));
})();
