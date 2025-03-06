const crypto = require("crypto");

const SECRET_KEY = crypto
  .createHash("sha256") // ✅ Ensure 32-byte key
  .update("your-secret-key-is") // Change this to your secure key
  .digest("base64")
  .substring(0, 32); // Ensure 32 bytes

const IV_LENGTH = 16; // AES requires a 16-byte IV

// AES Encryption Helper Function
exports.encryptMessage = (text) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(SECRET_KEY),
      iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted data
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// AES Decryption Helper Function
exports.decryptMessage = (encryptedText) => {
  try {
    const parts = Buffer.from(encryptedText, "base64");
    const iv = parts.slice(0, IV_LENGTH);
    const encryptedData = parts.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(SECRET_KEY, "utf8"),
      iv
    );
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8"); // Return decrypted text
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    return encryptedText; // Return original if decryption fails
  }
};
