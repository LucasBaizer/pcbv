import React from 'react';
import { Form, Modal, Button } from 'react-bootstrap';

export default class InspectorCategoryModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            titleTags: [],
            designatorTags: [],
            descriptionTags: [],
            titleTagsValue: '',
            designatorTagsValue: '',
            descriptionTagsValue: ''
        };

        this.onChangeCategoryName = this.onChangeCategoryName.bind(this);
        this.onChangeTitleTags = this.onChangeTitleTags.bind(this);
        this.onChangeDesignatorTags = this.onChangeDesignatorTags.bind(this);
        this.onChangeDescriptionTags = this.onChangeDescriptionTags.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const emptyState = {
            name: '',
            titleTags: [],
            designatorTags: [],
            descriptionTags: [],
            titleTagsValue: '',
            designatorTagsValue: '',
            descriptionTagsValue: ''
        };
        if(prevProps.show !== this.props.show) {
            this.setState(emptyState);
        }

        if(prevProps.category !== this.props.category) {
            if(this.props.category) {
                this.setState({
                    name: this.props.category.name,
                    titleTags: this.props.category.titleTags,
                    designatorTags: this.props.category.designatorTags,
                    descriptionTags: this.props.category.descriptionTags,
                    titleTagsValue: this.props.category.titleTags.join(', '),
                    designatorTagsValue: this.props.category.designatorTags.join(', '),
                    descriptionTagsValue: this.props.category.descriptionTags.join(', ')
                });
            } else {
                this.setState(emptyState);
            }
        }
    }

    onChangeCategoryName(e) {
		this.setState({
			name: e.target.value
		});
    }
    
    onChangeTitleTags(e) {
		this.setState({
            titleTagsValue: e.target.value,
            titleTags: e.target.value.split(',')
		});
    }
    
    onChangeDesignatorTags(e) {
		this.setState({
            designatorTagsValue: e.target.value,
            designatorTags: e.target.value.split(',')
		});
    }
    
    onChangeDescriptionTags(e) {
		this.setState({
            descriptionTagsValue: e.target.value,
            descriptionTags: e.target.value.split(',')
		});
	}

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header>
                    <Modal.Title>{this.props.category ? 'Edit' : 'Create'} Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Please enter the information for the category.</p>
                    <Form.Group>
                        <Form.Label>Category Name</Form.Label>
                        <Form.Control type="text" value={this.state.name} onChange={this.onChangeCategoryName} placeholder="category name" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Name Tags</Form.Label>
                        <Form.Control type="text" value={this.state.titleTagsValue} onChange={this.onChangeTitleTags} placeholder="name, (reg|ex), etc." />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Designator Tags</Form.Label>
                        <Form.Control type="text" value={this.state.designatorTagsValue} onChange={this.onChangeDesignatorTags} placeholder="name, (reg|ex), etc." />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description Tags</Form.Label>
                        <Form.Control type="text" value={this.state.descriptionTagsValue} onChange={this.onChangeDescriptionTags} placeholder="name, (reg|ex), etc." />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.props.onHide}>Close</Button>
                    <Button variant="success" onClick={() => this.props.onCreateCategory({
                        name: this.state.name,
                        titleTags: this.state.titleTags,
                        designatorTags: this.state.designatorTags,
                        descriptionTags: this.state.descriptionTags
                    })}>{this.props.category ? 'Edit' : 'Create'}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
};
