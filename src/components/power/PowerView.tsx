import React from "react";
import { IDevice, Device, DeviceState } from "../../models/DeviceModel";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import AuthService from "../auth/AuthService";
import { AuthResponse, AuthenticationParameters } from "msal";

interface Props {
    endpoint: any
    devices: IDevice[]
    auth: AuthService
}

interface State {
    devices: IDevice[]
}

export class PowerView extends React.Component<Props, State> {
    url: any;
    state: State;
    auth: AuthService;
    scopeConfiguration: AuthenticationParameters; // required scopes for this page

    constructor(props: Props, state: State) {
        super(props);
        this.state = props;
        this.url = props.endpoint;
        this.auth = props.auth;
        if (props == null || props.devices == null) {
            this.state = { devices: [] };
        }
        this.scopeConfiguration = { scopes: ["api://remote.jpda.app/power", "api://remote.jpda.app/wake"] };
        this.state.devices.push(new Device("loading...", "loading...", "loading...", new DeviceState(0, 0)));
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

    tokenError(e: any) {
        console.error(e);
        console.error(e.errorCode);
        if (e.errorCode === "user_login_error") {
            this.auth.msalObj.loginPopup(this.scopeConfiguration).then(token => { this.idTokenCallback(token) });
        }
        if (this.auth.requiresInteraction(e.errorCode)) {
            this.auth.msalObj.acquireTokenPopup(this.scopeConfiguration).then(this.fetchData);
        }
    }

    idTokenCallback(token: AuthResponse) {
        this.auth.msalObj.acquireTokenSilent(this.scopeConfiguration).then(token => { this.fetchData(token) }).catch(e => { this.tokenError(e) });
    }

    fetchData(token: AuthResponse) {
        if (!token) { console.warn("AuthResponse null"); return; };
        console.log(token.tokenType);

        if (token.tokenType !== "access_token" || token.accessToken === null) {
            console.warn("got wrong token type");
        }

        console.log("powerview: got access token: " + token.accessToken.substr(0, 10) + "...");
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
        );
    }
}