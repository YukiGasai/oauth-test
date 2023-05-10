import { requestUrl } from "obsidian";
import type { PKCESession } from "../helper/types";

import { generateState, generateCodeChallenge, generateCodeVerifier } from "../helper/crypt/pkceHelper";
import TestPlugin from "../TestPlugin";


const PUBLIC_CLIENT_ID = '290682291033-qngpea2175rjca11gb5tj94mqaosd19m.apps.googleusercontent.com'
const PUBLIC_REDIRECT_URI = 'https://google-auth-obsidian-redirect.vercel.app/callback'

let session: PKCESession;
export const pkceFlowLocalStart = async () => {
    const plugin = TestPlugin.getInstance();

    const CLIENT_ID = plugin.settings.useCustomClient ? plugin.settings.googleClientId : PUBLIC_CLIENT_ID;
    const REDIRECT_URI = plugin.settings.useCustomClient ? plugin.settings.googleOAuthServer : PUBLIC_REDIRECT_URI

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    let authUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    authUrl += `?client_id=${CLIENT_ID}`;
    authUrl += `&redirect_uri=${REDIRECT_URI}`;
    authUrl += `&response_type=code`;
    authUrl += `&scope=https://www.googleapis.com/auth/calendar`;
    authUrl += `&state=${state}`;
    authUrl += `&code_challenge_method=S256`;
    authUrl += `&code_challenge=${codeChallenge}`;
    authUrl += `&access_type=offline`;

    session = {
        state,
        codeVerifier,
    }

    window.location.href = authUrl
    console.log(`Please visit this URL to authorize the application: ${authUrl}`);
}


export async function pkceFlowLocalEnd(code: string, state: string) {
    const plugin = TestPlugin.getInstance();

    const CLIENT_ID = plugin.settings.useCustomClient ? plugin.settings.googleClientId : PUBLIC_CLIENT_ID;

    const REDIRECT_URI = plugin.settings.useCustomClient ? plugin.settings.googleOAuthServer : PUBLIC_REDIRECT_URI;

    const h = 'R09DU1BYLXptb0E3MVpZYWFqd1Nqc05VYnZOUmJJczh3YTc='
    if (!session || state !== session.state) return;

    let url = 'https://oauth2.googleapis.com/token'
    url += `?code=${code}`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&client_secret=${atob(h)}`;
    url += `&redirect_uri=${REDIRECT_URI}`;
    url += `&code_verifier=${session.codeVerifier}`;
    url += `&grant_type=authorization_code`;

    const tokenRequest = await requestUrl({
        url,
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        throw: false
    })




    const { access_token, refresh_token, expires_in } = tokenRequest.json;

    console.log(`Access Token: ${access_token}`);

    session = undefined;

}