import React from "react";
import { IWakeOnLanServer, WakeOnLanServer } from "../../models/WakeOnLanModel";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import AuthService from "../auth/AuthService"
import { AuthResponse } from "msal";

interface Props {
    endpoint: any
    servers: IWakeOnLanServer[]
    auth: AuthService
}

interface State {
    servers: IWakeOnLanServer[]
}

export class WakeOnLanView extends React.Component<Props, State> {
    url: any;
    state: State;
    auth: AuthService;

    constructor(props: Props) {
        super(props);
        this.state = props;
        this.url = props.endpoint;
        this.auth = props.auth;
        if (props == null || props.servers == null) {
            this.state = { servers: [] };
        }
        this.state.servers.push(new WakeOnLanServer("loading...", "loading..."));
    }

    componentDidMount() {
        this.handleData();
    }

    handleData() {
        if (this.auth.msalObj.getAccount()) {
            this.auth.msalObj.acquireTokenSilent(this.auth.data.requestConfig).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
        } else {
            this.auth.msalObj.acquireTokenPopup(this.auth.data.requestConfig).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
        }
    }

    tokenError(e: any) {
        console.error(e);
        console.error(e.errorCode);
        if (e.errorCode === "user_login_error") {
            this.auth.msalObj.loginPopup(this.auth.data.requestConfig).then(token => { this.idTokenCallback(token)} );
        }
        if (this.auth.requiresInteraction(e.errorCode)) {
            this.auth.msalObj.acquireTokenPopup(this.auth.data.requestConfig).then(this.fetchData);
        }
    }

    idTokenCallback(token: AuthResponse) {
        this.auth.msalObj.acquireTokenSilent(this.auth.data.requestConfig).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
    }

    fetchData(token: AuthResponse) {
        if (!token) { console.warn("AuthResponse null"); return; };
        console.log(token.tokenType);

        if (token.tokenType !== "access_token" || token.accessToken === null) {
            console.warn("got wrong token type");   
        }

        console.log("wolview: got access token: " + token.accessToken.substr(0, 10) + "...");
        fetch(this.url + "/wol",
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
                    servers: x
                });
            });
    }

    render() {
        return (
            <Row>
                <Table bordered striped>
                    <thead><tr><th>Server</th><th>Address</th></tr></thead>
                    <tbody>
                        {
                            this.state.servers.map((x, i) => {
                                return <tr key={i}><td>{x.key}</td><td>{x.value.toUpperCase()}</td></tr>
                            })
                        }
                    </tbody>
                </Table>
            </Row >
        );
    }
}