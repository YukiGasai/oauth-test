export interface TestPluginSettings {
	encryptToken: boolean,
}

export interface PKCESession {
    state: string;
    codeVerifier: string;
}