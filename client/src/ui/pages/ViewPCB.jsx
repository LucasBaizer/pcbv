import React from 'react';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import Api from '../../Api';
import CenteredSpinner from '../components/CenteredSpinner';
import EditorCanvas from '../components/EditorCanvas';
import EditorInspector from '../components/EditorInspector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import './ViewPCB.css';

export default class ViewPCB extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			circuit: null,
			loading: true,
			currentSide: 'front',
			mode: 'edit'
		};

		Api.api.circuit.getCircuit({
			circuitId: this.props.match.params.circuitId
		}).then(response => {
			this.setState({
				circuit: response.body
			});
		});

		this.onEditorLoaded = this.onEditorLoaded.bind(this);
		this.onFlipSides = this.onFlipSides.bind(this);
		this.onModeChange = this.onModeChange.bind(this);
	}

	onEditorLoaded() {
		this.setState({
			loading: false
		});
	}

	onFlipSides() {
		this.setState({
			currentSide: this.state.currentSide === 'front' ? 'back' : 'front',
			loading: true
		});
	}

	onModeChange(mode) {
		if (mode !== this.state.mode) {
			this.setState({
				mode: mode
			});
		}
	}

	render() {
		return (
			<>
				{this.state.loading ? (
					<div className="loading-overlay">
						<CenteredSpinner size={150} />
					</div>
				) : (null)}
				<Container className="pcb-view-container">
					<Row>
						<Col md={{ span: 9 }} className="pcb-left-pane">
							<div className="pcb-view-header">
								<span className="pcb-view-title">{this.state.loading ? 'Loading...' : this.state.circuit.name}</span>
								<div className="pcb-header-right">
									<ButtonGroup toggle={true} onChange={this.onModeChange}>
										<Button variant={this.state.mode === 'edit' ? 'primary' : 'light'} onClick={() => this.onModeChange('edit')}>Edit</Button>
										<Button variant={this.state.mode === 'view' ? 'primary' : 'light'} onClick={() => this.onModeChange('view')}>View</Button>
									</ButtonGroup>
									<FontAwesomeIcon icon={faSyncAlt} size="2x" onClick={this.onFlipSides} />
								</div>
							</div>
							<EditorCanvas circuit={this.state.circuit} side={this.state.currentSide} onLoad={this.onEditorLoaded} />
						</Col>
						<Col md={{ span: 3 }} className="pcb-right-pane">
							<EditorInspector />
						</Col>
					</Row>
				</Container>
			</>
		);
	}
};
