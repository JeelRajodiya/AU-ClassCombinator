import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  sessionCalls: number;
}

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
