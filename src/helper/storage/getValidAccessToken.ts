import { refreshAccessToken } from "../../oauth/refreshToken";
import { getAccessToken, getExpirationTime } from "../storage/localStorageHelper"

/*
    Function to get a access token that has not expired yet and is not encrypted.
*/
export const getValidAccessToken = async (): Promise<string> => {

    //Get the access token and the expiration time from the local storage
    const accessToken = await getAccessToken();
    const expirationTime = await getExpirationTime();

    // Check if expiration time is expired and that the storage contained an access token
    if (accessToken && expirationTime > +new Date()) {
        return accessToken;
    }

    // If there was no valid token try to generate one
    return (await refreshAccessToken())
}