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
import { CalendarView } from "./components/graph/CalendarView";

interface State {
  userName: string;
  toastShow: boolean;
  toastMessage: string;
}

class App extends Component<any, State> {
  endpoint: string;
  msalConfig: any;
  auth: AuthService;
  toastHandler: (s: boolean, m: string) => void;
  authenticationStateChanged: () => void;

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
          cacheLocation: "sessionStorage" // session storage is more secure, but prevents single-sign-on from working. other option is 'localStorage'
        },
        protectedResourceMap: [
          ['https://remoteutils.azurewebsites.net/api/power', ["api://remote.jpda.app/power", "api://remote.jpda.app/wake"]],
          ['https://remoteutils.azurewebsites.net/api/wol', ["api://remote.jpda.app/power", "api://remote.jpda.app/wake"]],
          ['https://graph.microsoft.com/v1.0/me', ['https://graph.microsoft.com/User.Read']],
          ['https://graph.microsoft.com/v1.0/me/calendarview', ['https://graph.microsoft.com/Calendar.Read']],
        ]
      },
      requestConfig: {
        scopes: ["https://graph.microsoft.com/User.Read"] // static scopes
      },
      apiConfig: { apiEndpoint: this.endpoint }
    }

    this.auth = new AuthService(this.msalConfig);
    this.state = { userName: "", toastShow: false, toastMessage: "" };

    this.toastHandler = (s: boolean, m: string) => {
      this.setState({ toastShow: s, toastMessage: m });
      setTimeout(() => {
        this.setState({ toastShow: !s, toastMessage: m });
      }, 10000);
    };

    this.authenticationStateChanged = () => {
      if (this.auth.msalObj.getAccount()) {
        this.setState({ userName: this.auth.msalObj.getAccount().userName });
      }
    };
  }

  render() {
    return (
      <Router>
        <div>
          <MainMenuNav AuthService={this.auth} userName={this.state.userName} key={this.state.userName} authenticationStateChanged={this.authenticationStateChanged} />
          <Container>
            <Route Path="/" component={Home} />
            <Switch>
              <Route path="/graph" render={(props) => <GraphView {...props} auth={this.auth} toastToggle={this.toastHandler} authenticationStateChanged={this.authenticationStateChanged} />} />
              <Route path="/calendar" render={(props) => <CalendarView {...props} auth={this.auth} toastToggle={this.toastHandler} authenticationStateChanged={this.authenticationStateChanged} />} />
              <Route path="/power" render={(props) => <PowerView {...props} endpoint={this.endpoint} auth={this.auth} toastToggle={this.toastHandler} authenticationStateChanged={this.authenticationStateChanged} />} />
              <Route path="/groups" render={(props) => <ClaimsView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
              <Route path="/approles" render={(props) => <ClaimsView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
              <Route path="/claims" render={(props) => <ClaimsView {...props} auth={this.auth} toastToggle={this.toastHandler} />} />
            </Switch>
          </Container>
          <div style={{ position: 'absolute', top: 45, right: 15, minWidth: '24rem', zIndex: -1 }}>
            <Toast show={this.state.toastShow} onClose={() => { this.toastHandler(false, "") }}>
              <Toast.Header>
                <img src="//via.placeholder.com/20" className="rounded mr-2" alt="" />
                <strong className="mr-auto">Authentication error</strong>
                <small>Now</small>
              </Toast.Header>
              <Toast.Body>{this.state.toastMessage}</Toast.Body>
            </Toast>
          </div>
        </div>
      </Router >
    );
  }
}
export default App;