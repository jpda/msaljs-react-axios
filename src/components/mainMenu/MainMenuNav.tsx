import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { Link, NavLink } from 'react-router-dom'
import AuthService from "../auth/AuthService";

interface Props {
  AuthService: AuthService;
}

interface State {
  userName: string;
}

export default class MainMenuNav extends React.Component<Props, State> {
  auth: AuthService;
  constructor(p: Props) {
    super(p);
    this.auth = p.AuthService;

    if (this.auth.msalObj.getAccount()) {
      this.state = { userName: this.auth.msalObj.getAccount().userName };
    }
  }

  login(e: any) {
    e.preventDefault();
    this.auth.login().then(x => {
      if (x) {
        this.setState({ userName: x.userName });
      }
    });
  }

  logout(e: any) {
    e.preventDefault();
    this.auth.logout();
  }


  render() {
    return (
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
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
              <Nav className="justify-content-end" style={{ width: "100%" }}>
                {(() => {
                  if (this.state === null || this.state.userName === null) {
                    return <button className="btn btn-primary" onClick={this.login.bind(this)}>Log in</button>
                  } else {
                    return <Navbar.Text>
                      <button className="btn btn-primary" onClick={this.logout.bind(this)}>Log out {this.state.userName}</button>
                    </Navbar.Text>
                  }
                })()}
              </Nav>
            </Navbar.Collapse>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}