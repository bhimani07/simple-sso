import { NextFunction, Request, Response } from "express";

const ssoServerBaseUrl = "http://localhost:8081";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // simple check to see if the user is authenicated or not,
  // if not redirect the user to the SSO Server for Login
  // pass the redirect URL as current URL
  // serviceURL is where the sso should redirect in case of valid user
  const redirectURL = `${req.protocol}://${req.headers.host}${req.path}`;
  if (req.session.user == null) {
    return res.redirect(
      `${ssoServerBaseUrl}/sso/login?serviceURL=${redirectURL}`
    );
  }
  next();
};

export default isAuthenticated;
