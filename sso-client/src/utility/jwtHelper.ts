import jwt from "jsonwebtoken";
import PUBLIC_KEY from "../../config/index";
import AppError from "./ApplicationError";

const ISSUER = "simple-sso";
const verifyJwtToken = (token: string) =>
  new Promise((resolve, reject) => {
    jwt.verify(
      token,
      PUBLIC_KEY,
      { issuer: ISSUER, algorithms: ["RS256"] },
      (err, decoded) => {
        if (err) return reject(new AppError(500, err.message));
        return resolve(decoded);
      }
    );
  });

export default verifyJwtToken;
