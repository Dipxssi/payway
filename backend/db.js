import mongoose, {Schema, model } from "mongoose"
import dotenv from "dotenv"
dotenv.config();
mongoose.connect(process.env.MONGO_URL)

const userSchema = new Schema ({
  username : {type :String},
  password : {type : String},
  email : {type: String , unique: true}
})

const  accountSchema = new Schema ({
   userId : {type: mongoose.Schema.Types.ObjectId , ref: "User", required : true},
   balance : {type : Number , required : true}
})

export const UserModel = model("User", userSchema)
export const AccountModel = model("Account" , accountSchema) 