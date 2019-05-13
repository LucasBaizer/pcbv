import React from 'react';
import { Container, Row, Col, Jumbotron, Button, Card } from 'react-bootstrap';
import './Homepage.css';

export default class Homepage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.onStartNow = this.onStartNow.bind(this);
	}

	onStartNow() {
		this.props.history.push('/create');
	}

	render() {
		return (
			<>
				<Container className="homepage-container">
					<Row>
						<Col md={{ offset: 2, span: 8 }}>
							<Jumbotron>
								<h1>Work with PCBs more efficiently than ever.</h1>
								<p>Analyse, annotate, and document components of PCBs efficiently within your browser.</p>
								<p><Button variant="primary" onClick={this.onStartNow}>Start Now</Button></p>
							</Jumbotron>
						</Col>
					</Row>
					<Row>
						<Col md={{ offset: 2, span: 2 }}>
							<Card>
								<Card.Img variant="top" src="/images/HomepageCardPCB.png" />
								<Card.Body>
									<Card.Title>Quick Setup</Card.Title>
									<Card.Text>Simply upload the front and back side of a PCB and jump in to working with it.</Card.Text>
								</Card.Body>
							</Card>
						</Col>
						<Col md={{ offset: 1, span: 2 }}>
							<Card>
								<Card.Body>
									<Card.Title>In-Depth Annotating</Card.Title>
									<Card.Text>Annotate individual components and sections of a PCB.</Card.Text>
								</Card.Body>
							</Card>
						</Col>
						<Col md={{ offset: 1, span: 2 }}>
							<Card>
								<Card.Body>
									<Card.Title>Align Components</Card.Title>
									<Card.Text>Use PCBV's Component Alignment tool to find components which are on opposite sides of each other.</Card.Text>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Container>
			</>
		);
	}
};
