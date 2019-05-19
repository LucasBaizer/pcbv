import React from 'react';
import { Row, Col, Form, ListGroup, Modal, Button } from 'react-bootstrap';
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
			editingCategory: -1,
			createCategoryName: '',
			searchText: ''
		};

		this.onClickCategory = this.onClickCategory.bind(this);
		this.onChangeColor = this.onChangeColor.bind(this);
		this.onChangeColorComplete = this.onChangeColorComplete.bind(this);
		this.onClickAddCategory = this.onClickAddCategory.bind(this);
		this.onHideCreateCategory = this.onHideCreateCategory.bind(this);
		this.onChangeCategoryName = this.onChangeCategoryName.bind(this);
		this.createCategory = this.createCategory.bind(this);
		this.onChangeSearchText = this.onChangeSearchText.bind(this);
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
			this.colorPicker.show(this.props.categories[this.props.categories.findIndex(category => category.categoryId === id)].color, e.pageX, e.pageY);
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

	toHex(d) {
		return ('0' + (Number(d).toString(16))).slice(-2).toUpperCase()
	}

	rgbToHex(rgba) {
		return (this.toHex(rgba.r) + this.toHex(rgba.g) + this.toHex(rgba.b) + this.toHex(Math.floor(rgba.a * 256))).toUpperCase();
	}

	onChangeColor(e) {
		const original = [...this.props.categories];
		original[original.findIndex(category => category.categoryId === this.state.editingCategory)].color = this.rgbToHex(e.rgb);
		this.props.onUpdateCategories(original);
	}

	onChangeColorComplete(e) {
		$.ajax({
			method: 'POST',
			url: Api.prefix + '/api/v1/circuit/' + this.props.circuit.circuitId + '/category/' + this.state.editingCategory,
			contentType: 'application/json',
			data: JSON.stringify({
				color: this.rgbToHex(e.rgb)
			})
		});
	}

	onClickAddCategory() {
		this.setState({
			showCreateCategory: true
		});
	}

	onChangeCategoryName(e) {
		this.setState({
			createCategoryName: e.target.value
		});
	}

	onHideCreateCategory() {
		this.setState({
			createCategoryName: '',
			showCreateCategory: false
		});
	}

	onChangeSearchText(e) {
		this.setState({
			searchText: e.target.value
		});

		this.props.onChangeSearchText(e.target.value);
	}

	createCategory() {
		$.ajax({
			method: 'POST',
			url: Api.prefix + '/api/v1/circuit/' + this.props.circuit.circuitId + '/category',
			contentType: 'application/json',
			data: JSON.stringify({
				name: this.state.createCategoryName,
				color: ('000000' + (Math.floor(Math.random() * 16777215).toString(16))).slice(-6).toUpperCase() + 'C0'
			}),
			success: data => {
				const original = [...this.props.categories];
				original.push(data);
				this.props.onUpdateCategories(original);

				const clone = [...this.state.selectedCategories];
				clone.push(data.categoryId);
				this.setState({
					selectedCategories: clone
				});

				this.props.onChangeCategories(clone);
			}
		});

		this.onHideCreateCategory();
	}

	render() {
		return (
			<>
				<Modal show={this.state.showCreateCategory} onHide={this.onHideCreateCategory}>
					<Modal.Header>
						<Modal.Title>Create Category</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>Please enter the name of the new category.</p>
						<Form.Control type="text" value={this.state.createCategoryName} onChange={this.onChangeCategoryName} placeholder="category name" />
					</Modal.Body>
					<Modal.Footer>
						<Button variant="success" onClick={this.createCategory}>Create</Button>
					</Modal.Footer>
				</Modal>
				<div className="inspector-menu">
					<Row className="inspector-header">
						<Col md={{ span: 12 }}>
							<h3>{this.props.circuit.name}</h3>
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
									<Form.Label>Filter Components</Form.Label>
									<Form.Control type="text" value={this.state.searchText} onChange={this.onChangeSearchText} placeholder="search names or descriptions..." />
								</Form.Group>
								<Form.Group>
									<Form.Label>
										Filter Categories&nbsp;
									<FontAwesomeIcon icon={faPlus} color="green" className="inspector-clickable-icon" onClick={this.onClickAddCategory} />
									</Form.Label>
									<ListGroup>
										{this.props.categories.map(category => (
											<ListGroup.Item
												key={category.categoryId}
												className="inspector-category"
												active={this.state.selectedCategories.indexOf(category.categoryId) !== -1}
												data-category={category.categoryId.toString()}
												onClick={this.onClickCategory}>
												<span className="inspector-color-cube" style={{
													backgroundColor: '#' + category.color.substring(0, 6)
												}} />
												<span className="inspector-category-name">{category.name}</span>
												{category.name === 'None' ? (null) : (<FontAwesomeIcon icon={faTrashAlt} className="inspector-trash-icon" />)}
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
			</>
		);
	}
};
