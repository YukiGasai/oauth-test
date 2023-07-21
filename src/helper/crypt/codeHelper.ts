/*
    This file contains helper functions for the Code Server Flow.
*/

/*
    Function to create a random RSA key pair that allows encryption and decrypting text.
*/
export async function generateRsaKeys() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    return keyPair;
}

/*
    Function to convert a single RSA key to a string.
    The sting will be encoded hex to ensure url compatibility. 
*/
export async function rsaKeyToString(keyPair) {

    const spki = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
    );
    const hexPublicKey = Array.from(new Uint8Array(spki))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return hexPublicKey
}

/*
    Function to convert a base64 string into a buffer.
*/
export function base64UrlDecode(base64Url: string): ArrayBuffer {
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

/*
    Function to convert a buffer into a utf8 string.
*/
export function arrayBufferToUtf8String(arrayBuffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(arrayBuffer);
}