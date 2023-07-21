import { requestUrl } from "obsidian";
import type { PKCELocalSession } from "../helper/types";

import { generateState, generateCodeChallenge, generateCodeVerifier } from "../helper/crypt/pkceHelper";
import TestPlugin from "../TestPlugin";
import { setRefreshToken, setAccessToken, setExpirationTime, getClientId, getClientSecret } from "../helper/storage/localStorageHelper";

/*
    This file contains the functions that are used to run the PKCE Local Flow.
*/

const REDIRECT_URI = "https://google-auth-obsidian-redirect.vercel.app/callback";

// This variable is used to store the state and keys of the current session.
// To ensure that the state and Code Verifier is remembered between the start and end of the flow.
let session: PKCELocalSession;

/*
    Function to start the PKCE Local Flow.
    The function will generate a random code verifier and code challenge.
    A random state will be used to prevent CSRF attacks.
*/
export const pkceFlowLocalStart = async () => {

    // Get the client id from local Storage
    const CLIENT_ID = await getClientId();

    // Generate required values for the Authorization Code flow with PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Build the URL to redirect the user to
    let authUrl = "https://accounts.google.com/o/oauth2/v2/auth"
    authUrl += `?client_id=${CLIENT_ID}`;
    authUrl += `&redirect_uri=${REDIRECT_URI}`;
    authUrl += `&response_type=code`;
    authUrl += `&scope=https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly`;
    authUrl += `&state=${state}`;
    authUrl += `&code_challenge_method=S256`;
    authUrl += `&code_challenge=${codeChallenge}`;
    authUrl += `&prompt=consent`; // Needed to get a refresh token
    authUrl += `&access_type=offline`; // Needed to get a refresh token

    // Store for the use in the pkceFlowLocalEnd function
    session = {
        state,
        codeVerifier,
    }

    // Redirect the url to the google Authorization Server
    window.location.href = authUrl
    console.log(`Please visit this URL to authorize the application: ${authUrl}`);

}

/*
    Function to end the PKCE Local Flow.
    The function will exchange the received code for an access token and refresh token.
    The tokens will be stored in the LocalStorage.
*/
export async function pkceFlowLocalEnd(code: string, state: string) {

    // Get the plugin instance to access the settings
    const plugin = TestPlugin.getInstance();

    // Get the client id and secret from local Storage
    const CLIENT_ID = await getClientId();
    const CLIENT_SECRET = await getClientSecret();

    // Make sure there is a session and the state is correct
    if (!session || state !== session.state) return;

    // Build the URL to exchange the authorization code for an access token
    let url = 'https://oauth2.googleapis.com/token'
    url += `?code=${code}`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&client_secret=${CLIENT_SECRET}`;
    url += `&redirect_uri=${REDIRECT_URI}`;
    url += `&code_verifier=${session.codeVerifier}`;
    url += `&grant_type=authorization_code`;

    // Send the request
    const tokenRequest = await requestUrl({
        url,
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        throw: false
    })

    // Extract the token from the response and store them in the LocalStorage
    const { access_token, refresh_token, expires_in } = tokenRequest.json;
    await setRefreshToken(refresh_token);
    await setAccessToken(access_token);
    setExpirationTime(+new Date() + expires_in * 1000);

    // Clear the session
    session = null;

    // Update the settings gui to show the Logout button
    plugin.settingsTab.display();
}