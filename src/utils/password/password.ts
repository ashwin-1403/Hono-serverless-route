export async function encrypt(message: string, secretKey: string): Promise<string> {
    const messageBytes: Uint8Array = new TextEncoder().encode(message);
    const keyBytes: Uint8Array = new TextEncoder().encode(secretKey);

    const encryptedBytes: any = new Uint8Array(messageBytes.length);
    for (let i = 0; i < messageBytes.length; i++) {
        encryptedBytes[i] = messageBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return btoa(String.fromCharCode.apply(null, encryptedBytes));
}

export function decrypt(encryptedMessage: string, secretKey: string): string {
    const encryptedBytes: Uint8Array = new Uint8Array(atob(encryptedMessage).split('').map(char => char.charCodeAt(0)));
    const keyBytes: Uint8Array = new TextEncoder().encode(secretKey);

    const decryptedBytes: Uint8Array = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return new TextDecoder().decode(decryptedBytes);
}