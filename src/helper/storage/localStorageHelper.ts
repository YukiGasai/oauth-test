import { aesGcmDecrypt } from "../crypt/aes";

const GOOGLE_CALENDAR_PLUGIN_REFRESH_KEY = 'google_calendar_plugin_refresh_key';
const GOOGLE_CALENDAR_PLUGIN_ACCESS_KEY = 'google_calendar_plugin_access_key';
const GOOGLE_CALENDAR_PLUGIN_EXPIRATION_KEY = 'google_calendar_plugin_expiration_key';

let tokenPassword = null;

export const setTokenPassword = (password: string) => {
	tokenPassword = password;
}

export const isLoggedIn = (): boolean => {
	return window.localStorage.getItem(GOOGLE_CALENDAR_PLUGIN_REFRESH_KEY) != "";
}

//===================
//GETTER
//===================

/**
 * getAccessToken from LocalStorage
 * @returns googleAccessToken
 */
export const getAccessToken = async (): Promise<string> => {
	if (tokenPassword) {
		return (await aesGcmDecrypt(window.localStorage.getItem(GOOGLE_CALENDAR_PLUGIN_ACCESS_KEY) ?? "", tokenPassword));
	} else {
		return window.localStorage.getItem(GOOGLE_CALENDAR_PLUGIN_ACCESS_KEY) ?? "";
	}
};

/**
 * getRefreshToken from LocalStorage
 * @returns googleRefreshToken
 */
export const getRefreshToken = async (): Promise<string> => {
	if (tokenPassword) {
		return (await aesGcmDecrypt(window.localStorage.getItem(GOOGLE_CALENDAR_PLUGIN_REFRESH_KEY) ?? "", tokenPassword));
	} else {
		return window.localStorage.getItem(GOOGLE_CALENDAR_PLUGIN_REFRESH_KEY) ?? "";
	}
};

/**
 * getExpirationTime from LocalStorage
 * @returns googleExpirationTime
 */
export const getExpirationTime = (): number => {
	const expirationTimeString =
		window.localStorage.getItem(GOOGLE_CALENDAR_PLUGIN_EXPIRATION_KEY) ?? "0";
	return parseInt(expirationTimeString, 10);
};


//===================
//SETTER
//===================

/**
 * set AccessToken into LocalStorage
 * @param googleAccessToken googleAccessToken
 * @returns googleAccessToken
 */
export const setAccessToken = (googleAccessToken: string): void => {
	window.localStorage.setItem(GOOGLE_CALENDAR_PLUGIN_ACCESS_KEY, googleAccessToken);
};

/**
 * set RefreshToken from LocalStorage
 * @param googleRefreshToken googleRefreshToken
 * @returns googleRefreshToken
 */
export const setRefreshToken = (googleRefreshToken: string): void => {
	if (googleRefreshToken == "undefined") return;
	window.localStorage.setItem(GOOGLE_CALENDAR_PLUGIN_REFRESH_KEY, googleRefreshToken);
};

/**
 * set ExpirationTime from LocalStorage
 * @param googleExpirationTime googleExpirationTime
 * @returns googleExpirationTime
 */
export const setExpirationTime = (googleExpirationTime: number): void => {
	if (isNaN(googleExpirationTime)) return;
	window.localStorage.setItem(
		GOOGLE_CALENDAR_PLUGIN_EXPIRATION_KEY,
		googleExpirationTime + ""
	);
};

// ===================
// CLEAR
// ===================

export const clearTokens = (): void => {
	window.localStorage.setItem(GOOGLE_CALENDAR_PLUGIN_ACCESS_KEY, "");
	window.localStorage.setItem(GOOGLE_CALENDAR_PLUGIN_REFRESH_KEY, "");
	window.localStorage.setItem(GOOGLE_CALENDAR_PLUGIN_EXPIRATION_KEY, "");
}