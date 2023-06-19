import { refreshAccessToken } from "../../oauth/refreshToken";
import { getAccessToken, getExpirationTime } from "../storage/localStorageHelper"

export const getValidAccessToken = async (): Promise<string> => {

    const accessToken = await getAccessToken();
    const expirationTime = await getExpirationTime();

    if (accessToken && expirationTime > +new Date()) {
        return accessToken;
    }

    return (await refreshAccessToken())
}