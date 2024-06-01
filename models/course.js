import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
    },
});

const Course = model("Course", courseSchema);

export {Course};