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