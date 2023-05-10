import * as crypto from 'crypto';

export const generateCodeVerifier = () => {
    return crypto.randomBytes(32)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export const generateCodeChallenge = (codeVerifier) => {
    return crypto.createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export const generateState = () => {
    return crypto.randomBytes(16)
        .toString('hex') + "L7ILL";
}