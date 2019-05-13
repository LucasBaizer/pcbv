import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import './CreatePCB.css';

/* global $ */
export default class CreatePCB extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			imageFront: null,
			imageBack: null,
			imageType: null,
			currentFileSide: null,
			imageWidth: null,
			loading: false
		};

		this.upload = this.upload.bind(this);
		this.onChangeName = this.onChangeName.bind(this);
		this.onChangeFile = this.onChangeFile.bind(this);
		this.onClickCreate = this.onClickCreate.bind(this);
	}

	componentDidMount() {
		if(this.state.imageWidth === null) {
			this.setState({
				imageWidth: $('#image-front').width()
			});
		}

		const top = $('#image-front').width() / 2 - 48; // width should be height, but height() returns 0, so this is a workaround
		const left = $('#image-front').width() / 2 - 48;

		$('#image-front>svg').attr('style', 'left: ' + left + '; top: ' + top + ';');
		$('#image-back>svg').attr('style', 'left: ' + left + '; top: ' + top + ';');
	}

	onChangeName(e) {
		this.setState({
			name: e.target.value
		});
	}

	upload(side) {
		$('#file-input').trigger('click');

		this.setState({
			currentFileSide: side
		});
	}

	onChangeFile(e) {
		if(e.target.files.length === 0) {
			return;
		}

		this.setState({
			loading: true
		});

		const reader = new FileReader();
		reader.onload = event => {
			const type = event.target.result.substring(11, event.target.result.indexOf(';'));
			
			const newState = {
				currentFileSide: null,
				loading: false
			};
			if(this.state.imageType !== null) {
				if(this.state.imageType !== type) {
					alert('Files must be of the same type.');
					return;
				}
			} else {
				newState.imageType = type;
			}

			if(this.state.currentFileSide === 'front') {
				newState.imageFront = event.target.result;
			} else {
				newState.imageBack = event.target.result;
			}

			this.setState(newState);
		};
		reader.readAsDataURL(e.target.files[0]);
	}

	async onClickCreate() {
		this.setState({
			loading: true
		});

		$.ajax({
			method: 'POST',
			url: 'http://localhost:8080/api/v1/circuit',
			contentType: 'application/json',
			data: JSON.stringify({
				imageFront: this.state.imageFront.split(',', 2)[1],
				imageBack: this.state.imageBack.split(',', 2)[1],
				imageType: this.state.imageType,
				name: this.state.name
			}),
			success: data => {
				this.props.history.push('/view/' + data.circuitId);
			}
		});
	}

	render() {
		return (
			<>
				{this.state.loading ? (
					<div className="loading-overlay" />
				): (null)}
				<Container className="create-container">
					<Row>
						<Col md={{ offset: 2, span: 8 }}>
							<div className="centered-text">
								<h1>Create a New PCB View</h1>
							</div>

							<Form>
								<Form.Group controlId="name">
									<Form.Label>PCB Name</Form.Label>
									<Form.Control type="text" placeholder="name of the PCB" onChange={this.onChangeName} value={this.state.name} />
								</Form.Group>

								<Form.Row>
									<Col md={{ span: 5 }}>
										<Form.Group controlId="image-front">
											<Form.Label>PCB Front Side</Form.Label>
											{this.state.imageFront === null ? (
												<div id="image-front" onClick={() => this.upload('front')}>
													<FontAwesomeIcon icon={faCamera} size="6x" />
												</div>
											) : (
												<img className="upload-image" src={this.state.imageFront} alt="PCB front side" width={this.state.imageWidth} onClick={() => this.upload('front')} />
											)}
										</Form.Group>
									</Col>
									<Col md={{ offset: 2, span: 5 }}>
										<Form.Group controlId="image-back">
											<Form.Label>PCB Back Side</Form.Label>
											{this.state.imageBack === null ? (
												<div id="image-back" onClick={() => this.upload('back')}>
													<FontAwesomeIcon icon={faCamera} size="6x" />
												</div>
											) : (
												<img className="upload-image" src={this.state.imageBack} alt="PCB back side" width={this.state.imageWidth} onClick={() => this.upload('back')} />
											)}
										</Form.Group>
									</Col>
								</Form.Row>
								<Button variant="success" disabled={!this.state.name || !this.state.imageFront || !this.state.imageBack} onClick={this.onClickCreate}>Create</Button>
							</Form>
						</Col>
					</Row>
				</Container>
				<input id="file-input" type="file" className="hidden-input" accept="image/x-png,image/gif,image/jpeg" onChange={this.onChangeFile} />
			</>
		);
	}
};
