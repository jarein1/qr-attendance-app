import { Schema, model } from "mongoose";

const facultySchema = new Schema({
    first_name: {
        type: Schema.Types.String,
        required: true,
    },
    last_name: {
        type: Schema.Types.String,
        required: true,
    },
    email: {
        type: Schema.Types.String,
        required: true,
    },
    role: {
        type: Schema.Types.String,
        required: true,
    },
    password: {
        type: Schema.Types.String,
        required: true,
    },
    enrolled_courses: [{
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: false,
        },
    }, ],
});

const Faculty = model("Faculty", facultySchema);

export {Faculty};