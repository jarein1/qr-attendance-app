import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  role: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
});

const Admin = model("Admin", adminSchema);

export {Admin};
