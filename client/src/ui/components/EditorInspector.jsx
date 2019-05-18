import React from 'react';
import ComponentEditorInspector from './ComponentEditorInspector';
import Api from '../../Api';
import './EditorInspector.css';
import CircuitEditorInspector from './CircuitEditorInspector';

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
		} else if (this.props.component === null) {
			return (
				<CircuitEditorInspector
					ref={circuitEditorInspector => this.circuitEditorInspector = circuitEditorInspector}
					circuit={this.props.circuit}
					categories={this.state.categories}
					onChangeCategories={this.props.onChangeCategories}
					onUpdateCategories={this.props.onUpdateCategories} />
			);
		} else {
			return (
				<ComponentEditorInspector
					circuit={this.props.circuit}
					component={this.props.component}
					categories={this.state.categories}
					onComponentUpdate={this.props.onComponentUpdate} />
			);
		}
	}
};
