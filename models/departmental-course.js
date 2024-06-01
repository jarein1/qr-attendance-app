import { Schema, model } from "mongoose";

const departmentalCourseSchema = new Schema({
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  semester: {
    type: Schema.Types.Number,
    required: true,
  },
  courses: [
    {
      course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: false,
      },
    },
  ],
});

const DepartmentalCourse = model(
  "DepartmentalCourse",
  departmentalCourseSchema
);

export { DepartmentalCourse };
