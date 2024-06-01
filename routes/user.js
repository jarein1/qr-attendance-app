import { Router } from "express";
import {
  getAttendance,
  getHome,
  getQrCode,
  getScanQr,
  postStudentAttendance,
} from "../controller/users.js";
import { getDepartmentAttendance } from "../utils/attendance.js";

const userRouter = Router();

userRouter.get("/home", getHome);
userRouter.post("/generate-qr", getQrCode);
userRouter.get("/generate-qr", getHome);
userRouter.get("/scan-qr", getScanQr);
userRouter.post("/submit-attendance", postStudentAttendance);
userRouter.get("/attendance", getAttendance);
userRouter.post("/department-attendance", getDepartmentAttendance);

export { userRouter };
