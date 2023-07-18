const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
   {
      postid: {
         type: String,
         required: true,
         unique: true,
      },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "user",
      },
      content: {
         type: String,
         required: true,
      },
      status: {
         type: String,
         required: true,
      },
      hashtags: {
         type: [String],
      },
      friends: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
         },
      ],
      likes: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
         },
      ],
      comments: {
         type: [
            {
               commenter: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "user",
               },
               comment: {
                  type: String,
                  required: true,
               },
            },
         ],
      },
   },
   { timestamps: true }
);

module.exports = Post = mongoose.model("post", PostSchema);
