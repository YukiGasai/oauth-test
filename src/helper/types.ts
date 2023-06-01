export interface TestPluginSettings {
    encryptToken: boolean,
    useCustomClient: boolean,
    googleClientId: string,
    googleClientSecret: string,
    googleOAuthServer: string,
}

export interface PKCELocalSession {
    state: string;
    codeVerifier: string;
    password?: string;
}


export interface PKCEServerSession {
    keys: CryptoKeyPair;
    password?: string;
}