import React from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup } from 'react-bootstrap';
import Api from '../../Api';
import './EditorCanvas.css';

/* global $ */
export default class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subCircuits: null,
			rootComponents: null,
			loaded: false,
			isMouseDown: false,
			startMouseX: -1,
			startMouseY: -1,
			canvasWidth: 0,
			canvasHeight: 0,
			viewerOffsetX: 0,
			viewerOffsetY: 0,
			currentImage: null,
			contextMenuX: -1,
			contextMenuY: -1
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onRightClick = this.onRightClick.bind(this);
	}

	async componentDidUpdate(prevProps, prevState) {
		if ((!prevProps.circuit && this.props.circuit) || (prevProps.side !== this.props.side)) {
			this.setState({
				currentImage: null,
				startMouseX: -1,
				startMouseY: -1,
				canvasWidth: 0,
				canvasHeight: 0,
				viewerOffsetX: 0,
				viewerOffsetY: 0
			});

			await this.updateCurrentSide();

			if (this.props.onLoad) {
				this.props.onLoad();
			}
		}
	}

	async updateCurrentSide() {
		this.setState({
			loaded: false
		});

		const subCircuits = await Api.api.circuit.getSubCircuits({
			circuitId: this.props.circuit.circuitId,
			side: this.props.side
		});
		const rootComponents = await Api.api.circuit.getCircuitComponents({
			circuitId: this.props.circuit.circuitId,
			side: this.props.side
		});

		this.setState({
			subCircuits: subCircuits.body,
			rootComponents: rootComponents.body,
			loaded: true
		});
	}

	onMouseDown(e) {
		const rect = $('#editor-canvas')[0].getBoundingClientRect();
		this.setState({
			isMouseDown: true,
			startMouseX: e.clientX - rect.left - this.state.viewerOffsetX,
			startMouseY: e.clientY - rect.top - this.state.viewerOffsetY,
			contextMenuX: -1,
			contextMenuY: -1
		});
	}

	onMouseUp() {
		this.setState({
			isMouseDown: false,
			startMouseX: -1,
			startMouseY: -1
		});
	}

	onMouseMove(e) {
		/*if (this.state.isMouseDown) {
			const rect = $('#editor-canvas')[0].getBoundingClientRect();

			this.setState({
				viewerOffsetX: (e.clientX - rect.left) - this.state.startMouseX,
				viewerOffsetY: (e.clientY - rect.top) - this.state.startMouseY
			});
		}*/
	}

	hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	redraw() {
		setTimeout(() => {
			window.requestAnimationFrame(() => {
				const canvas = ReactDOM.findDOMNode(this);
				if (canvas === null) {
					return;
				}

				if (this.state.currentImage === null) {
					const image = new Image();
					image.onload = () => {
						let width = canvas.width;
						let height = (image.height / image.width) * width;

						// $(canvas).height(height);
						canvas.height = height;

						this.setState({
							canvasWidth: width,
							canvasHeight: height,
							currentImage: image
						});
					};
					image.src = 'data:image/' + this.props.circuit.imageType + ';base64,' + (this.props.side === 'front' ? this.props.circuit.imageFront : this.props.circuit.imageBack);
				} else {
					/**
	  					@type {CanvasRenderingContext2D}
 					*/
					const ctx = canvas.getContext('2d');
					ctx.fillStyle = '#FFFFFF';
					console.log(this.state.canvasWidth);
					ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

					console.log('width: ' + canvas.clientWidth);
					console.log('height: ' + canvas.clientHeight);
					ctx.drawImage(this.state.currentImage, 0, 0, this.state.canvasWidth, this.state.canvasHeight);

					ctx.strokeStyle = '#000000';
					for (const component of this.state.rootComponents) {
						const rgb = this.hexToRgb(component.category.color);
						ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.5)';
						ctx.fillRect(component.bounds.x, component.bounds.y, component.bounds.width, component.bounds.height);

						ctx.fillStyle = '#000000';
						ctx.fillText(component.name, component.bounds.x, component.bounds.y);
					}
				}
			});
		}, 0);
	}

	onRightClick(e) {
		e.preventDefault();

		this.setState({
			contextMenuX: e.clientX,
			contextMenuY: e.clientY
		});
	}

	onContextMenuClick(button) {
		this.setState({
			contextMenuX: -1,
			contextMenuY: -1
		});
	}

	render() {
		this.redraw();

		if (this.state.loaded) {
			return (
				<>
					<canvas
						id="editor-canvas"
						onMouseDownCapture={this.onMouseDown}
						onMouseUpCapture={this.onMouseUp}
						onMouseMoveCapture={this.onMouseMove}
						onContextMenu={this.onRightClick}
						height={this.state.canvasHeight} />
					<ButtonGroup style={{
						visibility: this.state.contextMenuX === -1 ? 'hidden' : 'visible',
						position: 'fixed',
						left: this.state.contextMenuX,
						top: this.state.contextMenuY
					}} className="editor-context-menu" vertical={true}>
						<Button variant="light" onClick={() => this.onContextMenuClick('component')}>New Component</Button>
						<Button variant="light" onClick={() => this.onContextMenuClick('subCircuit')}>New Subcircuit</Button>
					</ButtonGroup>
				</>
			);
		} else {
			return (null);
		}
	}
};
