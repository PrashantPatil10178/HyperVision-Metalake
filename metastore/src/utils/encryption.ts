import CryptoJS from "crypto-js";

const SECRET_KEY = "Ronaldo";

export const encryptData = (data: {
  provider: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
