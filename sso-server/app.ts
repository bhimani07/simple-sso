import express from "express";
import session from "express-session";
import morgan from "morgan";
import router from "./src/router/index";
import AppError from "./src/utility/ApplicationError";
import catcher from "./src/utility/catcher";

const engine = require("ejs-mate");

const app: express.Application = express();

// Logger
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("ejs", engine);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/sso", router);

app.use((_, __, next) => {
  const notFoundError = new AppError(404, "route not found");
  next(notFoundError);
});

app.use(catcher);

export default app;
