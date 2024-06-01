import { Schema, model } from "mongoose";

const departmentSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
    },
});

const Department = model("Department", departmentSchema);

export {Department};