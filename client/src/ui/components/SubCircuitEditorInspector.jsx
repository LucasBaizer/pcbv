import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import CenteredSpinner from './CenteredSpinner';
import Api from '../../Api';

/* global $ */
export default class SubCircuitEditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subCircuit: null,
			loading: true,
			imageWidth: 200
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

		this.upload = this.upload.bind(this);
		this.onChangeFile = this.onChangeFile.bind(this);
		this.onClickDelete = this.onClickDelete.bind(this);
	}

	componentDidUpdate() {
		if (this.state.imageWidth === 200) {
			this.setState({
				imageWidth: $('#image').width()
			});
		}

		const top = $('#image').width() / 2 - 48; // width should be height, but height() returns 0, so this is a workaround
		const left = $('#image').width() / 2 - 48;

		$('#image>svg').attr('style', 'left: ' + left + '; top: ' + top + ';');
	}

	onClickDelete() {
		Api.api.circuit.deleteSubCircuit({
			circuitId: this.state.subCircuit.parentCircuitId,
			subCircuitId: this.state.subCircuit.subCircuitId
		});

		this.props.onSubCircuitUpdate(this.state.subCircuit, 'delete');
	}

	upload() {
		$('#file-input').trigger('click');
	}

	onChangeFile(e) {
		if (e.target.files.length === 0) {
			return;
		}

		const reader = new FileReader();
		reader.onload = event => {
			const type = event.target.result.substring(11, event.target.result.indexOf(';'));

			const subCircuit = {
				...this.state.subCircuit,
				imageType: type,
				image: event.target.result.substring(event.target.result.indexOf(',') + 1)
			};

			$.ajax({
				method: 'POST',
				url: Api.prefix + '/api/v1/circuit/' + this.props.circuit.circuitId + '/subcircuit/' + this.state.subCircuit.subCircuitId,
				contentType: 'application/json',
				data: JSON.stringify({
					image: subCircuit.image,
					imageType: subCircuit.imageType
				})
			});

			this.setState({
				subCircuit: subCircuit
			});
		};
		reader.readAsDataURL(e.target.files[0]);
	}

	render() {
		if (this.state.loading) {
			return (
				<div className="loading-overlay">
					<CenteredSpinner size={150} />
				</div>
			);
		}
		return (
			<>
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
									<div id="image" onClick={this.upload} style={{
										display: this.state.subCircuit.image === null ? 'block' : 'none'
									}}>
										<FontAwesomeIcon icon={faCamera} size="6x" />
									</div>
									{this.state.subCircuit.imageType ? (
										<img className="upload-image" src={'data:image/' + this.state.subCircuit.imageType + ';base64,' + this.state.subCircuit.image} width={this.state.imageWidth - 30} alt="subcircuit" onClick={this.upload} />
									): (null)}
								</Form.Group>
							</Form>
						</Col>
					</Row>
					<Row>
						<Col md={{ span: 10, offset: 1 }}>
							<Button variant="danger" onClick={this.onClickDelete} className="inspector-delete-button">Delete</Button>
						</Col>
					</Row>
				</div>
				<input id="file-input" type="file" className="hidden-input" accept="image/x-png,image/gif,image/jpeg" onChange={this.onChangeFile} />
			</>
		);
	}
};
