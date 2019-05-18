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
			mode: 'edit',
			selectedComponent: null
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
		this.onComponentSelected = this.onComponentSelected.bind(this);
		this.onComponentUpdate = this.onComponentUpdate.bind(this);
		this.onChangeCategories = this.onChangeCategories.bind(this);
		this.onUpdateCategories = this.onUpdateCategories.bind(this);
	}

	onEditorLoaded() {
		this.setState({
			loading: false
		});

		this.onChangeCategories(this.editorInspector.circuitEditorInspector.state.selectedCategories);
	}

	onFlipSides() {
		this.setState({
			currentSide: this.state.currentSide === 'front' ? 'back' : 'front',
			loading: true
		});

		this.onChangeCategories(this.editorInspector.circuitEditorInspector.state.selectedCategories);
	}

	onModeChange(mode) {
		if (mode !== this.state.mode) {
			this.setState({
				mode: mode
			});
		}
	}

	onComponentSelected(component) {
		this.setState({
			selectedComponent: component
		});
	}

	onComponentUpdate(component, type) {
		if(type === 'delete') {
			this.setState({
				selectedComponent: null
			});
		} else {
			this.setState({
				selectedComponent: component
			});
		}

		this.editorCanvas.updateCurrentComponent(component, type);
	}

	onChangeCategories(categories) {
		this.editorCanvas.updateSelectedCategories(categories);	
	}

	onUpdateCategories(categories) {
		this.editorCanvas.updateCategories(categories);
		this.editorInspector.updateCategories(categories);
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
							<Row className="pcb-view-header">
								<Col md={{ span: 9 }}>
									<span className="pcb-view-title">{this.state.loading ? 'Loading...' : this.state.circuit.name}</span>
								</Col>
								<Col md={{ span: 2 }}>
									<ButtonGroup toggle={true} onChange={this.onModeChange}>
										<Button variant={this.state.mode === 'edit' ? 'primary' : 'light'} onClick={() => this.onModeChange('edit')}>Edit</Button>
										<Button variant={this.state.mode === 'view' ? 'primary' : 'light'} onClick={() => this.onModeChange('view')}>View</Button>
									</ButtonGroup>
								</Col>
								<Col md={{ span: 1 }}>
									<FontAwesomeIcon icon={faSyncAlt} size="2x" onClick={this.onFlipSides} className="view-switch-icon" />
								</Col>
							</Row>
							<EditorCanvas
								ref={editorCanvas => this.editorCanvas = editorCanvas}
								circuit={this.state.circuit}
								side={this.state.currentSide}
								mode={this.state.mode}
								onLoad={this.onEditorLoaded}
								onComponentSelected={this.onComponentSelected} />
						</Col>
						<Col md={{ span: 3 }} className="pcb-right-pane">
							<EditorInspector
								ref={editorInspector => this.editorInspector = editorInspector}
								circuit={this.state.circuit}
								component={this.state.selectedComponent}
								onComponentUpdate={this.onComponentUpdate}
								onChangeCategories={this.onChangeCategories}
								onUpdateCategories={this.onUpdateCategories} />
						</Col>
					</Row>
				</Container>
			</>
		);
	}
};
