import url from "url";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import verifyJwtToken from "../utility/jwtHelper";

// const validReferOrigin = "http://sso.ankuranand.com:8081";
const ssoServerJWTURL = "http://localhost:8081/sso/verifytoken";

const ssoRedirect = () => {
  return async function (req: Request, res: Response, next: NextFunction) {
    // check if the req has the queryParameter as ssoToken
    // and who is the referer.
    const { ssoToken } = req.query;
    if (ssoToken != null) {
      // to remove the ssoToken in query parameter redirect.
      const redirectURL = url.parse(req.url).pathname;
      try {
        const response = await axios.get(
          `${ssoServerJWTURL}?ssoToken=${ssoToken}`,
          {
            headers: {
              Authorization: "Bearer l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
            },
          }
        );
        const { token } = response.data;
        const decoded = await verifyJwtToken(token as string);
        // now that we have the decoded jwt, use the,
        // global-session-id as the session id so that
        // the logout can be implemented with the global session.
        req.session.user = decoded;
      } catch (err) {
        return next(err);
      }

      return res.redirect(`${redirectURL}`);
    }

    return next();
  };
};

export default ssoRedirect;
