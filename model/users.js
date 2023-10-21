import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import passportLocalMongoose from "passport-local-mongoose";
import env from 'dotenv'
env.config()

const UserSchema = new mongoose.Schema({
    email: {
        type:String,
        // required:true
    },
    password: {
        type:String,
        // required:true
    },
})


// UserSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ['password'] });
UserSchema.plugin(passportLocalMongoose)

const User = mongoose.model('user', UserSchema)

export default User;