import { getClientId, getClientSecret, getRefreshToken, setAccessToken, setExpirationTime } from "../helper/storage/localStorageHelper";
import TestPlugin from "src/TestPlugin";
import { requestUrl } from "obsidian";

export const refreshAccessToken = async () => {
    const plugin = TestPlugin.getInstance();

    const refreshURL = plugin.settings.useCustomClient ? 'https://oauth2.googleapis.com/token' : `${plugin.settings.googleOAuthServer}/api/google/refresh`;
    const requestBody = {
        refresh_token: (await getRefreshToken()),
        client_id: plugin.settings.useCustomClient ? (await getClientId()) : null,
        client_secret: plugin.settings.useCustomClient ? (await getClientSecret()) : null,
        grant_type: 'refresh_token'
    }

    const tokenRequest = await requestUrl({
        url: refreshURL,
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(requestBody),
        throw: false
    })

    if (tokenRequest.status === 200) {
        const { access_token, expires_in } = tokenRequest.json;
        await setAccessToken(access_token);
        await setExpirationTime(+new Date() + expires_in * 1000);
        return access_token;
    }
} 