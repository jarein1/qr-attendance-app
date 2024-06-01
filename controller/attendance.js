const getSelfAttendance = (req, res, next) => {
  const role = req.role;
  const student_id = req._id;

  if (role !== "student") {
    const error = new Error("Not authorized");
    error.statusCode = 401;

    throw error;
  }
};
