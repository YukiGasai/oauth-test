import { setAccessToken, setExpirationTime, setRefreshToken } from "../helper/storage/localStorageHelper";
import { generateRsaKeys, rsaKeyToString } from "../helper/crypt/pkceHelper";
import { aesGcmEncrypt } from "../helper/crypt/aes";
import type { PKCESession } from "../helper/types";

let session: PKCESession;

export const pkceFlowServerStart = async () => {

    if (!session.state) {
        authKeys = await generateRsaKeys();
    }
    const publicKey = await rsaKeyToString(authKeys);

    window.location.href = `http://localhost:42813/api/google/login?key=${publicKey}`;
}

export const pkceFlowServerEnd = async (encryptedText) => {

    if (!authKeys) {
        return;
    }

    const tokenEncoded = await window.crypto.subtle.decrypt(
        "RSA-OAEP",
        authKeys.privateKey,
        Buffer.from(encryptedText, 'base64url')
    )

    const tokenString = Buffer.from(tokenEncoded).toString('utf-8');

    const token = JSON.parse(tokenString);


    const { access_token, refresh_token, expires_in } = token;

    const encryptedAccessToken = await aesGcmEncrypt(access_token, session.password);
    const encryptedRefreshToken = await aesGcmEncrypt(refresh_token, session.password);

    setRefreshToken(token.refresh_token);
    setAccessToken(token.access_token);
    setExpirationTime(token.expires_in)

    authKeys = null;
}