import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import Api from '../../Api';
import './EditorInspector.css';

export default class EditorInspector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			component: this.props.component,
			categories: null
		};

		this.onChangeComponentName = this.onChangeComponentName.bind(this);
		this.onChangeCategory = this.onChangeCategory.bind(this);
		this.onChangeDescription = this.onChangeDescription.bind(this);
		this.onChangeDocumentationUrl = this.onChangeDocumentationUrl.bind(this);
	}

	async componentDidUpdate(prevProps) {
		if(prevProps.component !== this.props.component) {
			this.setState({
				component: this.props.component
			});
		}
		if(prevProps.circuit !== this.props.circuit && this.props.circuit) {
			const categories = await Api.api.circuit.getCircuitCategories({
				circuitId: this.props.circuit.circuitId
			});
			this.setState({
				categories: categories.body
			});
		}
	}

	onChangeComponentName(e) {
		const newComponent = {
			...this.state.component,
			name: e.target.value
		};
		this.setState({
			component: newComponent
		});

		this.props.onComponentUpdate(newComponent);
	}

	onChangeDescription(e) {
		const newComponent = {
			...this.state.component,
			description: e.target.value
		};
		this.setState({
			component: newComponent
		});

		this.props.onComponentUpdate(newComponent);
	}

	onChangeCategory(e) {
		const newComponent = {
			...this.state.component,
			categoryId: parseInt(e.target.value, 10),
			category: this.state.categories.filter(category => category.categoryId === parseInt(e.target.value, 10))[0]
		};
		console.log(newComponent);
		this.setState({
			component: newComponent
		});

		this.props.onComponentUpdate(newComponent);
	}

	onChangeDocumentationUrl(e) {
		const newComponent = {
			...this.state.component,
			documentationUrl: e.target.value
		};
		this.setState({
			component: newComponent
		});

		this.props.onComponentUpdate(newComponent);
	}

	render() {
		if (this.state.component === null) {
			return (
				<div className="inspector-menu inspector-unselected">
					<h3 className="inspector-default-text">Select a component to inspect it.</h3>
				</div>
			);
		} else {
			return (
				<div className="inspector-menu">
					<Row className="inspector-header">
						<Col md={{span: 12}}>
							<h3>{this.state.component.name}</h3>
						</Col>
					</Row>
					<Row>
						<Col md={{span: 10, offset: 1}}>
							<Form>
								<Form.Group>
									<Form.Label>Component Name</Form.Label>
									<Form.Control type="text" value={this.state.component.name} placeholder="BAIZERLABS Serial Bus" onChange={this.onChangeComponentName} />
								</Form.Group>
								<Form.Group>
									<Form.Label>Description</Form.Label>
									<Form.Control as="textarea" value={this.state.component.descrption} rows={5} placeholder="a detailed description about what the part is for" onChange={this.onChangeDescription} />
								</Form.Group>
								<Form.Group>
									<Form.Label>Category</Form.Label>
									<Form.Control as="select" onChange={this.onChangeCategory} value={this.state.component.category.categoryId}>
										{this.state.categories.map(category => (
											<option key={category.categoryId} value={category.categoryId.toString()}>{category.name}</option>
										))}
									</Form.Control>
								</Form.Group>
								<Form.Group>
									<Form.Label>Documentation URL</Form.Label>
									<Form.Control type="text" value={this.state.component.documentationUrl} onChange={this.onChangeDocumentationUrl} />
								</Form.Group>
							</Form>
						</Col>
					</Row>
				</div>
			);
		}
	}
};
