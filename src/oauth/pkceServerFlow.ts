import { generateRsaKeys, rsaKeyToString } from "../helper/crypt/pkceHelper";

let authKeys;

export const pkceFlowServerStart = async () => {

    if (authKeys) {
        return;
    }

    authKeys = await generateRsaKeys();

    const publicKey = await rsaKeyToString(authKeys);
    console.log(publicKey)
    window.location.href = `http://localhost:42813/api/google/login?key=${publicKey}`;

}

export const pkceFlowServerEnd = async (encryptedText) => {

    if (!authKeys) {
        return;
    }

    const textEncoded = await window.crypto.subtle.decrypt(
        "RSA-OAEP",
        authKeys.privateKey,
        Buffer.from(encryptedText, 'base64url')
    )

    const text = Buffer.from(textEncoded).toString('utf-8');

    console.log(encryptedText, text)

}