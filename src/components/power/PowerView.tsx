import React from "react";
import { IDevice, Device, DeviceState } from "../../models/DeviceModel";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import AuthService from "../auth/AuthService";
import { AuthResponse, AuthenticationParameters } from "msal";
import { CardDeck, Card } from "react-bootstrap";

interface Props {
    endpoint: any;
    auth: AuthService;
    toastToggle: any;
    authenticationStateChanged: any;
}

interface State {
    devices: IDevice[];
}

export class PowerView extends React.Component<Props, State> {
    url: any;
    state: State;
    auth: AuthService;
    scopeConfiguration: AuthenticationParameters; // required scopes for this page

    constructor(props: Props, state: State) {
        super(props);
        this.url = props.endpoint;
        this.auth = props.auth;
        this.state = { devices: [new Device("loading...", "loading...", "loading...", new DeviceState(0, 0))] };

        // here we set the scopes we'll need to request from the user for this view
        this.scopeConfiguration = { scopes: ["api://remote.jpda.app/power", "api://remote.jpda.app/wake"] };
    }

    componentDidMount() {
        if (this.auth.msalObj.getAccount()) { // account is available, so we're signed in
            this.auth.msalObj.acquireTokenSilent(this.scopeConfiguration)
                .then(t => this.fetchData(t))
                .catch(e => this.tokenError(e));
        } else {
            this.auth.msalObj.acquireTokenPopup(this.scopeConfiguration)
                .then(t => this.fetchData(t))
                .catch(e => this.tokenError(e));
        }
    }

    tokenError(e: any) {
        console.error(e);
        console.error(e.errorCode);
        if (e.errorCode === "user_login_error") { // e.g., the user hasn't logged in yet, so we need to log them in
            this.auth.msalObj.loginPopup(this.scopeConfiguration)
                .then(response => { // don't really need the response here, but if you wanted an id_token for some reason it would be available
                    this.props.authenticationStateChanged(); // notify our upstream components that we've authenticated to update other UI
                    this.auth.msalObj.acquireTokenSilent(this.scopeConfiguration)
                        .then(t => this.fetchData(t))
                        .catch(e => this.tokenError(e));
                })
                .catch(e => this.handleFatalError(e)); // some other error that we can't handle
        }
        if (this.auth.requiresInteraction(e.errorCode)) { // this usually means the user needs to consent or use MFA - things that require an interactive login
            this.auth.msalObj.acquireTokenPopup(this.scopeConfiguration)
                .then(t => this.fetchData(t))
                .catch(e => this.handleFatalError(e));
        }
    }

    handleFatalError(e: any) {
        console.error(e.errorCode);
        this.props.toastToggle(true, e.errorCode);
        this.setState({ devices: [new Device("Something went wrong", e.errorCode, "", new DeviceState(0, 0))] });
    }

    fetchData(token: AuthResponse) {
        if (!token) {
            this.handleFatalError({ errorCode: "no_token" });
            return;
        };

        if (token.tokenType !== "access_token" || token.accessToken === null) {
            this.handleFatalError({ errorCode: "wrong_token_type" });
        }

        console.debug("powerview: got access token: " + token.accessToken.substr(0, 10) + "...");
        fetch(this.url + "/power",
            {
                headers: new Headers({
                    "Authorization": "Bearer " + token.accessToken
                })
            }
        )
            .then(x => x.json())
            .then(x => {
                console.log(x);
                this.setState({
                    devices: x
                });
            });
    }

    render() {
        return (
            <>
                <Row>
                    <CardDeck>
                        <Card>
                            <Card.Header as="h5">Two scopes, dynamically requested</Card.Header>
                            <Card.Body>
                                <p>
                                    In this example, the requested scopes are not assigned in the application registration, but requested when needed. Requesting scopes dynamically can be very useful for apps which need a sensitive permission but only for specific users or scenarios,
                                    or for a specific feature which a user can choose to not use if the permission is seen as too broad.
                                </p>
                                <CardDeck>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>API/Service</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">Your API (sample placeholder) <br /><code>api://remote.jpda.app</code></Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Permission</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">wol<br />power</Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                    <Card >
                                        <Card.Body>
                                            <Card.Title>Scope</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted"><code>api://remote.jpda.app/wol</code><br /><code>api://remote.jpda.app/power</code></Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                    <Card >
                                        <Card.Body>
                                            <Card.Title>Assignment</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">Dynamic</Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                </CardDeck>
                            </Card.Body>
                        </Card>
                    </CardDeck>
                </Row>
                <Row>
                    <Table bordered striped>
                        <thead><tr><th>Device</th><th>Name</th><th>Power</th><th>Energy</th></tr></thead>
                        <tbody>
                            {
                                this.state.devices.map((x, i) => {
                                    return <tr key={i}>
                                        <td>{x.label}</td>
                                        <td>{x.name}</td>
                                        <td>{x.state.powerMeterInW} W</td>
                                        <td>{x.state.energyMeterInkWh} kWh</td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </Table>
                </Row>
            </>
        );
    }
}