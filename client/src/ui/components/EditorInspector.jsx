import React from 'react';
import ComponentEditorInspector from './ComponentEditorInspector';
import CircuitEditorInspector from './CircuitEditorInspector';
import SubCircuitEditorInspector from './SubCircuitEditorInspector';
import Api from '../../Api';
import './EditorInspector.css';

export default class EditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			component: this.props.component,
			categories: null
		};
	}

	async componentDidUpdate(prevProps) {
		if (prevProps.circuit !== this.props.circuit && this.props.circuit) {
			const categories = await Api.api.circuit.getCircuitCategories({
				circuitId: this.props.circuit.circuitId
			});
			this.setState({
				categories: categories.body
			});
		}
	}

	updateCategories(categories) {
		this.setState({
			categories: categories
		});
	}

	render() {
		if (this.props.circuit === null || this.state.categories === null) {
			return (
				<div className="inspector-menu inspector-unselected">
					<h3 className="inspector-default-text">Loading...</h3>
				</div>
			);
		} else if (this.props.component !== null) {
			return (
				<ComponentEditorInspector
					mode={this.props.mode}
					circuit={this.props.circuit}
					currentSubCircuit={this.props.currentSubCircuit}
					component={this.props.component}
					categories={this.state.categories}
					onComponentUpdate={this.props.onComponentUpdate}
					onComponentSelected={this.props.onComponentSelected} />
			);
		} else if(this.props.subCircuit !== null) {
			return (
				<SubCircuitEditorInspector
					mode={this.props.mode}
					circuit={this.props.circuit}
					subCircuit={this.props.subCircuit}
					onSubCircuitUpdate={this.props.onSubCircuitUpdate} />
			);
		} else {
			return (
				<CircuitEditorInspector
					ref={circuitEditorInspector => this.circuitEditorInspector = circuitEditorInspector}
					circuit={this.props.circuit}
					categories={this.state.categories}
					searchText={this.props.searchText}
					onChangeCategories={this.props.onChangeCategories}
					onUpdateCategories={this.props.onUpdateCategories}
					onChangeSearchText={this.props.onChangeSearchText}
					onChangeShowSubCircuits={this.props.onChangeShowSubCircuits} />
			);
		}
	}
};
