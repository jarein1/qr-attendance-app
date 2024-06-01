import { Schema, model } from "mongoose";

const studentSchema = new Schema({
  first_name: {
    type: Schema.Types.String,
    required: true,
  },
  last_name: {
    type: Schema.Types.String,
    required: true,
  },
  role: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
  semester: {
    type: Schema.Types.Number,
    required: true,
  },
  departmental_course_id: {
    type: Schema.Types.ObjectId,
    ref: "DepartmentalCourse",
  },
});

const Student = model("Student", studentSchema);

export { Student };
