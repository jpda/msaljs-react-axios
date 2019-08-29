import React from "react";
import AuthService from "./AuthService";

interface Props {
    AuthService: AuthService;
}
interface State {
    user?: any,
    userInfo?: any,
    apiCallFailed: boolean,
    loginFailed: boolean
}

export default class AuthView extends React.Component<Props, State> {
    p: Props;

    constructor(props: Props) {
        super(props);
        this.p = props;
        this.state = {
            user: null,
            userInfo: null,
            apiCallFailed: false,
            loginFailed: false
        };
        this.login();
    }

    logout = () => {
        //this.p.AuthService.logout();
    };

    login = () => {
        this.setState({
            loginFailed: false
        });
        this.p.AuthService.signIn().then(
            (user: any) => {
                if (user) {
                    this.setState({
                        user: user
                    });
                } else {
                    this.setState({
                        loginFailed: true
                    });
                }
            },
            () => {
                this.setState({
                    loginFailed: true
                });
            }
        );
    };

    render() {
        let templates = [];
        if (this.state.user) {
            templates.push(
                <div key="loggedIn">
                    <h3>Hello {this.state.user.name}</h3>
                </div>
            );
        } else {
            // templates.push(
            //     <div key="loggedIn">
            //         <button onClick={this.login} type="button">
            //             Login with Microsoft
            //   </button>
            //     </div>
            // );
        }
        if (this.state.userInfo) {
            templates.push(
                <pre key="userInfo">{JSON.stringify(this.state.userInfo, null, 4)}</pre>
            );
        }
        if (this.state.loginFailed) {
            templates.push(<strong key="loginFailed">Login unsuccessful</strong>);
        }
        if (this.state.apiCallFailed) {
            templates.push(
                <strong key="apiCallFailed">Graph API call unsuccessful</strong>
            );
        }

        return (
            { templates }
        );
    }
}