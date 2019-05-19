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
			color: {
				r: 0,
				g: 0,
				b: 0,
				a: 1
			}
		};

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			a: parseInt(result[4], 16) / 256
		} : null;
	}

	show(color, x, y) {
		this.setState({
			show: true,
			color: this.hexToRgb(color),
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
			color: e.rgb
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
