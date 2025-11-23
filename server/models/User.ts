import mongoose, { Schema } from "mongoose";
import type { IUser } from "../../types/user";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    sessionCalls: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
