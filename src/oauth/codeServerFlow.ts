import { setAccessToken, setExpirationTime, setRefreshToken } from "../helper/storage/localStorageHelper";
import { arrayBufferToUtf8String, base64UrlDecode, generateRsaKeys, rsaKeyToString } from "../helper/crypt/codeHelper";
import type { CodeServerSession } from "../helper/types";
import TestPlugin from "../TestPlugin";
import { Notice } from "obsidian";

/*
    This file contains the functions that are used to run the Code Server Flow.
*/

// This variable is used to store the state and keys of the current session.
// To ensure that the keys are remembered between the start and end of the flow.
let session: CodeServerSession = null;

/*
    Function to start the Code Server Flow.
    The function will generate a random RSA key pair.
    The state will be used to prevent CSRF attacks.
    The public key will be encoded as a hex string and send using the state.
*/
export const codeFlowServerStart = async () => {
    // Get the plugin instance to access the settings
    const plugin = TestPlugin.getInstance();

    // Check if there is already a auth flow in progress
    if (!session?.state) {
        // Create a new RSA Keypair store it and convert the public key to a hex string
        const keys = await generateRsaKeys();
        const publicKey = await rsaKeyToString(keys);
        session = {
            keys,
            state: publicKey,
        }
    }
    // Redirect the user to the Obsidian Google Calendar Authorization Server
    window.location.href = `${plugin.settings.googleOAuthServer}/api/google/login?key=${session.state}`;
}


/*
    Function to end the Code Server Flow.
    The function will decrypt the received token using the private key.
    The token will be stored in the LocalStorage.
*/
export const codeFlowServerEnd = async (encryptedText) => {
    // Get the plugin instance to access the settings
    const plugin = TestPlugin.getInstance();

    // If there is no session break
    if (!session?.state) {
        return;
    }
    // Convert the received encrypted token to a decrypted buffer
    const tokenEncoded = await window.crypto.subtle.decrypt(
        "RSA-OAEP",
        session.keys.privateKey,
        base64UrlDecode(encryptedText)
    )

    // Convert the decrypted buffer to a string
    const tokenString = arrayBufferToUtf8String(tokenEncoded);

    // Parse the token string to get the access and refresh token
    const token = JSON.parse(tokenString);

    // Store the tokens in the LocalStorage
    const [access_token, refresh_token] = token;
    const expirationTime = 4000;
    await setRefreshToken(refresh_token);
    await setAccessToken(access_token);
    setExpirationTime(+new Date() + expirationTime * 1000)

    // Clear the session
    session = null;

    // Update the settings gui to show the Logout button
    plugin.settingsTab.display();
    new Notice("[Test plugin] Login successful");
}