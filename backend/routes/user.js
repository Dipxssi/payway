import express from "express"
import * as z from "zod"
import bcrypt from "bcrypt"
import { UserModel , AccountModel } from "../db";
import dotenv from "dotenv"
dotenv.config();
import jwt from "jsonwebtoken"
import { authMiddleware } from "../midddleware"
const router = express.Router();

router.post('/signup', async function (req, res) {

  const requireBody = z.object({
    username: z.string(),
    password: z.string().min(8, "Password must be 8 characters long"),
    email: z.string().email()
  })

  const parsedDataWithSuccess = requireBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    res.status(401).json({
      mssg: "Incorrect creds",
      error: parsedDataWithSuccess.error
    })
    return
  }

  const { username, password, email } = parsedDataWithSuccess.data

  const hashedPassword = await bcrypt.hash(password, 5);

  try {
   const newUser =  await UserModel.create({
      username: username,
      password: hashedPassword,
      email: email
    })
    const userId = newUser._id

    await AccountModel.create({
      userId,
      balance: 1 + Math.random() * 10000
    })
    res.json({
      mssg: "You are signed up"
    })
  } catch (e) {
    res.status(411).json({
      mssg: "User already exists",
    })
  }
});

router.post('/signin', async function (req, res) {
  const { username, password } = req.body;

  const existingUser = await UserModel.findOne({
    username
  })

  if (!existingUser) {
    return res.status(401).json({ mssg: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password)

  if (!isPasswordValid) {
    return res.status(401).json({ mssg: "Incorrect creds" });
  }

  const token = jwt.sign({
    id: existingUser._id
  }, process.env.JWT_SECRET);

  res.json({
    token
  })
});

router.put("/", authMiddleware, async function (req, res) {
  const requireBody = z.object({
    username: z.string(),
    password: z.string().min(8, "Password must be 8 characters long"),
    email: z.string().email()
  })

  const parsedDataWithSuccess = requireBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    res.status(401).json({
      mssg: "Incorrect creds",
      error: parsedDataWithSuccess.error
    })
    return
  }

  const { username, password, email } = parsedDataWithSuccess.data;

  const hashedPassword = await bcrypt.hash(password, 5)


  try {
    await UserModel.findByIdAndUpdate(req.userId, {
      username,
      email,
      password: hashedPassword
    },
      { new: true })
    res.json({
      mssg: "Updated sucessfully"
    })
  } catch (e) {
    res.status(500).json({ mssg: "smtg went wrong" })
  }
})

router.get("/bulk", async function (req, res) {
  const filter = req.query.filter || "";

  const users = await UserModel.find({
    $or: [
      { username: { "$regex": filter } },
      { email: { "$regex": filter } }
    ]
  })

  res.json({
    user: users.map(user => ({
      username: user.username,
      email: user.email,
      _id: user._id
    }))
  })
})

export default router;