import { getClientId, getClientSecret, getRefreshToken, setAccessToken, setExpirationTime } from "../helper/storage/localStorageHelper";
import TestPlugin from "src/TestPlugin";
import { requestUrl } from "obsidian";

/*
    Function to get a new valid access token using the refresh token.
*/
export const refreshAccessToken = async () => {
    // Get the plugin instance to access the settings
    const plugin = TestPlugin.getInstance();

    // Find the correct URL to send the request to based on if the user is using a custom client
    const refreshURL = plugin.settings.useCustomClient ? 'https://oauth2.googleapis.com/token' : `${plugin.settings.googleOAuthServer}/api/google/refresh`;
    // Prepare the request body from date stored in the LocalStorage
    const requestBody = {
        refresh_token: (await getRefreshToken()),
        client_id: plugin.settings.useCustomClient ? (await getClientId()) : null,
        client_secret: plugin.settings.useCustomClient ? (await getClientSecret()) : null,
        grant_type: 'refresh_token'
    }

    // Send the request
    const tokenRequest = await requestUrl({
        url: refreshURL,
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(requestBody),
        throw: false
    })

    // If the request is successful return and store the new access token
    if (tokenRequest.status === 200) {
        const { access_token, expires_in } = tokenRequest.json;
        await setAccessToken(access_token);
        await setExpirationTime(+new Date() + expires_in * 1000);
        return access_token;
    }
} 