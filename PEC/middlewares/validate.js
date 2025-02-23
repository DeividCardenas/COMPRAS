const CryptoJS = require("crypto-js");

const Encrypt = (data) => {
  if (!process.env.AUTH_AES_SECRET_KEY) {
    throw new Error("AUTH_AES_SECRET_KEY no está definida");
  }
  return CryptoJS.AES.encrypt(data, process.env.AUTH_AES_SECRET_KEY).toString();
};

const Decrypt = (data) => {
  if (!process.env.AUTH_AES_SECRET_KEY) {
    throw new Error("AUTH_AES_SECRET_KEY no está definida");
  }
  const bytes = CryptoJS.AES.decrypt(data, process.env.AUTH_AES_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const TestEncryption = () => {
  try {
    console.log("Verificando el funcionamiento de encriptado/desencriptado...");
    console.log("Clave AES:", process.env.AUTH_AES_SECRET_KEY);

    const testData = "texto de prueba";
    console.log("Texto original:", testData);

    const encrypted = Encrypt(testData);
    console.log("Texto encriptado:", encrypted);

    const decrypted = Decrypt(encrypted);
    console.log("Texto desencriptado:", decrypted);

    if (testData === decrypted) {
      console.log("Encriptado y desencriptado funcionando correctamente.");
    } else {
      console.error(
        "Error: el texto desencriptado no coincide con el original."
      );
    }
  } catch (error) {
    console.error("Error al verificar el funcionamiento:", error.message);
  }
};

TestEncryption();

module.exports = {
  Encrypt,
  Decrypt,
};
