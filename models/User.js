const mongoose = require("mongoose");
// const AutoIncrementFactory = require("mongoose-sequence");
// const AutoIncrement = AutoIncrementFactory(mongoose.connection);

const UserSchema = new mongoose.Schema({
   username: {
      type: String,
      required: true,
      unique: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   name: {
      type: String,
      required: true,
   },
   mobile: {
      type: String,
      required: true,
   },
   profilestatus: {
      type: String,
      required: true,
   },
   follows: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "user",
      },
   ],
   followers: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "user",
      },
   ],
});

// UserSchema.plugin(AutoIncrement);

module.exports = User = mongoose.model("user", UserSchema);
