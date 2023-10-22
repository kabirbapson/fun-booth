import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import passportLocalMongoose from "passport-local-mongoose";
import env from "dotenv";
import findOrCreate from "mongoose-findorcreate";

env.config();

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    // required:true
  },
  password: {
    type: String,
    // required:true
  },
  googleId: String,
  secret: String,
});

// UserSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ['password'] });
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

const User = mongoose.model("user", UserSchema);

export default User;
