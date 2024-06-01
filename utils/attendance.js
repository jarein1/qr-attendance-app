import { Attendance } from "../models/attendance.js";
import { Course } from "../models/course.js";
import { DepartmentalCourse } from "../models/departmental-course.js";
import { ObjectId } from "mongodb";
import { Student } from "../models/student.js";
import { Faculty } from "../models/faculty.js";
import { semester } from "../controller/auth.js";
import { Department } from "../models/department.js";

const getStudentAttendance = async (req, res, decoded) => {
  const departmental_course_id = new ObjectId(decoded.departmentalCourseId);
  const student_id = new ObjectId(decoded.userId);

  const departmentCourses = await DepartmentalCourse.findById(
    decoded.departmentalCourseId
  );

  const attendanceRecord = [];

  if (!departmentCourses) {
    console.log("No data found");
    console.log(departmentCourses);
    return;
  }

  console.log("departmental courses are: ");
  console.log(departmentCourses.courses);
  for (const courses of departmentCourses.courses) {
    const objcourses = new ObjectId(courses.course);

    const totalRecords = await Attendance.countDocuments({
      course_id: objcourses,
      departmental_course_id: departmental_course_id,
      "students.0": { $exists: true },
    });

    const studentRecords = await Attendance.countDocuments({
      course_id: objcourses,
      departmental_course_id: departmental_course_id,
      "students.0": { $exists: true },
      "students.student": student_id,
    });

    const courseName = await Course.findById(courses.course);

    attendanceRecord.push({
      name: courseName.name,
      totalDays: totalRecords,
      presentDays: studentRecords,
    });
  }

  res.render("pages/student-attendance", {
    attendanceData: attendanceRecord,
    docTitle: "Student Attendance",
    user_role: decoded.role,
  });
};

const getFacultyAttendance = async (req, res, decoded) => {
  const facultyData = await Faculty.findById(decoded.userId).populate({
    path: "enrolled_courses.course",
    strictPopulate: false,
  });
  if (!facultyData) {
    return res.redirect("/login");
  }
  console.log();
  const courseIdList = facultyData.enrolled_courses.map((course) => ({
    course_id: course.course._id.toString(),
    name: course.course.name,
  }));

  const semesterList = semester;
  const departmentList = [];
  await Promise.all(
    facultyData.enrolled_courses.map(async (course) => {
      const currCourseIdObj = new ObjectId(course.course._id);
      const departmentalData = await DepartmentalCourse.find({
        courses: {
          $elemMatch: { course: currCourseIdObj },
        },
      }).populate("department_id");

      departmentalData.forEach((data) => {
        departmentList.push({
          name: data.department_id.name,
          department_id: data.department_id._id.toString(),
        });
      });
    })
  );

  const uniqueDepartmentList = [];

  departmentList.forEach((department) => {
    const duplicateIndex = uniqueDepartmentList.findIndex(
      (item) =>
        item.name === department.name &&
        item.department_id === department.department_id
    );
    if (duplicateIndex === -1) {
      uniqueDepartmentList.push(department);
    }
  });

  return res.render("pages/faculty-attendance", {
    docTitle: "Department Attendance",
    user_role: decoded.role,
    semesterList: semesterList,
    departmentList: uniqueDepartmentList,
    courseList: courseIdList,
  });
};

const getDepartmentAttendance = async (req, res, decoded) => {
  const courseIdObj = new ObjectId(req.body.courseId);
  const departmentIdObj = new ObjectId(req.body.departmentId);
  const semester = req.body.semester;

  // departmental course data for that particular department and semester
  const departmentalCourse = await DepartmentalCourse.findOne({
    department_id: departmentIdObj,
    semester: semester,
  });
  if (!departmentalCourse) {
    console.log("No data found");
    return;
  }

  const departmentalCourseIdObj = new ObjectId(departmentalCourse._id);

  // student data of the particular Department and Semester
  const departmentStudents = await Student.find({
    departmental_course_id: new ObjectId(departmentalCourse._id),
  });
  const studentsCollection = departmentStudents.map((student) => ({
    name: student.first_name + " " + student.last_name,
    student_id: student._id.toString(),
  }));
  const studentsObjectIds = departmentStudents.map(
    (student) => new ObjectId(student._id)
  );

  console.log(studentsObjectIds);

  const totalDays = await Attendance.countDocuments({
    course_id: courseIdObj,
    departmental_course_id: departmentalCourseIdObj,
    "students.0": { $exists: true },
  });
  console.log(totalDays);

  const promises = studentsCollection.map(async (student) => {
    const studentIdObj = new ObjectId(student.student_id);

    const presentDays = await Attendance.countDocuments({
      course_id: courseIdObj,
      departmental_course_id: departmentalCourseIdObj,
      "students.student": studentIdObj,
    });

    // Return an object with the student data and the presentDays count
    return {
      ...student,
      presentDays: presentDays,
    };
  });

  // Wait for all promises to resolve
  const studentAttendanceData = await Promise.all(promises);

  console.log(studentAttendanceData);
  return res.status(200).json({
    data: studentAttendanceData,
    totalDays: totalDays,
  });
};

export { getStudentAttendance, getDepartmentAttendance, getFacultyAttendance };
