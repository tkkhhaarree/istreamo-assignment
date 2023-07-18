const mongoose = require("mongoose");

const connectDB = async () => {
   try {
      await mongoose.connect(
         "mongodb+srv://tk1234:9560349048@cluster0.oywjcm3.mongodb.net/?retryWrites=true&w=majority",
         { useNewUrlParser: true }
      );
      console.log("MongoDB connected...");
   } catch (err) {
      console.error(err.message);
      process.exit(1);
   }
};

module.exports = connectDB;
