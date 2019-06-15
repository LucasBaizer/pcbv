import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import Api from '../../Api';
import './EditorCanvas.css';
import CenteredSpinner from './CenteredSpinner';

/* global $ */
export default class EditorCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subCircuits: null,
			components: null,
			categories: null,
			selectedCategories: [],
			loaded: false,
			isMouseDown: false,
			mouseMoved: false,
			currentMouseButton: -1,
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
			currentSubCircuit: -1,
			currentSubCircuitImage: null,
			currentSubCircuitImageType: null,
			selectedComponentId: -1,
			selectedSubCircuitId: -1,
			searchText: '',
			redrawCallback: null,
			redrawComponent: -1,
			redrawType: -1,
			deltaX: 0,
			deltaY: 0,
			drawingSubCircuit: false,
			loadingDifferent: false,
			isDoubleClicking: false,
			doubleClickTimeout: null
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.onRightClick = this.onRightClick.bind(this);
		this.onDoubleClick = this.onDoubleClick.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
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
				deltaX: 0,
				deltaY: 0,
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
		const components = await Api.api.circuit.getCircuitComponents({
			circuitId: this.props.circuit.circuitId,
			side: this.props.side
		});
		const categories = await Api.api.circuit.getCircuitCategories({
			circuitId: this.props.circuit.circuitId
		});

		this.setState({
			components: components.body,
			subCircuits: subCircuits.body,
			categories: categories.body,
			currentImage: null,
			currentSubCircuit: -1,
			currentSubCircuitImage: null,
			currentSubCircuitImageType: null,
			loaded: true
		});
	}

	onKeyPress(e) {
		e.preventDefault();

		if (e.key === 'Escape') {
			if (this.state.drawComponentX !== -1 && this.state.drawComponentY !== -1) {
				this.setState({
					drawComponentX: -1,
					drawComponentY: -1,
					isMouseDown: false
				});
			}

			if (this.state.selectedComponentId !== -1) {
				const component = this.state.components.filter(component => component.componentId === this.state.selectedComponentId)[0];
				if (component.designator === '' && component.name === '') {
					this.deleteCurrentComponent();
				} else {
					this.setState({
						selectedComponentId: -1
					});
				}

				this.props.onComponentSelected(null);
			}
		} else if (e.key === 'Delete') {
			if (this.state.selectedComponentId !== -1) {
				this.deleteCurrentComponent();
				this.props.onComponentSelected(null);
			}
		}
	}

	deleteCurrentComponent() {
		if (this.state.currentSubCircuit !== -1) {
			Api.api.circuit.deleteSubCircuitComponent({
				circuitId: this.props.circuit.circuitId,
				subCircuitId: this.state.currentSubCircuit,
				componentId: this.state.selectedComponentId
			});
		} else {
			Api.api.circuit.deleteCircuitComponent({
				circuitId: this.props.circuit.circuitId,
				componentId: this.state.selectedComponentId
			});
		}
		this.updateCurrentComponent(this.state.components.filter(component => component.componentId === this.state.selectedComponentId)[0], 'delete');
	}

	updateCategories(categories) {
		for (const component of this.state.components) {
			for (const category of categories) {
				if (component.category.categoryId === category.categoryId) {
					component.category = category;
				}
			}
		}
		this.setState({
			categories: categories
		});
	}

	updateCurrentComponent(component, type) {
		const clone = [...this.state.components];
		const index = clone.findIndex(value => value.componentId === component.componentId);

		if (type === 'delete') {
			clone.splice(index, 1);
			this.setState({
				components: clone,
				selectedComponentId: -1
			});
		} else if (type === 'move') {
			return new Promise((resolve, reject) => {
				this.setState({
					redrawCallback: resolve,
					redrawComponent: component.componentId,
					redrawType: 0
				});
			});
		} else {
			clone[index] = component;
			this.setState({
				components: clone
			});
		}
	}

	updateCurrentSubCircuit(subCircuit, type) {
		const clone = [...this.state.subCircuits];
		const index = clone.findIndex(value => value.subCircuitId === subCircuit.subCircuitId);

		if (type === 'delete') {
			clone.splice(index, 1);
			this.setState({
				subCircuits: clone,
				selectedSubCircuitId: -1
			});
		} else if (type === 'move') {
			return new Promise((resolve, reject) => {
				this.setState({
					redrawCallback: resolve,
					redrawComponent: subCircuit.subCircuitId,
					redrawType: 1
				});
			});
		} else {
			clone[index] = subCircuit;
			this.setState({
				subCircuits: clone
			});
		}
	}

	updateSearchText(text) {
		this.setState({
			searchText: text
		});
	}

	updateSelectedCategories(categories) {
		this.setState({
			selectedCategories: categories
		});
	}

	isComponentEligible(component) {
		const searchTextRegex = new RegExp(this.state.searchText, 'i');

		if (this.state.selectedCategories.indexOf(component.category.categoryId) === -1) {
			return false;
		}
		if (this.state.redrawComponent === component.componentId) {
			return false;
		}
		if (this.state.searchText !== '') {
			if (!searchTextRegex.test(component.name) && !searchTextRegex.test(component.description) && !searchTextRegex.test(component.designator)) {
				return false;
			}
		}
		return true;
	}

	onMouseDown(e) {
		const rect = this.canvas.getBoundingClientRect();
		this.setState({
			isMouseDown: true,
			currentMouseButton: e.button,
			startMouseX: e.pageX - rect.left - this.state.viewerOffsetX,
			startMouseY: e.pageY - rect.top - this.state.viewerOffsetY,
			canvasLocalMouseX: e.pageX - rect.left,
			canvasLocalMouseY: e.pageY - rect.top,
			contextMenuX: -1,
			contextMenuY: -1,
			deltaX: e.pageX - rect.left,
			deltaY: e.pageY - rect.top
		});
	}

	onMouseUp(e) {
		let changedSelectedComponent = false;
		if (this.props.mode === 'edit' && (Math.abs(this.state.drawComponentX) > 10 && Math.abs(this.state.drawComponentY) > 10) && e.button === 0) {
			const increaseX = this.state.currentImage.width / this.state.canvasWidth;
			const increaseY = this.state.currentImage.height / this.state.canvasHeight;
			const noneCategory = this.state.categories.filter(x => x.name === 'None')[0];

			let x = this.state.canvasLocalMouseX - 20;
			let y = this.state.canvasLocalMouseY - 20;
			let w = this.state.drawComponentX;
			let h = this.state.drawComponentY;

			if (w < 0) {
				x += w;
				w = Math.abs(w);
			}
			if (h < 0) {
				y += h;
				h = Math.abs(h);
			}

			const bounds = {
				x: x * increaseX / this.state.scaleFactor - this.state.viewerOffsetX,
				y: y * increaseY / this.state.scaleFactor - this.state.viewerOffsetY,
				width: w * increaseX / this.state.scaleFactor,
				height: h * increaseY / this.state.scaleFactor
			};

			if (!this.state.drawingSubCircuit && this.state.redrawType !== 1) {
				const component = {
					documentationUrl: '',
					bounds: bounds,
					name: '',
					description: '',
					designator: '',
					categoryId: noneCategory.categoryId,
					category: noneCategory
				};

				if (this.state.redrawType === 0) {
					this.state.redrawCallback(component.bounds);
				} else {
					let url;
					if (this.state.currentSubCircuit === -1) {
						url = Api.prefix + '/api/v1/circuit/' + this.props.circuit.circuitId + '/component?side=' + this.props.side;
					} else {
						url = Api.prefix + '/api/v1/circuit/' + this.props.circuit.circuitId + '/subcircuit/' + this.state.currentSubCircuit + '/component';
					}
					$.ajax({
						method: 'POST',
						url: url,
						contentType: 'application/json',
						data: JSON.stringify(component),
						success: data => {
							const clone = [...this.state.components];
							clone[this.state.components.length - 1] = data;
							this.setState({
								components: clone,
								selectedComponentId: data.componentId,
								selectedSubCircuitId: -1
							});
							this.props.onComponentSelected(data);
							this.props.onSubCircuitSelected(null);
						}
					});

					this.state.components.push(component);
				}
			} else {
				const subCircuit = {
					image: null,
					bounds: bounds,
					imageType: null
				};

				if (this.state.redrawType === 1) {
					this.state.redrawCallback(bounds);
				} else {
					$.ajax({
						method: 'POST',
						url: Api.prefix + '/api/v1/circuit/' + this.props.circuit.circuitId + '/subcircuit?side=' + this.props.side,
						contentType: 'application/json',
						data: JSON.stringify(subCircuit),
						success: data => {
							const clone = [...this.state.subCircuits];
							clone[clone.length - 1] = data;
							this.setState({
								subCircuits: clone
							});
						}
					});

					this.state.subCircuits.push(subCircuit);
				}
			}
		} else if (!this.state.mouseMoved && e.button === 0) {
			const rect = this.canvas.getBoundingClientRect();
			const widthRatio = this.state.canvasWidth / this.state.currentImage.width;
			const heightRatio = this.state.canvasHeight / this.state.currentImage.height;

			const backwardsSort = [...this.state.components].sort((a, b) => b.componentId - a.componentId);

			const px = e.pageX - rect.left - 20;
			const py = e.pageY - rect.top - 20;
			for (const component of backwardsSort) {
				if (!this.isComponentEligible(component)) {
					continue;
				}
				const x = (this.state.viewerOffsetX + component.bounds.x) * widthRatio * this.state.scaleFactor;
				const y = (this.state.viewerOffsetY + component.bounds.y) * heightRatio * this.state.scaleFactor;
				const w = component.bounds.width * widthRatio * this.state.scaleFactor;
				const h = component.bounds.height * heightRatio * this.state.scaleFactor;

				if (px > x && px < x + w && py > y && py < y + h) {
					if (this.state.selectedComponentId === component.componentId) {
						break;
					}
					changedSelectedComponent = true;
					this.setState({
						selectedComponentId: component.componentId,
						selectedSubCircuitId: -1
					});
					this.props.onComponentSelected(component);
					this.props.onSubCircuitSelected(null);
					break;
				}
			}
			if (!changedSelectedComponent) {
				let deselected = false;
				if (this.props.showSubCircuits && this.state.selectedSubCircuitId !== -1) {
					const widthRatio = this.state.canvasWidth / this.state.currentImage.width;
					const heightRatio = this.state.canvasHeight / this.state.currentImage.height;
					const px = e.pageX - rect.left - 20;
					const py = e.pageY - rect.top - 20;

					const subCircuit = this.state.subCircuits.filter(subCircuit => subCircuit.subCircuitId === this.state.selectedSubCircuitId)[0];

					const x = (this.state.viewerOffsetX + subCircuit.bounds.x) * widthRatio * this.state.scaleFactor;
					const y = (this.state.viewerOffsetY + subCircuit.bounds.y) * heightRatio * this.state.scaleFactor;
					const w = subCircuit.bounds.width * widthRatio * this.state.scaleFactor;
					const h = subCircuit.bounds.height * heightRatio * this.state.scaleFactor;

					if (px < x || px > x + w || py < y || py > y + h) {
						this.setState({
							selectedSubCircuitId: -1
						});
						this.props.onSubCircuitSelected(null);
					}
				}
				if (!deselected) {
					if (this.props.showSubCircuits && this.state.currentSubCircuit === -1) {
						const widthRatio = this.state.canvasWidth / this.state.currentImage.width;
						const heightRatio = this.state.canvasHeight / this.state.currentImage.height;
						const px = e.pageX - rect.left - 20;
						const py = e.pageY - rect.top - 20;

						const backwardsSubCircuits = [...this.state.subCircuits].sort((a, b) => b.subCircuitId - a.subCircuitId);

						for (const subCircuit of backwardsSubCircuits) {
							const x = (this.state.viewerOffsetX + subCircuit.bounds.x) * widthRatio * this.state.scaleFactor;
							const y = (this.state.viewerOffsetY + subCircuit.bounds.y) * heightRatio * this.state.scaleFactor;
							const w = subCircuit.bounds.width * widthRatio * this.state.scaleFactor;
							const h = subCircuit.bounds.height * heightRatio * this.state.scaleFactor;

							if (px > x && px < x + w && py > y && py < y + h) {
								if (this.state.isDoubleClicking) {
									clearTimeout(this.state.doubleClickTimeout);
									this.setState({
										isDoubleClicking: false,
										doubleClickTimeout: null
									});
									this.onDoubleClick(e);
								} else {
									this.setState({
										isDoubleClicking: true,
										doubleClickTimeout: setTimeout(() => {
											this.setState({
												selectedSubCircuitId: subCircuit.subCircuitId,
												isDoubleClicking: false
											});
											this.props.onSubCircuitSelected(subCircuit);
											deselected = true;
										}, 200)
									});
								}

								break;
							}
						}
					}
				}
			}
		}
		let newState = {
			isMouseDown: false,
			mouseMoved: false,
			currentMouseButton: -1,
			startMouseX: -1,
			startMouseY: -1,
			canvasLocalMouseX: -1,
			canvasLocalMouseY: -1,
			drawComponentX: -1,
			drawComponentY: -1,
			deltaX: 0,
			deltaY: 0,
			drawingSubCircuit: false
		};
		if (this.props.mode === 'edit' && e.button === 0) {
			newState = {
				...newState,
				redrawCallback: null,
				redrawComponent: -1,
				redrawType: -1
			};
		}
		if (!changedSelectedComponent && !this.state.redrawCallback) {
			newState.selectedComponentId = -1;
			this.props.onComponentSelected(null);
		}
		this.setState(newState);
	}

	clamp(x, low, high) {
		return Math.min(Math.max(x, low), high);
	}

	onMouseMove(e) {
		if (this.state.isMouseDown) {
			const rect = this.canvas.getBoundingClientRect();

			if ((this.props.mode === 'view' && this.state.currentMouseButton === 0) || (this.props.mode === 'edit' && this.state.currentMouseButton === 1)) {
				const deltaX = ((e.pageX - rect.left) - this.state.deltaX) * (this.state.currentImage.width / this.state.canvasWidth) / this.state.scaleFactor;
				const deltaY = ((e.pageY - rect.top) - this.state.deltaY) * (this.state.currentImage.height / this.state.canvasHeight) / this.state.scaleFactor;
				const offsets = this.getRescaleOffsets(this.state.viewerOffsetX + deltaX, this.state.viewerOffsetY + deltaY, this.state.scaleFactor);
				this.setState({
					viewerOffsetX: offsets[0],
					viewerOffsetY: offsets[1],
					deltaX: e.pageX - rect.left,
					deltaY: e.pageY - rect.top
				});
			} else if (this.props.mode === 'edit' && this.state.currentMouseButton === 0) {
				this.setState({
					drawComponentX: (e.pageX - rect.left) - this.state.canvasLocalMouseX,
					drawComponentY: (e.pageY - rect.top) - this.state.canvasLocalMouseY
				});
			}

			if (!this.state.mouseMoved && ((e.pageX - rect.left) !== this.state.canvasLocalMouseX) && ((e.pageY - rect.top) !== this.state.canvasLocalMouseY)) {
				this.setState({
					mouseMoved: true
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

	async onDoubleClick(e) {
		const rect = this.canvas.getBoundingClientRect();
		if (this.props.showSubCircuits && this.state.currentSubCircuit === -1) {
			const widthRatio = this.state.canvasWidth / this.state.currentImage.width;
			const heightRatio = this.state.canvasHeight / this.state.currentImage.height;
			const px = e.pageX - rect.left - 20;
			const py = e.pageY - rect.top - 20;

			const backwardsSubCircuits = [...this.state.subCircuits].sort((a, b) => b.subCircuitId - a.subCircuitId);

			for (const subCircuit of backwardsSubCircuits) {
				const x = (this.state.viewerOffsetX + subCircuit.bounds.x) * widthRatio * this.state.scaleFactor;
				const y = (this.state.viewerOffsetY + subCircuit.bounds.y) * heightRatio * this.state.scaleFactor;
				const w = subCircuit.bounds.width * widthRatio * this.state.scaleFactor;
				const h = subCircuit.bounds.height * heightRatio * this.state.scaleFactor;

				if (px > x && px < x + w && py > y && py < y + h) {
					this.setState({
						loadingDifferent: true
					});

					const components = await Api.api.circuit.getSubCircuitComponents({
						circuitId: this.props.circuit.circuitId,
						subCircuitId: subCircuit.subCircuitId
					});
					const sc = await Api.api.circuit.getSubCircuit({
						circuitId: this.props.circuit.circuitId,
						subCircuitId: subCircuit.subCircuitId
					});

					if (sc.body.imageType === null) {
						this.setState({
							loadingDifferent: false
						});
						return;
					}

					this.setState({
						components: components.body,
						currentImage: null,
						currentSubCircuit: subCircuit.subCircuitId,
						currentSubCircuitImage: sc.body.image,
						currentSubCircuitImageType: sc.body.imageType,
						loadingDifferent: false,
						scaleFactor: 1,
						viewerOffsetX: 0,
						viewerOffsetY: 0,
						selectedComponentId: -1,
						selectedSubCircuitId: -1
					});

					this.props.onComponentSelected(null);
					this.props.onSubCircuitSelected(null);
					this.props.onSubCircuitChanged(subCircuit.subCircuitId);
				}
			}
		}
	}

	onRightClick(e) {
		e.preventDefault();

		if (this.state.currentSubCircuit === -1) {
			this.setState({
				contextMenuX: e.pageX,
				contextMenuY: e.pageY
			});
		}
	}

	onContextMenuClick(button) {
		const state = {
			contextMenuX: -1,
			contextMenuY: -1
		};
		if (button === 'subCircuit') {
			state.drawingSubCircuit = true;
		}
		this.setState(state);
	}

	onScroll(e) {
		const increase = -e.deltaY / 500;
		const newScale = this.clamp(this.state.scaleFactor + increase, 1, this.state.currentImage.width / this.state.canvasWidth);
		const changeX = (this.state.currentImage.width / this.state.scaleFactor - this.state.currentImage.width / newScale) / 2;
		const changeY = (this.state.currentImage.height / this.state.scaleFactor - this.state.currentImage.height / newScale) / 2;
		const offsets = this.getRescaleOffsets(this.state.viewerOffsetX - changeX, this.state.viewerOffsetY - changeY, newScale);
		this.setState({
			scaleFactor: newScale,
			viewerOffsetX: offsets[0],
			viewerOffsetY: offsets[1]
		});
	}

	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			a: parseInt(result[4], 16) / 255
		} : null;
	}

	redraw() {
		if (this.props.circuit === null) {
			return;
		}
		setTimeout(() => {
			window.requestAnimationFrame(() => {
				const canvas = this.canvas;
				if (!canvas) {
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
					if (this.state.currentSubCircuit !== -1) {
						image.src = 'data:image/' + this.state.currentSubCircuitImageType + ';base64,' + this.state.currentSubCircuitImage;
					} else {
						image.src = 'data:image/' + this.props.circuit.imageType + ';base64,' + (this.props.side === 'front' ? this.props.circuit.imageFront : this.props.circuit.imageBack);
					}
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

					for (const component of this.state.components) {
						if (!this.isComponentEligible(component)) {
							continue;
						}

						const rgb = this.hexToRgb(component.category.color);
						if (this.state.selectedComponentId === component.componentId) {
							ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
						} else {
							ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
						}
						ctx.fillRect(
							(this.state.viewerOffsetX + component.bounds.x) * widthRatio * this.state.scaleFactor,
							(this.state.viewerOffsetY + component.bounds.y) * heightRatio * this.state.scaleFactor,
							component.bounds.width * widthRatio * this.state.scaleFactor,
							component.bounds.height * heightRatio * this.state.scaleFactor);

						ctx.fillStyle = '#000000';

						let lines;
						if (this.props.componentMode === 'name') {
							lines = (component.name || 'New Component').split(' ');
						} else if (this.props.componentMode === 'designator') {
							lines = component.designator.split(' ');
						}

						const longest = [...lines].sort((a, b) => b.length - a.length)[0];
						const fontSize = Math.min(component.bounds.width * widthRatio * this.state.scaleFactor / longest.length * 1.5, component.bounds.height * heightRatio * this.state.scaleFactor / lines.length);
						ctx.font = fontSize + 'px Courier';
						ctx.textBaseline = 'middle';
						const fontHeight = ctx.measureText('O').width; // width of capital O is very close to height

						const middle = (this.state.viewerOffsetY + component.bounds.y) * heightRatio * this.state.scaleFactor + (component.bounds.height * heightRatio * this.state.scaleFactor / 2);
						const topMiddle = (lines.length === 1) ? middle : (middle - lines.length * fontHeight / 2);

						const xOffset = (this.state.viewerOffsetX + component.bounds.x) * widthRatio * this.state.scaleFactor + (component.bounds.width * widthRatio * this.state.scaleFactor / 2);
						let yOffset = topMiddle;
						for (const line of lines) {
							const width = ctx.measureText(line).width;
							ctx.fillText(
								line,
								xOffset - (width / 2),
								yOffset);
							yOffset += fontSize;
						}
					}

					if (this.props.showSubCircuits && this.state.currentSubCircuit === -1) {
						for (const subCircuit of this.state.subCircuits) {
							if(this.state.redrawComponent === subCircuit.subCircuitId) {
								continue;
							}
							
							if (this.state.selectedSubCircuitId === subCircuit.subCircuitId) {
								ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
							} else {
								ctx.fillStyle = 'rgb(127, 127, 127, 0.5)';
							}
							ctx.fillRect(
								(this.state.viewerOffsetX + subCircuit.bounds.x) * widthRatio * this.state.scaleFactor,
								(this.state.viewerOffsetY + subCircuit.bounds.y) * heightRatio * this.state.scaleFactor,
								subCircuit.bounds.width * widthRatio * this.state.scaleFactor,
								subCircuit.bounds.height * heightRatio * this.state.scaleFactor);
						}
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
					{this.state.loadingDifferent && (
						<div className="loading-overlay">
							<CenteredSpinner size={150} />
						</div>
					)}
					<canvas
						tabIndex="0"
						className="editor-canvas"
						ref={canvas => this.canvas = canvas}
						onMouseDownCapture={this.onMouseDown}
						onMouseUpCapture={this.onMouseUp}
						onMouseMoveCapture={this.onMouseMove}
						onWheelCapture={this.onScroll}
						onContextMenuCapture={this.onRightClick}
						onKeyDown={this.onKeyPress} />
					<ButtonGroup style={{
						visibility: this.state.contextMenuX === -1 ? 'hidden' : 'visible',
						position: 'fixed',
						left: this.state.contextMenuX,
						top: this.state.contextMenuY
					}} className="editor-context-menu" vertical={true}>
						<Button variant="light" onClick={() => this.onContextMenuClick('subCircuit')}>New Subcircuit</Button>
					</ButtonGroup>
				</>
			);
		} else {
			return this.state.loadingDifferent ? (
				<div className="loading-overlay">
					<CenteredSpinner size={150} />
				</div>
			) : (null);
		}
	}
};
