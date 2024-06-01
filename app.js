import express from "express";
import * as path from "path";
import mongoose from "mongoose";
import { __dirpath } from "./utils/dirPath.js";
import { authRouter } from "./routes/auth.js";
import csurf from "csurf";
import * as dotenv from "dotenv";
import { default as cookieParser } from "cookie-parser";
import { adminRouter } from "./routes/admin.js";
import { userRouter } from "./routes/user.js";

// configuring dotenv to enable reading environment variables
dotenv.config();

// creating an instance of express server
const app = express();

// setting the path of template files to views
app.set("views", path.join(__dirpath, "views"));

// setting the template engine (abbr. as view engine) to use ejs
app.set("view engine", "ejs");

// configuring the json and encode type
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// setting the path for html pages to use static files
app.use(express.static(path.join(__dirpath, "public")));

// using csurf Token
// app.use(csurfProtection);
// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

app.use(authRouter);
app.use(adminRouter);
app.use(userRouter);

mongoose
  .connect(
    `mongodb+srv://${process.env.ATLAS_USER_NAME}:${process.env.ATLAS_PASSWORD}@cluster0.${process.env.ATLAS_CODE}.mongodb.net/${process.env.ATLAS_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000 || process.env.port);
  })
  .catch(() => {
    console.log("Error => Cannot connect to the database");
    console.log("Exiting the process");
    process.exit();
  });
