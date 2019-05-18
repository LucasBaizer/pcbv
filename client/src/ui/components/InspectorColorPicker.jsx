import React from 'react';
import { SketchPicker } from 'react-color';
import { Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default class InspectorColorPicker extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
			positionX: -1,
			positionY: -1,
			color: ''
		};

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	show(color, x, y) {
		this.setState({
			show: true,
			color: color,
			positionX: x,
			positionY: y
		});
	}

	hide() {
		this.setState({
			show: false,
			positionX: -1,
			positionY: -1
		});
	}

	onChange(e) {
		this.setState({
			color: e.hex
		});
		this.props.onChange(e);
	}

	render() {
		return (
			<div style={{
				position: 'fixed',
				visibility: this.state.show ? 'visible' : 'hidden',
				display: this.state.show ? 'block' : 'none',
				left: this.state.positionX,
				top: this.state.positionY,
				zIndex: 99
			}}>
				<Row className="inspector-color-header">
					<FontAwesomeIcon icon={faTimes} className="inspector-color-close" onClick={this.hide} />
				</Row>
				<Row>
					<SketchPicker onChange={this.onChange} onChangeComplete={this.props.onChangeComplete} color={this.state.color} />
				</Row>
			</div>
		);
	}
}
