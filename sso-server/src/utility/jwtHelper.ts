import * as jwt from "jsonwebtoken";

const privateKey = require("../../config/index");
const ISSUER = "simple-sso";

export const genJwtToken = (payload: any) =>
  new Promise((resolve, reject) => {
    // some of the libraries and libraries written in other language,
    // expect base64 encoded secrets, so sign using the base64 to make
    // jwt useable across all platform and langauage.
    jwt.sign(
      { ...payload },
      privateKey,
      {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: ISSUER,
      },
      (err, token) => {
        if (err) return reject(err);
        return resolve(token);
      }
    );
  });
