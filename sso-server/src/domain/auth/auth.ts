import { randomUUID } from "crypto";
import { nanoid } from "nanoid";
import { NextFunction, Request, RequestHandler, Response } from "express";
import AppError from "../../utility/ApplicationError";
import { genJwtToken } from "../../utility/jwtHelper";

type UserSchema = {
  password: string;
  userId: string;
  appPolicy: Record<string, any>;
};
type OriginURL = keyof typeof ORIGIN_APP_NAME;
type OriginAppName = typeof ORIGIN_APP_NAME[OriginURL];
type UserId = string;
type UserEmail = string;
type IntermediateToken = string;

const ALLOWED_ORIGIN: Record<string, boolean> = {
  "http://localhost:3031": true,
} as const;

const ORIGIN_APP_NAME = {
  "http://localhost:3031": "sso_consumer", // http://localhost:3031
  "http://consumertwo.ankuranand.in:3030": "simple_sso_consumer",
} as const;

const sessionUserStore: Record<UserId, UserEmail> = {};
const userDB: Record<string, UserSchema> = {
  "info@kbhimani.com": {
    password: "random",
    userId: randomUUID(), // incase you dont want to share the user-email.
    appPolicy: {
      sso_consumer: { role: "admin", shareEmail: true },
      simple_sso_consumer: { role: "user", shareEmail: false },
    },
  },
};
const appTokenDB = {
  sso_consumer: "l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
  simple_sso_consumer: "1g0jJwGmRQhJwvwNOrY4i90kD0m",
};

const isUrlValidOrigin = (url: string): url is OriginURL => {
  return Object.keys(ORIGIN_APP_NAME).includes(url);
};

const sessionApp: Record<UserId, Record<OriginAppName, boolean>> = {};
const intrmTokenCache: Record<IntermediateToken, [UserId, OriginAppName]> = {};

// GET /login
const login = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceUrl } = req.query;

    if (serviceUrl != null) {
      const url = new URL(serviceUrl as string);
      if (ALLOWED_ORIGIN[url.origin] !== true) {
        return res
          .status(400)
          .json({ message: "Your are not allowed to access the sso-server" });
      }
    }

    if (req.session.user != null && serviceUrl == null) {
      return res.redirect("/");
    }

    // if global session already has the user directly redirect with the token
    if (req.session.user != null && serviceUrl != null) {
      const url = new URL(serviceUrl as string);
      if (isUrlValidOrigin(url.origin)) {
        const intrmid = nanoid();
        storeApplicationInCache(url.origin, req.session.user, intrmid);
        return res.redirect(`${serviceUrl}?ssoToken=${intrmid}`);
      }
    }

    return res.render("login", {
      title: "SSO-Server | Login",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(new AppError(500, error.message));
    }
  }
};

// GET /dologin
const dologin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!userDB[email] || userDB[email].password !== password) {
    return next(new AppError(404, "invalid credentials"));
  }

  const { serviceUrl } = req.query;
  const userId = nanoid();
  req.session.user = userId;
  sessionUserStore[userId] = email;
  if (serviceUrl == null) {
    return res.redirect("/");
  }

  const url = new URL(serviceUrl as string);
  if (isUrlValidOrigin(url.origin)) {
    const intrmid = await nanoid();
    storeApplicationInCache(url.origin, userId, intrmid);

    return res.redirect(`${serviceUrl}?ssoToken=${intrmid}`);
  }

  res.status(400).json({ message: "invalid origin" });
};

// GET /verifyToken
const verifyToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const appToken = tokenExtracter(req.headers["authorization"]);
  const { ssoToken } = req.query;

  if (!appToken || !ssoToken || !intrmTokenCache[ssoToken as string]) {
    res.status(400).json({ message: "invalid request" });
  }

  const appName = intrmTokenCache[ssoToken as string][1];
  const globalSessionToken = intrmTokenCache[ssoToken as string][0];

  // check if client sent token matches the actual token of the app defined on the server
  if (
    appToken !== appTokenDB[appName] ||
    sessionApp[globalSessionToken][appName] !== true
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // checking if the token passed has been generated
  const payload = generatePayload(ssoToken as string);

  const token = await genJwtToken(payload);
  // delete the itremCache key for no futher use,
  delete intrmTokenCache[ssoToken as string];
  return res.status(200).json({ token });
};

const generatePayload = (ssoToken: string) => {
  const globalSessionToken = intrmTokenCache[ssoToken][0];
  const appName = intrmTokenCache[ssoToken][1];
  const userEmail = sessionUserStore[globalSessionToken];
  const user = userDB[userEmail];
  const appPolicy = user.appPolicy[appName];
  const email = appPolicy.shareEmail === true ? userEmail : undefined;
  const payload = {
    ...{ ...appPolicy },
    ...{
      email,
      shareEmail: undefined,
      uid: user.userId,
      // global SessionID for the logout functionality.
      globalSessionID: globalSessionToken,
    },
  };
  return payload;
};

const tokenExtracter = (authHeader: string | undefined) => {
  const REG_TOKEN = /^Bearer\s+([A-Za-z0-9\-\._~\+\/]+)=*$/;

  if (!authHeader) {
    return undefined;
  }
  const found = authHeader.match(REG_TOKEN);
  return found ? found[1] : undefined;
};

const storeApplicationInCache = (
  url: OriginURL,
  userId: UserId,
  intermediateToken: IntermediateToken
) => {
  if (!sessionApp[userId]) {
    Object.create(sessionApp[userId], {});
  }
  sessionApp[userId][ORIGIN_APP_NAME[url]] = true;
  fillIntermediateTokenCache(url, userId, intermediateToken);
};

const fillIntermediateTokenCache = (
  url: OriginURL,
  userId: UserId,
  intermediateToken: IntermediateToken
) => {
  intrmTokenCache[intermediateToken] = [userId, ORIGIN_APP_NAME[url]];
};

export { login, dologin, verifyToken };
