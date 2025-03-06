const crypto = require("crypto");

const SECRET_KEY = crypto
  .createHash("sha256") // ✅ Ensure 32-byte key
  .update("your-secret-key") // Change this to your secure key
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
    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedData = textParts.join(":");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(SECRET_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
