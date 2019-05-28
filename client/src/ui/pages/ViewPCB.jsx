import React from 'react';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import Api from '../../Api';
import CenteredSpinner from '../components/CenteredSpinner';
import EditorCanvas from '../components/EditorCanvas';
import EditorInspector from '../components/EditorInspector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import './ViewPCB.css';

export default class ViewPCB extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			circuit: null,
			loading: true,
			currentSide: 'front',
			mode: 'edit',
			selectedComponent: null,
			selectedSubCircuit: null,
			componentMode: 'designator',
			showSubCircuits: true,
			searchText: '',
			currentSubCircuit: null
		};

		Api.api.circuit.getCircuit({
			circuitId: this.props.match.params.circuitId
		}).then(response => {
			this.setState({
				circuit: response.body
			});
		}).catch(() => {
			this.props.history.push('/404');
		});

		this.onEditorLoaded = this.onEditorLoaded.bind(this);
		this.onFlipSides = this.onFlipSides.bind(this);
		this.onModeChange = this.onModeChange.bind(this);
		this.onComponentModeChange = this.onComponentModeChange.bind(this);
		this.onComponentSelected = this.onComponentSelected.bind(this);
		this.onSubCircuitSelected = this.onSubCircuitSelected.bind(this);
		this.onComponentUpdate = this.onComponentUpdate.bind(this);
		this.onSubCircuitUpdate = this.onSubCircuitUpdate.bind(this);
		this.onChangeCategories = this.onChangeCategories.bind(this);
		this.onUpdateCategories = this.onUpdateCategories.bind(this);
		this.onChangeSearchText = this.onChangeSearchText.bind(this);
		this.onChangeShowSubCircuits = this.onChangeShowSubCircuits.bind(this);
		this.onSubCircuitChanged = this.onSubCircuitChanged.bind(this);
	}

	onChangeShowSubCircuits(show) {
		this.setState({
			showSubCircuits: show
		});
	}

	onEditorLoaded() {
		this.setState({
			loading: false
		});

		this.onChangeCategories(this.editorInspector.circuitEditorInspector.state.selectedCategories);
	}

	onFlipSides() {
		if (this.state.currentSubCircuit) {
			this.editorCanvas.updateCurrentSide();

			this.setState({
				currentSubCircuit: null
			});
		} else {
			this.setState({
				currentSide: this.state.currentSide === 'front' ? 'back' : 'front',
				loading: true
			});

			this.onChangeCategories(this.editorInspector.circuitEditorInspector.state.selectedCategories);
		}
	}

	onModeChange(mode) {
		if (mode !== this.state.mode) {
			this.setState({
				mode: mode
			});
		}
	}

	onComponentModeChange(componentMode) {
		if (componentMode !== this.state.componentMode) {
			this.setState({
				componentMode: componentMode
			});
		}
	}

	onComponentSelected(component) {
		this.setState({
			selectedComponent: component
		});

		if(component === null && this.editorCanvas.state.selectedComponentId !== -1) {
			this.editorCanvas.setState({
				selectedComponentId: -1
			})
		}
	}

	onSubCircuitSelected(subCircuit) {
		this.setState({
			selectedSubCircuit: subCircuit
		});
	}

	onSubCircuitChanged(subCircuitId) {
		this.setState({
			currentSubCircuit: subCircuitId
		});
	}

	onComponentUpdate(component, type) {
		if (type === 'delete') {
			this.setState({
				selectedComponent: null
			});
		} else if (type !== 'move') {
			this.setState({
				selectedComponent: component
			});
		}

		return this.editorCanvas.updateCurrentComponent(component, type);
	}

	onSubCircuitUpdate(subCircuit, type) {
		if (type === 'delete') {
			this.setState({
				selectedSubCircuit: null
			});
		}

		return this.editorCanvas.updateCurrentSubCircuit(subCircuit, type);
	}

	onChangeCategories(categories) {
		this.editorCanvas.updateSelectedCategories(categories);
	}

	onUpdateCategories(categories) {
		this.editorCanvas.updateCategories(categories);
		this.editorInspector.updateCategories(categories);
	}

	onChangeSearchText(text) {
		this.editorCanvas.updateSearchText(text);

		this.setState({
			searchText: text
		});
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
								<Col md={{ span: 6 }}>
									<span className="pcb-view-title">{this.state.loading ? 'Loading...' : this.state.circuit.name}</span>
								</Col>
								<Col md={{ span: 3 }}>
									<ButtonGroup toggle={true}>
										<Button variant={this.state.componentMode === 'designator' ? 'primary' : 'light'} onClick={() => this.onComponentModeChange('designator')}>Designator</Button>
										<Button variant={this.state.componentMode === 'name' ? 'primary' : 'light'} onClick={() => this.onComponentModeChange('name')}>Name</Button>
									</ButtonGroup>
								</Col>
								<Col md={{ span: 2 }}>
									<ButtonGroup toggle={true}>
										<Button variant={this.state.mode === 'edit' ? 'primary' : 'light'} onClick={() => this.onModeChange('edit')}>Edit</Button>
										<Button variant={this.state.mode === 'view' ? 'primary' : 'light'} onClick={() => this.onModeChange('view')}>View</Button>
									</ButtonGroup>
								</Col>
								<Col md={{ span: 1 }}>
									<FontAwesomeIcon icon={!this.state.currentSubCircuit ? faSyncAlt : faArrowAltCircleLeft} size="2x" onClick={this.onFlipSides} className="view-switch-icon" />
								</Col>
							</Row>
							<EditorCanvas
								ref={editorCanvas => this.editorCanvas = editorCanvas}
								circuit={this.state.circuit}
								side={this.state.currentSide}
								mode={this.state.mode}
								componentMode={this.state.componentMode}
								showSubCircuits={this.state.showSubCircuits}
								onLoad={this.onEditorLoaded}
								onComponentSelected={this.onComponentSelected}
								onSubCircuitSelected={this.onSubCircuitSelected}
								onSubCircuitChanged={this.onSubCircuitChanged} />
						</Col>
						<Col md={{ span: 3 }} className="pcb-right-pane">
							<EditorInspector
								ref={editorInspector => this.editorInspector = editorInspector}
								mode={this.state.mode}
								circuit={this.state.circuit}
								component={this.state.selectedComponent}
								subCircuit={this.state.selectedSubCircuit}
								currentSubCircuit={this.state.currentSubCircuit}
								searchText={this.state.searchText}
								onComponentUpdate={this.onComponentUpdate}
								onComponentSelected={this.onComponentSelected}
								onSubCircuitUpdate={this.onSubCircuitUpdate}
								onChangeCategories={this.onChangeCategories}
								onUpdateCategories={this.onUpdateCategories}
								onChangeSearchText={this.onChangeSearchText}
								onChangeShowSubCircuits={this.onChangeShowSubCircuits} />
						</Col>
					</Row>
				</Container>
			</>
		);
	}
};
