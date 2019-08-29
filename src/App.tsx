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

class App extends Component<{}> {
  endpoint: string;
  msalConfig: any;
  auth: AuthService;

  constructor(p: any, s: any) {
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
    this.state = {
      userInfo: null,
      loginFailed: false
    };
  }

  render() {
    return (
      <Router>
        <div>
          <MainMenuNav AuthService={this.auth} />
          <Container>
            <Route Path="/" component={Home} />
            <Switch>
              <Route path="/graph" render={(props) => <GraphView {...props} auth={this.auth} />} />
              <Route path="/power" render={(props) => <PowerView {...props} devices={[]} endpoint={this.endpoint} auth={this.auth} />} />
              <Route path="/static" render={(props) => <GraphView {...props} auth={this.auth} />} />
              <Route path="/jit" render={(props) => <ClaimsView {...props} auth={this.auth} />} />
              <Route path="/jit" render={(props) => <ClaimsView {...props} auth={this.auth} />} />
              <Route path="/incremental" render={(props) => <ClaimsView {...props} auth={this.auth} />} />
              <Route path="/groups" render={(props) => <ClaimsView {...props} auth={this.auth} />} />
              <Route path="/approles" render={(props) => <ClaimsView {...props} auth={this.auth} />} />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}
export default App;