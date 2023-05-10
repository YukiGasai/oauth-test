import { requestUrl } from "obsidian";
import type { PKCESession } from "../helper/types";

import { generateState, generateCodeChallenge, generateCodeVerifier } from "../helper/crypt/pkceHelper";



let session: PKCESession;
export const pkceFlowLocalStart = async () => {

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


export async function pkceFlowLocalEnd (code: string, state: string) {

    if(!session || state !== session.state) return;

    let url = 'https://oauth2.googleapis.com/token'
    url += `?code=${code}`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&client_secret=${CLIENT_SECRET}`;
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