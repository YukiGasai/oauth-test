export const base64UrlEncode = (buffer: ArrayBuffer | Uint8Array): string => {
    let base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

export const generateCodeVerifier = (): string => {
    const randomBytes = new Uint8Array(64);
    window.crypto.getRandomValues(randomBytes);
    const verifier = base64UrlEncode(randomBytes);
    return verifier;
}

export const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const codeChallenge = base64UrlEncode(hashBuffer);
    return codeChallenge;
}

export const generateState = () => {
    return generateCodeVerifier();
}
