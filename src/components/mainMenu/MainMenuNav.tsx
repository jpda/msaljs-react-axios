import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Link, NavLink } from 'react-router-dom'
import AuthService from "../auth/AuthService";

interface Props {
  AuthService: AuthService;
}

export default class MainMenuNav extends React.Component<Props> {
  auth: AuthService;
  constructor(p: Props) {
    super(p);
    this.auth = p.AuthService;
  }

  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Row>
            <Navbar.Brand as={Link} to="/">msaljs</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link as={NavLink} to="/" exact>Home</Nav.Link>
                <Nav.Link as={NavLink} to="/graph" exact>Graph</Nav.Link>
                <Nav.Link as={NavLink} to="/power" exact>Your API</Nav.Link>
                <Nav.Link as={NavLink} to="/graph" exact>Static</Nav.Link>
                <Nav.Link as={NavLink} to="/jit" exact>JIT scopes</Nav.Link>
                <Nav.Link as={NavLink} to="/inc" exact>Incrementals</Nav.Link>
                <Nav.Link as={NavLink} to="/groups" exact>Groups</Nav.Link>
                <Nav.Link as={NavLink} to="/approles" exact>Approles w/ user</Nav.Link>
                <Nav.Link as={NavLink} to="/claims" exact>Claims</Nav.Link>
              </Nav>
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  {this.auth.user}
                </Navbar.Text>
              </Navbar.Collapse>
            </Navbar.Collapse>
          </Row>
        </Container>
      </Navbar>
    );
  }
}