/*
    This file contains helper functions for the PKCE Local Flow.
*/

/*
    Function convert a buffer into a base64 string that is compatible with urls.
*/
export const base64UrlEncode = (buffer: ArrayBuffer | Uint8Array): string => {
    let base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

/*
    Function to create a random string that can be used as a code verifier.
*/
export const generateCodeVerifier = (): string => {
    const randomBytes = new Uint8Array(64);
    window.crypto.getRandomValues(randomBytes);
    const verifier = base64UrlEncode(randomBytes);
    return verifier;
}

/*
    Function to create a code challenge from a code verifier.
*/
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data); //Using secure SHA256 hashing algorithm
    const codeChallenge = base64UrlEncode(hashBuffer); //Encode hash to base64 for url compatibility
    return codeChallenge;
}

/*
    Function to generate a random state that can be used to prevent CSRF attacks.
*/
export const generateState = () => {
    return generateCodeVerifier();
}
