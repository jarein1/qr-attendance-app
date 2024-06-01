import { Faculty } from "../models/faculty.js";
import { Student } from "../models/student.js";
import { Admin } from "../models/admin.js";
import { Department } from "../models/department.js";
import { Course } from "../models/course.js";
import { default as jwt } from "jsonwebtoken";
import { SECRET, semester } from "./auth.js";
import { default as bcrypt } from "bcryptjs";
import { ObjectId } from "mongodb";
import { DepartmentalCourse } from "../models/departmental-course.js";

const getCreateDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    res.redirect("/admin/login");
  }

  {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return res.redirect("/admin/login");
      }

      // token is valid
      res.render("pages/create-department", {
        docTitle: "create student",
        user_role: decoded.role,
      });
    });
  }
};

const getCreateCourse = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/admin/login");
    }

    // token is valid
    res.render("pages/create-course", {
      docTitle: "create course",
      user_role: decoded.role,
    });
  });
};

const getCreateFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/admin/login");
    }
    res.render("pages/create-faculty", {
      docTitle: "create faculty",
      user_role: decoded.role,
    });
  });
};

const getAdminHome = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    res.render("pages/home", {
      docTitle: "Admin Home",
      docHeader: `welcome ${decoded.userId}`,
      user_role: decoded.role,
    });
  });
};

const postDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const department = req.body.department;
  if (!department) {
    return;
  } else {
    console.log("department: " + department);
  }
  let id;

  if (!token) {
    return res.redirect("/admin/create-department");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    id = decoded.userId;
  });

  Admin.findById(id)
    .then((response) => {
      if (!response) {
        return res.redirect("/admin/login"); // to be changed
      }

      return response;
    })
    .then((adm) => {
      const dept = new Department({
        name: department,
      });
      console.log("creating department: " + department);
      return dept.save();
    })
    .then(async (response) => {
      if (!response) {
        return res.status(401);
      }

      for (let i = 0; i < 3; i++) {
        const newDC1 = new DepartmentalCourse({
          department_id: response._id,
          semester: i * 2 + 1,
        });

        const newDC2 = new DepartmentalCourse({
          department_id: response._id,
          semester: i * 2 + 2,
        });

        const res1 = await newDC1.save();
        const res2 = await newDC2.save();
        console.log(res1);
        console.log(res2);
      }

      return true;
    })
    .then(() => {
      return res.redirect("/admin/create-department"); // to be changed
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/home");
    });
};

const postCourse = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const courseName = req.body.course;
  if (!courseName) {
    return res.redirect("/admin/create-course");
  }
  let id;

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    id = decoded.userId;
  });

  Admin.findById(id)
    .then((response) => {
      if (!response) {
        return res.redirect("/admin/login"); // to be changed
      }

      const course = new Course({
        name: courseName,
      });

      return course.save();
    })
    .then(() => {
      return res.redirect("/admin/create-course"); // to be changed
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/home");
    });
};

const getCreateStudent = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    Department.find().then((depts) => {
      res.render("pages/create-student", {
        docTitle: "Create Student",
        docHeader: `welcome ${decoded.userId}`,
        user_role: decoded.role,
        departmentList: depts,
        semesterList: semester,
      });
    });
  });
};

