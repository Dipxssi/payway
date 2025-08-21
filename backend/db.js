import mongoose, { model } from "mongoose"
import dotenv from "dotenv"
dotenv.config();
mongoose.connect(process.env.MONGO_URL)

const userSchema = new Schema ({
  username : {type :String},
  password : {type : String},
  email : {type: String , unique: true}
})

export const UserModel = model("User", userSchema)