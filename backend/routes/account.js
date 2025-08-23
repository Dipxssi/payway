import express from "express"
import mongoose from "mongoose"
import { AccountModel } from "../db";
import authMiddleware from "../midddleware";
const router = express.Router();


router.get('/balance', authMiddleware , async function(req, res){
    const account = await AccountModel.findOne({
      userId : req.userId,  
    })
    res.json({
      balance : account.balance
    })
});

router.post('/transfer', authMiddleware, async function(req,res){
  const session = await mongoose.startSession();
  session.startTransaction();
  const {to , amount} = req.body;
  const account = await AccountModel.findOne({userId : req.userId}).session(session);


  if(!account || account.balance < amount){
    await session.abortTransaction();
    return res.status(400).json({
      message : "Insufficient balance"
    });
  }

  const toAccount = await AccountModel.findOne({userId : to}).session(session);

  if(!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message : "Invalid account"
    })
  }

  await AccountModel.updateOne({userId : req.userId}, {$inc: { balance : -amount}}).session(session)

  await AccountModel.updateOne({userId : to}, {$inc: { balance : amount}}).session(session)

  await session.commitTransaction();
  res.json({
    message : "Transfer sucessful"
  })
})
export default router;
