import "./App.css";
import React, { Component } from "react";
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Container from "react-bootstrap/Container";
import MainMenuNav from "./components/mainMenu/MainMenuNav";
import ClaimsView from "./components/claims/ClaimsView";
import Home from "./components/home/Home";

import { PowerView } from "./components/power/PowerView";
import { GraphView } from "./components/graph/GraphView";
import AuthService from "./components/auth/AuthService";
import { Toast } from "react-bootstrap";

interface State {
  show: boolean;
  message: string;
}

class App extends Component<any, State> {
  endpoint: string;
  msalConfig: any;
  auth: AuthService;
  toastHandler: (s: boolean, m: string) => void;

  constructor(p: any, s: State) {
    super(p, s);
    this.endpoint = "https://remoteutils.azurewebsites.net/api";
    this.msalConfig = {
      config: {
        auth: {
          clientId: "31c0ca04-16fb-49b6-83a2-e8c8487ea4fd",
          authority: "https://login.microsoftonline.com/98a34a88-7940-40e8-af71-913452037f31",
          redirectUrl: "http://localhost:3000/#/"
        },
        cache: {
          cacheLocation: "sessionStorage"
        },
        protectedResourceMap: [
          ['https://remoteutils.azurewebsites.net/api/power', ["api://remote.jpda.app/power", "api://remote.jpda.app/wake"]],
          ['https://remoteutils.azurewebsites.net/api/wol', ["api://remote.jpda.app/power", "api://remote.jpda.app/wake"]],
          ['https://graph.microsoft.com/v1.0/me', ['https://graph.microsoft.com/User.Read']]
        ]
      },
      requestConfig: {
        scopes: ["https://graph.microsoft.com/User.Read"] //static scopes
      },
      apiConfig: { apiEndpoint: this.endpoint }
    }
    this.auth = new AuthService(this.msalConfig);
    this.state = { show: false, message: "" };

    this.toastHandler = (s: boolean, m: string) => {
      this.setState({ show: s, message: m });
      setTimeout(() => {
        this.setState({ show: !s, message: m });
      }, 10000);
    };
  }

  render() {
    return (
      <Router>
        <div>
          <MainMenuNav AuthService={this.auth} />
          <div style={{ position: 'absolute', top: 15, right: 15, minWidth: '24rem' }}>
            <Toast show={this.state.show} onClose={() => { this.toastHandler(false, "") }}>
              <Toast.Header>
                <img src="//via.placeholder.com/20" className="rounded mr-2" alt="" />
                <strong className="mr-auto">Authentication error</strong>
                <small>Now</small>
              </Toast.Header>
              <Toast.Body>{this.state.message}</Toast.Body>
            </Toast>
          </div>
          <Container>
            <Route Path="/" component={Home} />
            <Switch>
              <Route path="/graph" render={(props) => <GraphView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
              <Route path="/power" render={(props) => <PowerView {...props} endpoint={this.endpoint} auth={this.auth} toastToggle={this.toastHandler} />} />
              <Route path="/groups" render={(props) => <ClaimsView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
              <Route path="/approles" render={(props) => <ClaimsView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
              <Route path="/claims" render={(props) => <ClaimsView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
            </Switch>
          </Container>
        </div>
      </Router >
    );
  }
}
export default App;