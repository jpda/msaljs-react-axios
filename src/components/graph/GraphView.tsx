import React from "react";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import AuthService from "../auth/AuthService";
import { AuthResponse, AuthenticationParameters } from "msal";
import { IKvp, Kvp } from "../../models/KvpModel";
import { Card, CardDeck } from "react-bootstrap";

interface Props {
    auth: AuthService
    toastToggle: any;
}

interface State {
    userInfo: IKvp[]
}

export class GraphView extends React.Component<Props, State> {
    state: State;
    auth: AuthService;
    scopeConfiguration: AuthenticationParameters; // required scopes for this page

    constructor(props: Props, state: State) {
        super(props, state);
        this.auth = props.auth;
        this.state = { userInfo: [] };
        // here we set the scopes we'll need to request from the user
        this.scopeConfiguration = { scopes: ["https://graph.microsoft.com/User.Read"] };
        this.state.userInfo.push(new Kvp("loading...", "loading..."));
    }

    componentDidMount() {
        this.handleData();
    }

    handleData() {
        if (this.auth.msalObj.getAccount()) {
            this.auth.msalObj.acquireTokenSilent(this.scopeConfiguration).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
        } else {
            this.auth.msalObj.acquireTokenPopup(this.scopeConfiguration).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
        }
    }

    showError(e: any) {
        this.props.toastToggle(true, e.errorCode);
    }

    tokenError(e: any) {
        console.error(e);
        console.error(e.errorCode);
        if (e.errorCode === "user_login_error") {
            this.auth.msalObj.loginPopup(this.scopeConfiguration).then(token => { this.idTokenCallback(token) }).catch(e => { this.showError(e) });
        }
        if (this.auth.requiresInteraction(e.errorCode)) {
            this.auth.msalObj.acquireTokenPopup(this.scopeConfiguration).then(this.fetchData).catch(this.showError).catch(e => { this.showError(e) });;
        }
    }

    idTokenCallback(token: AuthResponse) {
        this.auth.msalObj.acquireTokenSilent(this.scopeConfiguration).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
    }

    fetchData(token: AuthResponse) {
        if (!token) { console.warn("AuthResponse null"); return; };
        console.debug(token.tokenType);

        if (token.tokenType !== "access_token" || token.accessToken === null) {
            console.warn("got wrong token type");
        }

        console.debug("graphview: got access token: " + token.accessToken.substr(0, 10) + "...");
        fetch("https://graph.microsoft.com/v1.0/me",
            {
                headers: new Headers({
                    "Authorization": "Bearer " + token.accessToken
                })
            }
        )
            .then(x => x.json())
            .then(x => {
                this.parseGraphResponse(x);
            });
    }

    parseGraphResponse(data: any) {
        if (data === null) return;
        console.debug(data);
        var userData = Object.keys(data).filter(x => data[x] != null).map(x => {
            return new Kvp(x, Array.isArray(data[x]) ? data[x].join() : data[x].toString());
        });
        this.setState({ userInfo: userData });
    }

    render() {
        return (
            <>
                <Row>
                    <CardDeck>
                        <Card>
                            <Card.Header as="h5">Single scope, statically assigned</Card.Header>
                            <Card.Body>
                                <p>In this example, the requested scopes are assigned in the application registration, before the application
                                    ever runs. This is an administrative Azure AD activity, where the owner of the app registration
                                    determines which scopes/permissions are required and enables the application to request them.
                                    This is how Azure AD v1 resource permissions were handled.
                                </p>
                                <CardDeck>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>API/Service</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">Microsoft Graph</Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>Permission</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">User.Read</Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                    <Card >
                                        <Card.Body>
                                            <Card.Title>Scope</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted"><code>https://graph.microsoft.com/User.Read</code></Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                    <Card >
                                        <Card.Body>
                                            <Card.Title>Assignment</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">Static</Card.Subtitle>
                                        </Card.Body>
                                    </Card>
                                </CardDeck>
                            </Card.Body>
                        </Card>
                    </CardDeck>
                </Row>
                <Row>
                    <h2>Microsoft Graph data for /me</h2>
                </Row>
                <Row>
                    <Table bordered striped>
                        <thead><tr><th>Key</th><th>Value</th></tr></thead>
                        <tbody>
                            {
                                this.state.userInfo.map((x, i) => {
                                    return <tr key={i}>
                                        <td>{x.key}</td>
                                        <td>{x.value}</td>
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