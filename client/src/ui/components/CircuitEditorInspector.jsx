import React from 'react';
import { Row, Col, Form, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import InspectorColorPicker from './InspectorColorPicker';
import Api from '../../Api';

/* global $ */
export default class CircuitEditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedCategories: this.props.categories.map(category => category.categoryId),
			editingCategory: -1
		};

		this.onClickCategory = this.onClickCategory.bind(this);
		this.onChangeColor = this.onChangeColor.bind(this);
		this.onChangeColorComplete = this.onChangeColorComplete.bind(this);
	}

	onClickCategory(e) {
		let element = e.target;
		let attributeId = null;
		for (let i = 0; i < 3; i++) {
			if (element.getAttribute('data-category')) {
				attributeId = element.getAttribute('data-category');
				break;
			}
			element = element.parentElement;
		}
		const id = parseInt(attributeId, 10);

		if (e.target.tagName === 'svg' || e.target.tagName === 'path') {
			Api.api.circuit.deleteCircuitCategory({
				circuitId: this.props.circuit.circuitId,
				categoryId: id
			});

			const clone = [...this.state.selectedCategories];
			const index = clone.indexOf(id);
			if (index !== -1) {
				clone.splice(index, 1);
			}
			this.setState({
				selectedCategories: clone
			});
			this.props.onChangeCategories(clone);

			const original = [...this.props.categories];
			original.splice(original.findIndex(category => category.categoryId === id), 1);
			this.props.onUpdateCategories(original);

			return;
		} else if (e.target.getAttribute('class') === 'inspector-color-cube') {
			this.colorPicker.show('#' + this.props.categories[this.props.categories.findIndex(category => category.categoryId === id)].color, e.pageX, e.pageY);
			this.setState({
				editingCategory: id
			});
			return;
		}

		const clone = [...this.state.selectedCategories];
		const index = clone.indexOf(id);
		if (index === -1) {
			clone.push(id);
		} else {
			clone.splice(index, 1);
		}
		this.setState({
			selectedCategories: clone
		});

		this.props.onChangeCategories(clone);
	}

	onChangeColor(e) {
		const original = [...this.props.categories];
		original[original.findIndex(category => category.categoryId === this.state.editingCategory)].color = e.hex.substring(1).toUpperCase();
		this.props.onUpdateCategories(original);
	}

	onChangeColorComplete(e) {
		$.ajax({
			method: 'POST',
			url: 'http://localhost:8080/api/v1/circuit/' + this.props.circuit.circuitId + '/category/' + this.state.editingCategory,
			contentType: 'application/json',
			data: JSON.stringify({
				color: e.hex.substring(1).toUpperCase()
			})
		});
	}

	render() {
		return (
			<div className="inspector-menu">
				<Row className="inspector-header">
					<Col md={{ span: 12 }}>
						<h3>{this.props.circuit.name} Settings</h3>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }}>
						<Form>
							<Form.Group>
								<Form.Label>Circuit Name</Form.Label>
								<Form.Control type="text" value={this.props.circuit.name} disabled={true} />
							</Form.Group>
							<Form.Group>
								<Form.Label>Filter Categories <FontAwesomeIcon icon={faPlus} color="green" className="inspector-clickable-icon" /></Form.Label>
								<ListGroup>
									{this.props.categories.map(category => (
										<ListGroup.Item
											key={category.categoryId}
											className="inspector-category"
											active={this.state.selectedCategories.indexOf(category.categoryId) !== -1}
											data-category={category.categoryId.toString()}
											onClick={this.onClickCategory}>
											<span className="inspector-color-cube" style={{
												backgroundColor: '#' + category.color
											}} />
											<span className="inspector-category-name">{category.name}</span>
											<FontAwesomeIcon icon={faTrashAlt} className="inspector-trash-icon" />
										</ListGroup.Item>
									))}
								</ListGroup>
							</Form.Group>
						</Form>
					</Col>
				</Row>
				<InspectorColorPicker
					ref={colorPicker => this.colorPicker = colorPicker}
					onChange={this.onChangeColor}
					onChangeComplete={this.onChangeColorComplete} />
			</div>
		);
	}
};
