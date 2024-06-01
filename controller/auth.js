import { Faculty } from "../models/faculty.js";
import { Student } from "../models/student.js";
import { Admin } from "../models/admin.js";
import { default as bcrypt } from "bcryptjs";
import url from "url";
import { default as jwt } from "jsonwebtoken";

export const SECRET = "this is a secret key";

export const semester = [
  { semester: "I", value: 1 },
  { semester: "II", value: 2 },
  { semester: "III", value: 3 },
  { semester: "IV", value: 4 },
  { semester: "V", value: 5 },
  { semester: "VI", value: 6 },
];

const getLogin = (req, res, next) => {
  res.render("pages/user-login", {
    docTitle: "User Signup",
    path: "login",
  });
};

const userLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let user_info;
  let isFaculty = false;
  let isStudent = false;

  if (!email || !password) {
    return res.status(401);
  }

  //user login checks student first
  Student.findOne({ email: email })
    .then((result) => {
      if (!result) {
        return Faculty.findOne({ email: email });
      }

      isStudent = true;
      return result;
    })
    .then((response) => {
      if (isStudent) {
        user_info = response;
        return bcrypt.compare(password, user_info.password);
      }
      if (!response) {
        throw new Error("No user found");
        // here
      }

      isFaculty = true;
      user_info = response;
      return bcrypt.compare(password, user_info.password);
    })
    .then((hashResult) => {
      if (!hashResult) {
        throw new Error("Wrong password");
      }

      const token = jwt.sign(
        {
          email: user_info.email,
          userId: user_info._id.toString(),
          role: user_info.role,
          department: isStudent ? user_info.department_id.toString() : "",
          semester: isStudent ? user_info.semester : "",
          userName: user_info.first_name + " " + user_info.last_name,
          departmentalCourseId: isStudent
            ? user_info.departmental_course_id
            : "",
        },
        SECRET,
        {
          expiresIn: "12h",
        }
      );

      res.cookie("jwtToken", token, {
        httpOnly: true,
        maxAge: 900000,
        path: "/",
      });

      return res.status(200).json({
        user_id: user_info._id.toString(),
        user_role: user_info.role,
        user_department: isStudent ? user_info.department_id.toString() : "",
        semester: isStudent ? user_info.semester : "",
        user_name: user_info.first_name + " " + user_info.last_name,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(401);
    });
};

const getUserLogout = (req, res, next) => {
  res.clearCookie("jwtToken");
  res.redirect("/login");
};

const adminLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Admin.findOne({ email: email })
    .then((result) => {
      if (!result) {
        const error = new Error("User with this email doesn't exist");
        error.statusCode = 404;

        throw error;
      }

      if (result.password !== password) {
        const error = new Error("Invalid Password");
        error.statusCode = 401;

        throw error;
      }

      const token = jwt.sign(
        {
          email: result.email,
          userId: result._id.toString(),
          role: result.role,
        },
        SECRET,
        {
          expiresIn: "12h",
        }
      );

      req.user_id = result._id.toString();
      req.role = result.role;
      res.cookie("jwtToken", token, {
        httpOnly: true,
        maxAge: 900000,
        path: "/",
      });

      return res.status(200).json({
        user_id: result._id.toString(),
        user_role: result.role,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

const getAdminLogin = (req, res, next) => {
  console.log("Admin login");
  res.render("pages/admin-login", {
    docTitle: "Admin Login",
    path: "login",
  });
};

const getAdminLogout = (req, res, next) => {
  res.clearCookie("jwtToken");
  res.redirect("/admin/login");
};

export {
  userLogin,
  adminLogin,
  getUserLogout,
  getLogin,
  getAdminLogin,
  getAdminLogout,
};
