import React from 'react';
import { Container, Row, Col, Jumbotron, Button, Card } from 'react-bootstrap';
import Api from '../../Api';

export default class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subCircuits: null,
			rootComponents: null,
			currentSide: 'front',
			loaded: false
		};
	}

	async componentDidUpdate(prevProps, prevState) {
		if (!prevProps.circuit && this.props.circuit) {
			await this.updateCurrentSide();

			if (this.props.onLoad) {
				this.props.onLoad();
			}
		}
	}

	async updateCurrentSide() {
		this.setState({
			loaded: false
		});

		const subCircuits = await Api.api.circuit.getSubCircuits({
			circuitId: this.props.circuit.circuitId,
			side: this.state.currentSide
		});
		const rootComponents = await Api.api.circuit.getCircuitComponents({
			circuitId: this.props.circuit.circuitId,
			side: this.state.currentSide
		});

		this.setState({
			subCircuits: subCircuits,
			rootComponents: rootComponents,
			loaded: true
		});
	}

	render() {
		if (this.state.loaded) {
			return (
				<canvas id="editor-canvas" />
			);
		} else {
			return (null);
		}
	}
};
