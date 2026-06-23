import mongoose from "mongoose";
import { config } from "./appConfig.js";

export default async function dbConnection() {
  await mongoose.connect(config.dbUri);
}
