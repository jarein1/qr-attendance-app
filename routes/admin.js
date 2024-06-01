import { Router } from "express";
import {
  getCreateDepartment,
  getAdminHome,
  postDepartment,
  getCreateCourse,
  postCourse,
  getCreateFaculty,
  getCreateStudent,
  postCreateStudent,
  getUpdateStudent,
  postUpdateStudent,
  getManageCourse,
  getUpdateCourse,
  postUpdatedCourse,
  deleteCourse,
  getManageDepartment,
  getUpdateDepartment,
  deleteDepartment,
  postUpdatedDepartment,
  getManageFaculty,
  getUpdateFaculty,
  postUpdateFaculty,
  deleteFaculty,
  postCreateFaculty,
  getManageStudent,
  getAssignFaculty,
  postAssignFaculty,
  postSubmitAssignedFaculty,
  getAssignDepartment,
  postAssignDepartment,
  postSubmitAssignedDepartment,
  getAdminAttendance,
} from "../controller/admin.js";

const adminRouter = Router();

adminRouter.get("/admin/create-department", getCreateDepartment);
adminRouter.post("/admin/create-department", postDepartment);
adminRouter.get("/admin/home", getAdminHome);
adminRouter.get("/admin/create-course", getCreateCourse);
adminRouter.post("/admin/create-course", postCourse);
adminRouter.get("/admin/create-faculty", getCreateFaculty);
adminRouter.get("/admin/create-student", getCreateStudent);
adminRouter.post("/admin/create-student", postCreateStudent);
adminRouter.post("/admin/create-faculty", postCreateFaculty);
adminRouter.get("/admin/update-student", getUpdateStudent);
adminRouter.post("/admin/update-student", postUpdateStudent);
adminRouter.get("/admin/manage-course", getManageCourse);
adminRouter.get("/admin/update-course", getUpdateCourse);
adminRouter.post("/admin/update-course", postUpdatedCourse);
adminRouter.get("/admin/delete-course", deleteCourse);
adminRouter.get("/admin/manage-department", getManageDepartment);
adminRouter.get("/admin/update-department", getUpdateDepartment);
adminRouter.post("/admin/update-department", postUpdatedDepartment);
adminRouter.get("/admin/delete-department", deleteDepartment);
adminRouter.get("/admin/manage-faculty", getManageFaculty);
adminRouter.get("/admin/update-faculty", getUpdateFaculty);
adminRouter.post("/admin/update-faculty", postUpdateFaculty);
adminRouter.get("/admin/delete-faculty", deleteFaculty);
adminRouter.get("/admin/manage-student", getManageStudent);
adminRouter.get("/admin/assign-faculty", getAssignFaculty);
adminRouter.post("/admin/assign-faculty", postAssignFaculty);
adminRouter.post("/admin/submit-assigned-faculty", postSubmitAssignedFaculty);
adminRouter.get("/admin/assign-department", getAssignDepartment);
adminRouter.post("/admin/assign-department", postAssignDepartment);
adminRouter.post(
  "/admin/submit-assigned-department",
  postSubmitAssignedDepartment
);
adminRouter.get("/admin/attendance", getAdminAttendance);
export { adminRouter };