const postCreateStudent = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const semester = req.body.semester;
  const departmentId = req.body.department;
  const email = req.body.email;
  const password = req.body.password;

  if (
    !firstName ||
    !lastName ||
    !semester ||
    !departmentId ||
    !email ||
    !password
  ) {
    return res.redirect("/admin/create-student");
  }
  let id;

  if (!token) {
    return res.redirect("/admin/create-student");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    id = decoded.userId;
  });

  Admin.findById(id)
    .then((response) => {
      if (!response) {
        return res.redirect("/admin/login"); // to be changed
      }
      const deptIdObject = new ObjectId(departmentId);
      return DepartmentalCourse.findOne({
        department_id: deptIdObject,
        semester: semester,
      });
    })
    .then((deptCourseData) => {
      if (!deptCourseData) {
        console.log("Cannot find departmental Course Id");
        return res.redirect("/admin/home");
      }

      bcrypt.hash(password, 12, (err, hash) => {
        if (err) {
          console.log(err);
          return;
        }

        const stud = new Student({
          first_name: firstName,
          last_name: lastName,
          semester: semester,
          department_id: departmentId,
          email: email,
          password: hash,
          role: "student",
          departmental_course_id: deptCourseData._id,
        });

        stud
          .save()
          .then(() => {
            return res.redirect("/admin/create-student"); // to be changed
          })
          .catch((err) => {
            console.log(err);
            return res.redirect("/admin/home");
          });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/home");
    });
};

const postCreateFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const email = req.body.email;
  const password = req.body.password;

  console.log(req.body);

  if (!firstName || !lastName || !email || !password) {
    return res.redirect("/admin/create-faculty");
  }
  let id;

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    id = decoded.userId;
  });

  Admin.findById(id).then((response) => {
    if (!response) {
      return res.redirect("/admin/login"); // to be changed
    }

    bcrypt.hash(password, 12, (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }

      const fac = new Faculty({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: hash,
        role: "faculty",
      });

      fac
        .save()
        .then(() => {
          return res.redirect("/admin/create-faculty"); // to be changed
        })
        .catch((err) => {
          console.log(err);
          return res.redirect("/admin/home");
        });
    });
  });
};

const getUpdateStudent = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const id = req.query.id;
  console.log(id);

  let departments;

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    Department.find()
      .then((depts) => {
        departments = depts;
        return Student.findById(id);
      })
      .then((stud) => {
        res.render("pages/update-student", {
          docTitle: "Update Student",
          docHeader: `welcome ${decoded.userId}`,
          user_role: decoded.role,
          departmentList: departments,
          semesterList: semester,
          studentInfo: stud,
        });
      });
  });
};

const postUpdateStudent = (req, res, next) => {
  const token = req.cookies.jwtToken;

  const id = req.body.studentId;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const semester = req.body.semester;
  const departmentId = req.body.department;
  const email = req.body.email;

  console.log(req.body);

  if (!firstName || !lastName || !semester || !departmentId || !email) {
    return res.redirect("/admin/create-student");
  }

  if (!token) {
    return res.redirect("/admin/create-student");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    const adminId = decoded.userId;
    Admin.findById(adminId)
      .then((response) => {
        if (!response) {
          return res.redirect("/admin/login"); // to be changed
        }

        return Student.findById(id);
      })
      .then((studRes) => {
        if (!studRes) {
          return res.redirect("/admin/home");
        }

        return Student.findOneAndUpdate(
          {
            _id: id,
          },
          {
            first_name: firstName,
            last_name: lastName,
            semester: parseInt(semester),
            department_id: departmentId,
            email: email,
          }
        );
      })
      .then(() => {
        return res.redirect("/admin/home"); // to be changed
      })
      .catch((err) => {
        console.log(err);
        return res.redirect("/admin/home");
      });
  });
};

const getManageCourse = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    Course.find()
      .then((courses) => {
        if (!courses) {
          return res.redirect("/admin/login");
        }
        res.render("pages/manage-course", {
          user_role: decoded.role,
          courseList: courses,
          docTitle: "Manage Course",
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/home");
      });
  });
};

const getUpdateCourse = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const courseId = req.query.id;

  if (!token || !courseId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.findById(courseId).then((data) => {
      if (!data) {
        return res.redirect("/admin/manage-course");
      }
      console.log(data);
      res.render("pages/update-course", {
        user_role: decoded.role,
        docTitle: "Update Course",
        courseInfo: data,
      });
    });
  });
};

const postUpdatedCourse = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const courseId = req.body.courseId;
  const courseName = req.body.course;

  if (!token || !courseId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.findOneAndUpdate(
      {
        _id: courseId,
      },
      {
        name: courseName,
      }
    )
      .then((data) => {
        res.redirect("/admin/manage-course");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/manage-course");
      });
  });
};

const deleteCourse = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const courseId = req.query.id;

  if (!token || !courseId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.deleteOne({ _id: courseId })
      .then((data) => {
        if (!data) {
          throw new Error("Cannot delete from data base");
        }
        res.redirect("/admin/manage-course");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/manage-course");
      });
  });
};

const getManageDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    Department.find()
      .then((departments) => {
        if (!departments) {
          return res.redirect("/admin/login");
        }
        res.render("pages/manage-department", {
          user_role: decoded.role,
          departmentList: departments,
          docTitle: "Manage Department",
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/home");
      });
  });
};

const getUpdateDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const departmentId = req.query.id;

  if (!token || !departmentId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Department.findById(departmentId).then((data) => {
      if (!data) {
        return res.redirect("/admin/manage-department");
      }
      console.log(data);
      res.render("pages/update-department", {
        user_role: decoded.role,
        docTitle: "Update Department",
        departmentInfo: data,
      });
    });
  });
};

const deleteDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const departmentId = req.query.id;

  if (!token || !departmentId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Department.deleteOne({ _id: departmentId })
      .then((data) => {
        if (!data) {
          throw new Error("Cannot delete from data base");
        }
        res.redirect("/admin/manage-department");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/manage-department");
      });
  });
};

const postUpdatedDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const departmentId = req.body.departmentId;
  const departmentName = req.body.department;

  if (!token || !departmentId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Department.findOneAndUpdate(
      {
        _id: departmentId,
      },
      {
        name: departmentName,
      }
    )
      .then((data) => {
        res.redirect("/admin/manage-department");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/manage-department");
      });
  });
};

const getManageFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // token is valid
    Faculty.find()
      .then((faculties) => {
        if (!faculties) {
          return res.redirect("/admin/login");
        }
        res.render("pages/manage-faculty", {
          user_role: decoded.role,
          facultyList: faculties,
          docTitle: "Manage Faculty",
        });
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/home");
      });
  });
};

const getUpdateFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const facultyId = req.query.id;

  if (!token || !facultyId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Faculty.findById(facultyId).then((data) => {
      if (!data) {
        return res.redirect("/admin/manage-faculty");
      }

      res.render("pages/update-faculty", {
        user_role: decoded.role,
        docTitle: "Update Faculty",
        facultyInfo: data,
      });
    });
  });
};

const postUpdateFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const facultyId = req.body.facultyId;
  const facultyFirstName = req.body.first_name;
  const facultyLastName = req.body.last_name;
  const email = req.body.email;

  if (!token || !facultyId || !facultyFirstName || !facultyLastName || !email) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Faculty.findOneAndUpdate(
      {
        _id: facultyId,
      },
      {
        first_name: facultyFirstName,
        last_name: facultyLastName,
        email: email,
      }
    )
      .then((data) => {
        res.redirect("/admin/manage-faculty");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/manage-faculty");
      });
  });
};

const deleteFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const facultyId = req.query.id;

  if (!token || !facultyId) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Faculty.deleteOne({ _id: facultyId })
      .then((data) => {
        if (!data) {
          throw new Error("Cannot delete from data base");
        }
        res.redirect("/admin/manage-faculty");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/manage-faculty");
      });
  });
};

const getManageStudent = (req, res, next) => {
  console.log("manage student");
  const token = req.cookies.jwtToken;

  const departmentId = req.query.departmentId;
  const semesterVal = req.query.semester;
  let departmentName;
  let departmentList;

  if (!token) {
    return res.redirect("/admin/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    // 00000
    Department.find()
      .then((departments) => {
        departmentList = departments;

        if (
          !departmentId ||
          !semesterVal ||
          departmentId === "" ||
          semesterVal === ""
        ) {
          return res.render("pages/manage-student", {
            studentList: [],
            departmentList: departmentList,
            department: "",
            semesterList: semester,
            user_role: decoded.role,
            docTitle: "Manage Student",
          });
        }

        return 1;
      })
      .then((response) => {
        if (response === 1) {
          return Department.findById(departmentId);
        } else return 1;
      })
      .then((dept) => {
        if (dept === 1) {
          return 1;
        }
        if (!dept) {
          console.log("department not found");
          res.redirect("/admin/home");
        }
        departmentName = dept.name;
        return Student.find({
          department_id: departmentId,
          semester: semesterVal,
        });
      })
      .then((students) => {
        if (students === 1) {
          return;
        }
        return res.render("pages/manage-student", {
          studentList: students,
          departmentList: departmentList,
          semesterList: semester,
          department: departmentName,
          user_role: decoded.role,
          docTitle: "Manage Student",
        });
      })
      .catch((err) => {
        console.log(err);
        return res.redirect("/admin/home");
      });
  });
};

const getAssignFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;

  const courseList = [];
  const facultyList = [];
  const selectedCourse = "";

  if (!token) {
    return res.redirect("/admin/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.find()
      .then((courses) => {
        courseList.push(...courses);

        return res.render("pages/assign-faculty", {
          docTitle: "Assign Faculty",
          user_role: decoded.role,
          courseList: courseList,
          facultyList: facultyList,
          selectedCourse: selectedCourse,
        });
      })
      .catch(() => {
        return res.redirect("/admin/home");
      });
  });
};

const postAssignFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const selectedCourse = req.body.course || "";

  if (!selectedCourse) {
    return res.redirect("/admin/assign-faculty");
  }

  const facultyList = [];
  const courseList = [];

  if (!token) {
    return res.redirect("/admin/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.find()
      .then((courses) => {
        courseList.push(...courses);

        return Faculty.find();
      })
      .then((result) => {
        const faculties = result.map((x) => {
          return {
            ...x,
            enrolled_courses: x.enrolled_courses.map((y) => y.toString()),
          };
        });
        facultyList.push(...faculties.map((x) => x._doc));

        return res.render("pages/assign-faculty", {
          docTitle: "Assign Faculty",
          user_role: decoded.role,
          courseList: courseList,
          facultyList: facultyList,
          selectedCourse: selectedCourse,
        });
      });
  });
};

const postSubmitAssignedFaculty = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const selectedCourse = req.body.course;
  const facultyAdd = req.body.facultyAdd;
  const facultyRemove = req.body.facultyRemove;

  console.log(selectedCourse);
  console.log(facultyAdd.length || facultyRemove.length);
  console.log(selectedCourse && (facultyAdd.length || facultyRemove.length));
  if (!selectedCourse || !(facultyAdd.length || facultyRemove.length)) {
    return res.redirect("/admin/assign-faculty");
  }

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, async (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    const isCourse = await Course.findById(selectedCourse);
    if (!isCourse) {
      console.log("course not found");
      return res.redirect("/admin/home");
    }

    const courseId = new ObjectId(selectedCourse);
    const allFacultyAdd = facultyAdd.map((x) => new ObjectId(x));
    const allFacultyRemove = facultyRemove.map((x) => new ObjectId(x));

    const bulkAdd = allFacultyAdd.map((facultyId) => ({
      updateOne: {
        filter: {
          _id: facultyId,
          enrolled_courses: {
            $not: {
              $elemMatch: { course: courseId },
            },
          },
        },
        update: {
          $addToSet: { enrolled_courses: { course: courseId } },
        },
      },
    }));

    // bulkAdding
    const bulkAddResult = await Faculty.bulkWrite(bulkAdd);
    console.log("bulk add result: ");
    console.log(bulkAddResult);
    console.log("\n\n\n");

    const bulkRemove = allFacultyRemove.map((facultyId) => ({
      updateOne: {
        filter: {
          _id: facultyId,
          enrolled_courses: {
            $elemMatch: { course: courseId },
          },
        },
        update: {
          $pull: {
            enrolled_courses: {
              course: courseId,
            },
          },
        },
      },
    }));

    // bulk remove
    const bulkRemoveResult = await Faculty.bulkWrite(bulkRemove);
    console.log("bulk remove result: ");
    console.log(bulkRemoveResult);
    console.log("\n\n\n");

    return res.status(201).json({
      status: 200,
      ok: true,
    });
  });
};

const getAssignDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;

  const courseList = [];
  const departmentList = [];
  const selectedCourse = "";

  if (!token) {
    return res.redirect("/admin/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.find()
      .then((courses) => {
        courseList.push(...courses);

        return res.render("pages/assign-department", {
          docTitle: "Assign Department",
          user_role: decoded.role,
          courseList: courseList,
          departmentList: departmentList,
          selectedCourse: selectedCourse,
        });
      })
      .catch(() => {
        return res.redirect("/admin/home");
      });
  });
};

const postAssignDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const selectedCourse = req.body.course || "";

  if (!selectedCourse) {
    return res.redirect("/admin/assign-department");
  }

  const departmentList = [];
  const courseList = [];

  if (!token) {
    return res.redirect("/admin/login");
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    Course.find()
      .then((courses) => {
        courseList.push(...courses);

        return DepartmentalCourse.find().populate("department_id", "name");
      })
      .then((result) => {
        const departments = result.map((x) => {
          return {
            ...x,
            courses: x.courses.map((y) => ({
              _id: y._id,
              course: y.course.toString(),
            })),
          };
        });
        departmentList.push(...departments.map((x) => x._doc));

        return res.render("pages/assign-department", {
          docTitle: "Assign Faculty",
          user_role: decoded.role,
          courseList: courseList,
          departmentList: departmentList,
          selectedCourse: selectedCourse,
        });
      });
  });
};

const postSubmitAssignedDepartment = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const selectedCourse = req.body.course;
  const departmentAdd = req.body.departmentAdd;
  const departmentRemove = req.body.departmentRemove;

  if (!selectedCourse || !(departmentAdd.length || departmentRemove.length)) {
    console.log("here ");
    return res.redirect("/admin/assign-department");
  }

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, async (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    const isCourse = await Course.findById(selectedCourse);
    if (!isCourse) {
      console.log("course not found");
      return res.redirect("/admin/home");
    }

    const courseId = new ObjectId(selectedCourse);
    const allDepartmentAdd = departmentAdd.map((x) => new ObjectId(x));
    const allDepartmentRemove = departmentRemove.map((x) => new ObjectId(x));

    // console.log("courseId: ");
    // console.log(courseId);
    // console.log("\nadd: ");
    // console.log(allDepartmentAdd);
    // console.log("\nremove:");
    // console.log(allDepartmentRemove);

    const bulkAdd = allDepartmentAdd.map((departmentData) => ({
      updateOne: {
        filter: {
          _id: departmentData,
          courses: {
            $not: {
              $elemMatch: { course: courseId },
            },
          },
        },
        update: {
          $addToSet: { courses: { course: courseId } },
        },
      },
    }));

    // bulkAdding
    const bulkAddResult = await DepartmentalCourse.bulkWrite(bulkAdd);
    console.log(bulkAddResult);

    const bulkRemove = allDepartmentRemove.map((departmentData) => ({
      updateOne: {
        filter: {
          _id: departmentData,
          courses: {
            $elemMatch: { course: courseId },
          },
        },
        update: {
          $pull: {
            courses: {
              course: courseId,
            },
          },
        },
      },
    }));

    // bulk remove
    const bulkRemoveResult = await DepartmentalCourse.bulkWrite(bulkRemove);

    return res.status(201).json({
      status: 200,
      ok: true,
    });
  });
};

const getAdminAttendance = (req, res, next) => {
  const token = req.cookies.jwtToken;
  const courseId = req.body.courseId;
  const departmentId = req.body.departmentId;
  const selectedSemester = req.body.semester;

  const courseList = [];
  const departmentList = [];

  if (!token) {
    return res.redirect("/admin/login");
  }

  jwt.verify(token, SECRET, async (err, decoded) => {
    if (err || decoded.role !== "admin") {
      return res.redirect("/admin/login");
    }

    return Course.find()
      .then((courses) => {
        courseList.push(...courses);

        return Department.find();
      })
      .then((departments) => {
        departmentList.push(...departments);

        if (!courseId || !departmentId || !selectedSemester) {
          return res.render("pages/admin-attendance", {
            docTitle: "Admin Attendance",
            user_role: decoded.role,
            courseList: courseList,
            departmentList: departmentList,
            studentList: [],
            semesterList: semester,
          });
        }

        return res.redirect("/admin/home");
      })
      .catch((err) => {
        console.log(err);

        return res.redirect("/admin/home");
      });
  });
};

export {
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
};
