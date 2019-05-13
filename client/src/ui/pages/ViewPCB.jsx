import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Api from '../../Api';
import CenteredSpinner from '../components/CenteredSpinner';
import EditorCanvas from '../components/EditorCanvas';
import './ViewPCB.css';

export default class ViewPCB extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			circuit: null,
			loading: true
		};

		Api.api.circuit.getCircuit({
			circuitId: this.props.match.params.circuitId
		}).then(response => {
			this.setState({
				circuit: response.body
			});
		});

		this.onEditorLoaded = this.onEditorLoaded.bind(this);
	}

	onEditorLoaded() {
		this.setState({
			loading: false
		});
	}

	render() {
		return (
			<>
				{this.state.loading ? (
					<div className="loading-overlay">
						<CenteredSpinner size={150} />
					</div>
				): (null)}
				<Container>
					<Row>
						 <Col md={{span: 12}}>
							<EditorCanvas circuit={this.state.circuit} onLoad={this.onEditorLoaded} />
						 </Col>
					</Row>
				</Container>
			</>
		);
	}
};
