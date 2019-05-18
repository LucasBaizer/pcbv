import React from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Api from '../../Api';

/* global $ */
export default class ComponentEditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			component: this.props.component,
			timeout: null
		};

		this.onChangeComponentName = this.onChangeComponentName.bind(this);
		this.onChangeCategory = this.onChangeCategory.bind(this);
		this.onChangeDescription = this.onChangeDescription.bind(this);
		this.onChangeDocumentationUrl = this.onChangeDocumentationUrl.bind(this);
		this.onClickDelete = this.onClickDelete.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.component !== this.props.component) {
			if (this.state.timeout) {
				this.updateComponent(this.state.component);
				clearTimeout(this.state.timeout);
			}
			this.setState({
				component: this.props.component,
				timeout: null
			});
		}
	}

	onChangeComponentName(e) {
		const newComponent = {
			...this.state.component,
			name: e.target.value
		};

		if (this.state.timeout) {
			clearTimeout(this.state.timeout);
		}
		this.setState({
			component: newComponent,
			timeout: setTimeout(() => {
				this.updateComponent(newComponent);
			}, 1000)
		});

		this.props.onComponentUpdate(newComponent);
	}

	onChangeDescription(e) {
		const newComponent = {
			...this.state.component,
			description: e.target.value
		};

		if (this.state.timeout) {
			clearTimeout(this.state.timeout);
		}
		this.setState({
			component: newComponent,
			timeout: setTimeout(() => {
				this.updateComponent(newComponent);
			}, 1000)
		});

		this.props.onComponentUpdate(newComponent);
	}

	onChangeCategory(e) {
		const newComponent = {
			...this.state.component,
			categoryId: parseInt(e.target.value, 10),
			category: this.props.categories.filter(category => category.categoryId === parseInt(e.target.value, 10))[0]
		};

		this.setState({
			component: newComponent
		});

		this.updateComponent(newComponent);

		this.props.onComponentUpdate(newComponent);
	}

	onChangeDocumentationUrl(e) {
		const newComponent = {
			...this.state.component,
			documentationUrl: e.target.value
		};
		if (this.state.timeout) {
			clearTimeout(this.state.timeout);
		}
		this.setState({
			component: newComponent,
			timeout: setTimeout(() => {
				this.updateComponent(newComponent);
			}, 1000)
		});

		this.props.onComponentUpdate(newComponent);
	}

	onClickDelete() {
		Api.api.circuit.deleteCircuitComponent({
			circuitId: this.props.circuit.circuitId,
			componentId: this.state.component.componentId
		});

		this.props.onComponentUpdate(this.state.component, 'delete');
	}

	updateComponent(component) {
		$.ajax({
			method: 'POST',
			url: 'http://localhost:8080/api/v1/circuit/' + this.props.circuit.circuitId + '/component/' + component.componentId,
			contentType: 'application/json',
			data: JSON.stringify(component)
		});
	}

	render() {
		if(this.state.component === null) {
			return (null);
		}
		return (
			<div className="inspector-menu">
				<Row className="inspector-header">
					<Col md={{ span: 12 }}>
						<h3>{this.state.component.name}</h3>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }}>
						<Form>
							<Form.Group>
								<Form.Label>Component Name</Form.Label>
								<Form.Control type="text" value={this.state.component.name} placeholder="BAIZERLABS Serial Bus" onChange={this.onChangeComponentName} />
							</Form.Group>
							<Form.Group>
								<Form.Label>Description</Form.Label>
								<Form.Control as="textarea" value={this.state.component.description} rows={5} placeholder="a detailed description about what the part is for" onChange={this.onChangeDescription} />
							</Form.Group>
							<Form.Group>
								<Form.Label>Category</Form.Label>
								<Form.Control as="select" onChange={this.onChangeCategory} value={this.state.component.category.categoryId}>
									{this.props.categories.map(category => (
										<option key={category.categoryId} value={category.categoryId.toString()}>{category.name}</option>
									))}
								</Form.Control>
							</Form.Group>
							<Form.Group>
								<Form.Label>Documentation URL</Form.Label>
								<InputGroup>
									<InputGroup.Prepend>
										<InputGroup.Text>
											<a href={this.state.component.documentationUrl} target="_blank" rel="noopener noreferrer">
												<FontAwesomeIcon icon={faExternalLinkAlt} />
											</a>
										</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control type="text" value={this.state.component.documentationUrl} onChange={this.onChangeDocumentationUrl} placeholder="http://example.com" />
								</InputGroup>
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
		);
	}
};