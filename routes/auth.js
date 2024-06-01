import { Router } from "express";
import {
  adminLogin,
  getAdminLogin,
  getAdminLogout,
  getLogin,
  getUserLogout,
  userLogin,
} from "../controller/auth.js";

const authRouter = Router();

authRouter.get("/login", getLogin);
authRouter.post("/login", userLogin);
authRouter.get("/logout", getUserLogout);

authRouter.get("/admin/login", getAdminLogin);
authRouter.post("/admin/login", adminLogin);
authRouter.get("/admin/logout", getAdminLogout);

export { authRouter };
