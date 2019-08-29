import { UserAgentApplication, Account, AuthResponse } from "msal";

interface Props {
    config: {
        auth: {
            clientId: string,
            authority: string
        },
        cache: {
            cacheLocation: any
            storeAuthStateInCookie: boolean
        }
    }
    requestConfig: { scopes: string[] }
    apiConfig: { apiEndpoint: string }
}

export default class AuthService {
    data: Props;
    msalObj: UserAgentApplication;
    user: Account | null;
    userData: string;

    constructor(props: Props) {
        this.data = props;
        this.msalObj = new UserAgentApplication(props.config);
        this.msalObj.handleRedirectCallback(
            (error: any, response: any) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("received response, token: " + response.tokenType);
                    this.userData = response.idToken.name;
                }
            }
        );
        this.userData = "loading";
        this.user = null;
    }

    public async acquireTokenSilentThenPopup(): Promise<AuthResponse | null> {
        if(this.msalObj.getAccount()){
            return this.msalObj.acquireTokenSilent(this.data.requestConfig).then(tokenResponse => {
                return tokenResponse;
            }).catch(
                e => {
                    console.error(e);
                    console.error(e.errorCode);
                    if (e.errorCode === "user_login_error") {
                        this.signIn();
                    }
                    if (this.requiresInteraction(e.errorCode)) {
                        console.warn("should redirect?");
                        this.msalObj.acquireTokenPopup(this.data.requestConfig).then(response => {
                            return response;
                        });
                    }
                    return null;
                }
            );
        } else {
            this.signIn();
        }
        return null;
    }

    public requiresInteraction(errorCode: string): boolean {
        console.error(errorCode);
        if (!errorCode || !errorCode.length) {
            return false;
        }
        return errorCode === "consent_required" ||
            errorCode === "interaction_required" ||
            errorCode === "login_required";
    }

    public async signIn(): Promise<Account | null> {
       return this.msalObj.loginPopup(this.data.requestConfig).then(
            response => {
                var user = this.msalObj.getAccount();
                if (user) {
                    this.user = user;
                    return user;
                } else {
                    return null;
                }
            }).catch(function (error) {
                console.log(error);
                return null;
            });
    }
}