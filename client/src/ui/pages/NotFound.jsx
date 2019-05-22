import React from 'react';
import './NotFound.css';

export default class NotFound extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}


	render() {
		return (
			<div className="not-found-page">
				<h1>404 Page Not Found</h1>
				<h3>Oops, we can't find that page. You can <a href="/">return to the homepage.</a></h3>
			</div>
		);
	}
};
