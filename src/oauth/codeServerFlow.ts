import { setAccessToken, setExpirationTime, setRefreshToken } from "../helper/storage/localStorageHelper";
import { generateRsaKeys, rsaKeyToString } from "../helper/crypt/codeHelper";
import type { CodeServerSession } from "../helper/types";
import TestPlugin from "../TestPlugin";

let session: CodeServerSession = null;


function base64UrlDecode(base64Url: string): ArrayBuffer {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + '='.repeat(paddingLength);
    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToUtf8String(arrayBuffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(arrayBuffer);
}

export const codeFlowServerStart = async () => {
    const plugin = TestPlugin.getInstance();

    if (!session?.state) {

        const keys = await generateRsaKeys();
        const publicKey = await rsaKeyToString(keys);
        session = {
            keys,
            state: publicKey,
        }
    }
    window.location.href = `${plugin.settings.googleOAuthServer}/api/google/login?key=${session.state}`;
}

export const codeFlowServerEnd = async (encryptedText) => {

    const plugin = TestPlugin.getInstance();

    if (!session?.state) {
        return;
    }

    const tokenEncoded = await window.crypto.subtle.decrypt(
        "RSA-OAEP",
        session.keys.privateKey,
        base64UrlDecode(encryptedText)
    )

    const tokenString = arrayBufferToUtf8String(tokenEncoded);

    const token = JSON.parse(tokenString);

    const [access_token, refresh_token] = token;
    const expirationTime = 4000;
    await setRefreshToken(refresh_token);
    await setAccessToken(access_token);
    setExpirationTime(+new Date() + expirationTime * 1000)

    session = null;
    plugin.settingsTab.display();
}