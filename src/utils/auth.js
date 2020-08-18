import { Amplify } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import externalConfig from './external-config.json';

const localStorageAuthKey = 'material-ui-shell:auth'
export function saveAuthorisation(user) {
    if (typeof Storage !== 'undefined') {
        try {
            user.isAuthorised = true;
            localStorage.setItem(localStorageAuthKey, JSON.stringify(user))
        } catch (ex) {
            console.log(ex)
        }
    } else {
        // No web storage Support.
    }
}

export async function logout() {
    try {
        await Auth.signOut();

        if (typeof Storage !== 'undefined') {
            try {
                const auth = JSON.parse(localStorage.getItem(localStorageAuthKey))
                auth.isAuthorised = false;
                auth.displayName = '';
                localStorage.setItem(localStorageAuthKey, JSON.stringify(auth))
            } catch (ex) {
                console.log(ex)
            }
        } else {
            // No web storage Support.
        }

    } catch (error) {
        console.log('error signing out: ', error);
    }
}

export function getAuth() {
    configAuth();

    try {
        if (typeof Storage !== 'undefined') {
            const auth = JSON.parse(localStorage.getItem(localStorageAuthKey))
            if (auth === null) { auth = {}; auth.isAuthorised = false }
            return auth;
        } else {
            return false
        }
    } catch (ex) {
        return false
    }
}

export function isAuthorised() {
    try {
        if (typeof Storage !== 'undefined') {
            const auth = JSON.parse(localStorage.getItem(localStorageAuthKey))
            return auth.isAuthorised || false;
        } else {
            return false
        }
    } catch (ex) {
        return false
    }
}

export function configAuth() {
    const currentConfig = Auth.configure();
    
    if(!currentConfig.hasOwnProperty('userPoolId')) {
        console.log("Configuring Cognito User Pool");
        Amplify.configure(externalConfig.AmplifyConfig);
    }
}

export async function getToken() {
    configAuth();

    console.log("Retrieving current session");

    const currentSession = await Auth.currentSession();
    console.log(currentSession);
    return currentSession.getIdToken().getJwtToken();
}
