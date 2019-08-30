import { UserAgentApplication, Account } from "msal";

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
}

export default class AuthService {
    data: Props;
    msalObj: UserAgentApplication;
    user: Account | null;

    constructor(props: Props) {
        this.data = props;
        this.user = null;
        this.msalObj = new UserAgentApplication(props.config);
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

    public async login(): Promise<Account | null> {
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

    public logout() {
        this.msalObj.logout();
    }
}