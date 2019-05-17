import React from 'react';
import ReactDOM from 'react-dom';
import Api from '../../Api';
import './EditorCanvas.css';

/* global $ */
export default class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subCircuits: null,
			rootComponents: null,
			categories: null,
			loaded: false,
			isMouseDown: false,
			startMouseX: -1,
			startMouseY: -1,
			canvasLocalMouseX: -1,
			canvasLocalMouseY: -1,
			canvasWidth: 0,
			canvasHeight: 0,
			viewerOffsetX: 0,
			viewerOffsetY: 0,
			currentImage: null,
			contextMenuX: -1,
			contextMenuY: -1,
			scaleFactor: 1,
			drawComponentX: 0,
			drawComponentY: 0,
			temporaryComponents: [],
			currentSubCircuit: -1
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.onRightClick = this.onRightClick.bind(this);
	}

	async componentDidUpdate(prevProps, prevState) {
		if ((!prevProps.circuit && this.props.circuit) || (prevProps.side !== this.props.side)) {
			this.setState({
				currentImage: null,
				startMouseX: -1,
				startMouseY: -1,
				canvasLocalMouseX: -1,
				canvasLocalMouseY: -1,
				canvasWidth: 0,
				canvasHeight: 0,
				viewerOffsetX: 0,
				viewerOffsetY: 0,
				scaleFactor: 1,
				temporaryComponents: [],
				currentSubCircuit: -1
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
		const categories = await Api.api.circuit.getCircuitCategories({
			circuitId: this.props.circuit.circuitId
		});

		this.setState({
			subCircuits: subCircuits.body,
			rootComponents: rootComponents.body,
			categories: categories.body,
			loaded: true
		});
	}

	onMouseDown(e) {
		//if ((this.props.mode === 'view' && e.button === 0) || (this.props.mode === 'edit' && e.button === 1)) {
		const rect = $('#editor-canvas')[0].getBoundingClientRect();
		this.setState({
			isMouseDown: true,
			startMouseX: e.pageX - rect.left - this.state.viewerOffsetX,
			startMouseY: e.pageY - rect.top - this.state.viewerOffsetY,
			canvasLocalMouseX: e.pageX - rect.left,
			canvasLocalMouseY: e.pageY - rect.top,
			contextMenuX: -1,
			contextMenuY: -1
		});
		//}
	}

	onMouseUp() {
		if (this.props.mode === 'edit' && (this.state.drawComponentX > this.state.canvasWidth / 30 && this.state.drawComponentY > this.state.canvasHeight / 30)) {
			const increaseX = this.state.currentImage.width / this.state.canvasWidth;
			const increaseY = this.state.currentImage.height / this.state.canvasHeight;
			const noneCategory = this.state.categories.filter(x => x.name === 'None')[0];
			const component = {
				documentationUrl: '',
				bounds: {
					x: this.state.startMouseX - 20,
					y: this.state.startMouseY - 20,
					width: this.state.drawComponentX * increaseX / this.state.scaleFactor,
					height: this.state.drawComponentY * increaseY / this.state.scaleFactor
				},
				name: 'New Component',
				description: '',
				categoryId: noneCategory.categoryId,
				category: noneCategory
			};

			$.ajax({
				method: 'POST',
				url: 'http://localhost:8080/api/v1/circuit/' + this.props.circuit.circuitId + '/component?side=' + this.props.side,
				contentType: 'application/json',
				data: JSON.stringify(component)
			});

			this.state.rootComponents.push(component);
		}
		this.setState({
			isMouseDown: false,
			startMouseX: -1,
			startMouseY: -1,
			canvasLocalMouseX: -1,
			canvasLocalMouseY: -1,
			drawComponentX: -1,
			drawComponentY: -1
		});
	}

	clamp(x, low, high) {
		return Math.min(Math.max(x, low), high);
	}

	onMouseMove(e) {
		if (this.state.isMouseDown) {
			const rect = $('#editor-canvas')[0].getBoundingClientRect();

			if (this.props.mode === 'view') {
				const offsets = this.getRescaleOffsets((e.pageX - rect.left) - this.state.startMouseX, (e.pageY - rect.top) - this.state.startMouseY, this.state.scaleFactor);
				this.setState({
					viewerOffsetX: offsets[0],
					viewerOffsetY: offsets[1]
				});
			} else if (this.props.mode === 'edit') {
				this.setState({
					drawComponentX: (e.pageX - rect.left) - this.state.canvasLocalMouseX,
					drawComponentY: (e.pageY - rect.top) - this.state.canvasLocalMouseY
				});
			}
		}
	}

	getRescaleOffsets(changeX, changeY, scale) {
		return [
			Math.min(0, Math.max(changeX, -(this.state.currentImage.width - this.state.currentImage.width / scale))),
			Math.min(0, Math.max(changeY, -(this.state.currentImage.height - this.state.currentImage.height / scale)))
		];
	}

	onRightClick(e) {
		e.preventDefault();

		this.setState({
			contextMenuX: e.pageX,
			contextMenuY: e.pageY
		});
	}

	onContextMenuClick(button) {
		this.setState({
			contextMenuX: -1,
			contextMenuY: -1
		});
	}

	onScroll(e) {
		const increase = -e.deltaY / 500;
		const newScale = this.clamp(this.state.scaleFactor + increase, 1, 5);
		const offsets = this.getRescaleOffsets(this.state.viewerOffsetX, this.state.viewerOffsetY, newScale);
		this.setState({
			scaleFactor: newScale,
			viewerOffsetX: offsets[0],
			viewerOffsetY: offsets[1]
		});

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
						let width = $(canvas).width();
						let height = (image.height / image.width) * width;

						canvas.width = width;
						canvas.height = height;

						$(canvas).height(height);

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
					ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

					const widthRatio = this.state.canvasWidth / this.state.currentImage.width;
					const heightRatio = this.state.canvasHeight / this.state.currentImage.height;

					ctx.drawImage(
						this.state.currentImage,
						-this.state.viewerOffsetX,
						-this.state.viewerOffsetY,
						this.state.currentImage.width / this.state.scaleFactor,
						this.state.currentImage.height / this.state.scaleFactor,
						0,
						0,
						this.state.canvasWidth,
						this.state.canvasHeight);

					ctx.strokeStyle = '#000000';

					for (const component of this.state.rootComponents) {
						const rgb = this.hexToRgb(component.category.color);
						ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.75)';
						ctx.fillRect(
							(this.state.viewerOffsetX + component.bounds.x) * widthRatio * this.state.scaleFactor,
							(this.state.viewerOffsetY + component.bounds.y) * heightRatio * this.state.scaleFactor,
							component.bounds.width * widthRatio * this.state.scaleFactor,
							component.bounds.height * heightRatio * this.state.scaleFactor);

						ctx.fillStyle = '#000000';
						ctx.font = (1.5 * this.state.scaleFactor) + 'rem Arial';
						ctx.fillText(
							component.name,
							(this.state.viewerOffsetX + component.bounds.x) * widthRatio * this.state.scaleFactor,
							(this.state.viewerOffsetY + component.bounds.y) * heightRatio * this.state.scaleFactor);
					}

					if (this.state.drawComponentX !== -1 && this.state.drawComponentY !== -1) {
						ctx.fillStyle = 'rgba(200, 200, 200, 0.75)';
						ctx.fillRect(
							this.state.canvasLocalMouseX - 20,
							this.state.canvasLocalMouseY - 20,
							this.state.drawComponentX,
							this.state.drawComponentY
						);
					}
				}
			});
		}, 0);
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
						onWheelCapture={this.onScroll}
						/*onContextMenu={this.onRightClick}*/ />
					{/*<ButtonGroup style={{
						visibility: this.state.contextMenuX === -1 ? 'hidden' : 'visible',
						position: 'fixed',
						left: this.state.contextMenuX,
						top: this.state.contextMenuY
					}} className="editor-context-menu" vertical={true}>
						<Button variant="light" onClick={() => this.onContextMenuClick('component')}>New Component</Button>
						<Button variant="light" onClick={() => this.onContextMenuClick('subCircuit')}>New Subcircuit</Button>
					</ButtonGroup>*/}
				</>
			);
		} else {
			return (null);
		}
	}
};
