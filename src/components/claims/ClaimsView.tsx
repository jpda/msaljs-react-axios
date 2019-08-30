import React from "react";
import { IClaim, Claim } from "../../models/ClaimModel";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import AuthService from "../auth/AuthService";

interface Props {
    auth: AuthService
}

interface State {
    claims: IClaim[]
}

export default class ClaimsView extends React.Component<Props, State> {
    auth: AuthService;
    data: Props;

    constructor(props: Props) {
        super(props);
        this.data = props;
        this.auth = props.auth;
        this.state = { claims: [] };

        if (props == null) {
            console.warn("no claim data recived, using sample claim set");
            var sampleClaimSet: any = {
                "aud": "6e74172b-be56-4843-9ff4-e66a39bb12e3",
                "iss": "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0",
                "iat": 1537231048,
                "nbf": 1537231048,
                "exp": 1537234948,
                "aio": "AXQAi/8IAAAAtAaZLo3ChMif6KOnttRB7eBq4/DccQzjcJGxPYy/C3jDaNGxXd6wNIIVGRghNRnwJ1lOcAnNZcjvkoyrFxCttv33140RioOFJ4bCCGVuoCag1uOTT22222gHwLPYQ/uf79QX+0KIijdrmp69RctzmQ==",
                "azp": "6e74172b-be56-4843-9ff4-e66a39bb12e3",
                "azpacr": "0",
                "name": "Abe Lincoln",
                "oid": "690222be-ff1a-4d56-abd1-7e4f7d38e474",
                "preferred_username": "abeli@microsoft.com",
                "rh": "I",
                "scp": "access_as_user",
                "sub": "HKZpfaHyWadeOouYlitjrI-KffTm222X5rrV3xDqfKQ",
                "tid": "72f988bf-86f1-41af-91ab-2d7cd011db47",
                "uti": "fqiBqXLPj0eQa82S-IYFAA",
                "ver": "2.0"
            };

            this.parseToken(sampleClaimSet);
        }
    }

    parseToken(token: any) {
        var claimData = Object.keys(token).filter(y => y !== "decodedIdToken" && y !== "rawIdToken").map(x => {
            return new Claim(x, Array.isArray(token[x]) ? token[x].join() : token[x].toString());
        });
        this.setState({ claims: claimData });
    }

    componentDidMount() {
        this.handleData();
    }

    handleData() {
        if (this.auth.msalObj.getAccount()) {
            this.parseToken(this.auth.msalObj.getAccount().idToken);
        } else {
            this.auth.msalObj.loginPopup(this.auth.data.requestConfig).then(token => this.parseToken(token.idToken)).catch(e => { this.tokenError(e) });
        }
    }

    tokenError(e: any) {
        console.error(e);
        console.error(e.errorCode);
        if (e.errorCode === "user_login_error") {
            this.auth.msalObj.loginPopup(this.auth.data.requestConfig).then(token => { this.parseToken(token.idToken) });
        }
    }

    render() {
        return (
            <Row>
                <Table bordered striped>
                    <thead><tr><th>Name</th><th>Value</th></tr></thead>
                    <tbody>
                        {
                            this.state.claims.map((x, i) => {
                                return <tr key={i}><td>{x.key}</td><td>{x.value}</td></tr>
                            })
                        }
                    </tbody>
                </Table>
            </Row>
        );
    }
}