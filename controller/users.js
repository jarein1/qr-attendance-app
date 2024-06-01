import { Faculty } from "../models/faculty.js";
import { default as jwt } from "jsonwebtoken";
import { Department } from "../models/department.js";
import { Attendance } from "../models/attendance.js";
import { Course } from "../models/course.js";
import { SECRET, semester } from "./auth.js";
import QRCode from "qrcode";
import { DepartmentalCourse } from "../models/departmental-course.js";
import { ObjectId } from "mongodb";
import {
  getFacultyAttendance,
  getStudentAttendance,
} from "../utils/attendance.js";

const getHome = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      console.log("token not found");
      return res.redirect("/login");
    }

    // token is valid
    if (decoded.role === "faculty") {
      return Faculty.findById(decoded.userId)
        .populate("enrolled_courses.course", "name")
        .then((response) => {
          if (!response) {
            return res.redirect("login");
          }
          const courseList = response.enrolled_courses.map((x) => ({
            id: x.course._id.toString(),
            name: x.course.name,
          }));
          return res.render("pages/faculty-home", {
            courseList: courseList,
            docTitle: "Faculty Home",
            docHeader: `Welcome, ${decoded.userName}`,
            user_role: decoded.role,
          });
        });
    } else if (decoded.role === "student") {
      return res.render("pages/student-home", {
        docTitle: "Student Home",
        docHeader: `Welcome, ${decoded.userName}`,
        user_role: decoded.role,
      });
    }
  });
};

const getQrCode = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const courseID = req.body.courseId;
  const classNumber = req.body.classNumber;
  const dateObj = new Date();
  const dateStr = dateObj.toISOString().slice(0, 10);
  let courseName = "";
  const objCourseId = new ObjectId(courseID);

  if (!token) {
    return res.redirect("/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "faculty") {
      return res.redirect("/login");
    }

    if (!courseID || !classNumber || classNumber > 3 || classNumber < 1) {
      return res.redirect("/home");
    }

    Course.findById(courseID)
      .then((courseData) => {
        if (!courseData) {
          throw new Error();
        }

        courseName = courseData.name;
        return Attendance.find({
          course_id: objCourseId,
          date: dateStr,
          class_number: classNumber,
        });
      })
      .then((oldAttendance) => {
        if (oldAttendance.length > 0) {
          return 1;
        }

        return DepartmentalCourse.find({
          courses: { $elemMatch: { course: courseID } },
        });
      })
      .then((deptCourseData) => {
        if (!deptCourseData || deptCourseData?.length === 0) {
          return null;
        }

        if (deptCourseData === 1) {
          return 1;
        }

        const departmentalCourseBulkAdd = deptCourseData.map((deptCourseId) => {
          return new Attendance({
            course_id: objCourseId,
            class_number: classNumber,
            date: dateStr,
            departmental_course_id: deptCourseId,
          });
        });

        return Attendance.create(departmentalCourseBulkAdd);
      })
      .then((attRes) => {
        if (!attRes) {
          return res.redirect("/home");
        }

        QRCode.toString(
          `${courseID};${dateStr};${classNumber}`,
          { type: "svg" },
          function (err, url) {
            if (err) {
              throw err;
            }

            return res.render("pages/generate-qr", {
              user_role: decoded.role,
              docTitle: "QR Code",
              qrcode: url,
              courseName: courseName,
            });
          }
        );
      })
      .catch((err) => {
        console.log(err);
        return res.redirect("/home");
      });
  });
};

const getScanQr = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "student") {
      return res.redirect("/login");
    }

    res.render("pages/scan-qr.ejs");
  });
};

const postStudentAttendance = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "student") {
      console.log("error student data")``;
      return res.redirect("/login");
    }

    const courseIdObject = new ObjectId(req.body.courseId);
    const classNumber = parseInt(req.body.classNumber);
    const departmentalCourseIdObject = new ObjectId(
      decoded.departmentalCourseId
    );
    const studentId = new ObjectId(decoded.userId);
    const dateString = req.body.date;

    const filter = {
      course_id: courseIdObject,
      class_number: classNumber,
      departmental_course_id: departmentalCourseIdObject,
      date: dateString,
    };

    Attendance.findOne(filter)
      .then((attendance) => {
        if (!attendance) {
          throw new Error();
        }

        if (
          attendance &&
          attendance.students.some((s) => s.student.equals(studentId))
        ) {
          return 1;
        }

        const update = {
          $addToSet: { students: { student: studentId } },
        };
        const options = {
          upsert: false,
        };

        return Attendance.findOneAndUpdate(filter, update, options);
      })
      .then((result) => {
        if (!result) {
          return res.status(501).json({
            message: "Failed to enter attendance",
          });
        }

        return res.status(200).json({
          message: "Successful",
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(501).json({
          message: "Failed to Operate",
        });
      });
  });
};

const getAttendance = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      console.log("error student data");
      return res.redirect("/login");
    }

    if (!decoded) {
      return res.redirect("/home");
    }

    switch (decoded.role) {
      case "student":
        return getStudentAttendance(req, res, decoded);
        break;
      case "faculty":
        return getFacultyAttendance(req, res, decoded);
        break;
      default:
        return res.redirect("/login");
    }
  });
};

const getDepartmentAttendance = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "student") {
      console.log("error student data")``;
      return res.redirect("/login");
    }

    getDepartmentAttendance(req, res, decoded);
  });
};

export {
  getHome,
  getQrCode,
  getScanQr,
  postStudentAttendance,
  getAttendance,
  getDepartmentAttendance,
};
