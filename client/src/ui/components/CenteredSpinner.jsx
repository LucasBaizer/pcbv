import React from 'react';
import MDSpinner from 'react-md-spinner';

export default class CenteredSpinner extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}


	render() {
		return (
			<>
				<MDSpinner size={this.props.size} style={{
					position: 'fixed',
					left: (window.innerWidth / 2) - (this.props.size / 2),
					top: (window.innerHeight / 2) - (this.props.size / 2)
				}} />
			</>
		);
	}
};
