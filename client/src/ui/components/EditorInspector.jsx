import React from 'react';
import './EditorInspector.css';

export default class EditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<div className="inspector-menu">
				<h3 className="inspector-default-text">Select a component to inspect it.</h3>
			</div>
		);
	}
};
