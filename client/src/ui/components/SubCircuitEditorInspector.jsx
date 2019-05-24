import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import Api from '../../Api';

export default class SubCircuitEditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subCircuit: null,
			loading: true,
			imageWidth: 80
		};

		Api.api.circuit.getSubCircuit({
			circuitId: this.props.circuit.circuitId,
			subCircuitId: this.props.subCircuit.subCircuitId
		}).then(response => {
			this.setState({
				subCircuit: response.body,
				loading: false
			});
		});
	}

	render() {
		if(this.state.loading) {
			return (null);
		}
		return (
			<div className="inspector-menu">
				<Row className="inspector-header">
					<Col md={{ span: 12 }}>
						<h3>Subcircuit</h3>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }}>
						<Form>
							<Form.Group controlId="image">
								<Form.Label>Subcircuit Image</Form.Label>
								{this.state.subCircuit.image === null ? (
									<div id="image" onClick={this.upload}>
										<FontAwesomeIcon icon={faCamera} size="4x" />
									</div>
								) : (
										<img className="upload-image" src={this.state.subCircuit.image} alt="subcircuit" onClick={this.upload} />
									)}
							</Form.Group>
						</Form>
					</Col>
				</Row>
			</div>
		);
	}
};
