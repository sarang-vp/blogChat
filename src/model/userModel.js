const mongoose = require("mongoose")

const userSchema={
    userName:String,
    email:String,
    mobileNo:String,
    passWord:String
}
const userModel = mongoose.model("user",userSchema)
module.exports={
    userModel
}