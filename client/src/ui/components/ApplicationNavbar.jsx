import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import Api from '../../Api';
import './ApplicationNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-solid-svg-icons';

export default class ApplicationNavbar extends React.Component {
    static lastPhrase = null;

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            phrase: ''
        };

        this.getNewPhrase = this.getNewPhrase.bind(this);
        this.navigateTo = this.navigateTo.bind(this);

        this.getNewPhrase();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.getNewPhrase();
        }
    }

    getNewPhrase() {
        Api.api.phrase.getPcbvPhrase()
            .then(phraseJson => {
                const phrase = phraseJson.body.phrase;
                if (phrase === ApplicationNavbar.lastPhrase) {
                    this.getNewPhrase();
                } else {
                    ApplicationNavbar.lastPhrase = phrase;
                    this.setState({
                        loading: false,
                        phrase: phrase
                    });
                }
            });
    }

    navigateTo(location) {
        console.log(location);
        this.props.history.push(location);
    }

    render() {
        return (
            <Navbar bg="light">
                <Navbar.Brand onClick={() => this.navigateTo('/')}>PCBV {!this.loading ? ('(' + this.state.phrase + ')') : ''}</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Nav>
                        <FontAwesomeIcon icon={faGithub} />
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Nav>
                        <Nav.Link onClick={() => this.navigateTo('/create')}>Create</Nav.Link>
                        <Nav.Link onClick={() => this.navigateTo('/align')}>Component Alignment</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
};
