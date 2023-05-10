export interface TestPluginSettings {
	encryptToken: boolean,
    useCustomClient: boolean,
    googleClientId: string,
    googleClientSecret: string,
    googleOAuthServer: string,
}

export interface PKCESession {
    state: string;
    codeVerifier: string;
}