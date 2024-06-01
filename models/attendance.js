import { Schema, model } from "mongoose";

const attendanceSchema = new Schema({
  course_id: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  departmental_course_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  class_number: {
    type: Schema.Types.Number,
    required: true,
  },
  date: {
    type: Schema.Types.String,
    required: true,
  },
  students: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: false,
      },
    },
  ],
});

const Attendance = model("Attendance", attendanceSchema);

export { Attendance };
