import type { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  sessionCalls: number;
}
