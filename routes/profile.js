const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

router.get(
   "/",
   [check("username", "username is required!").not().isEmpty()],
   auth,
   async (req, res) => {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json(errors["errors"]);
         }
         const { username } = req.body;
         const user = await User.aggregate([
            { $match: { username: username } },
            {
               $project: {
                  followercount: { $size: "$followers" },
                  followingcount: { $size: "$follows" },
                  username: 1,
                  email: 1,
                  name: 1,
                  mobile: 1,
               },
            },
         ]);

         if (user) {
            res.json({ user });
         } else {
            res.status(500).send("User profile not found");
         }
      } catch (err2) {
         console.error(err2.message);
         res.status(500).send("Server down.");
      }
   }
);

router.get(
   "/postlikedby",
   [check("postid", "postid is required!").not().isEmpty()],
   auth,
   async (req, res) => {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json(errors["errors"]);
         }
         const { postid } = req.body;
         const postlikers = await Post.aggregate([
            {
               $match: { postid: postid },
            },
            {
               $lookup: {
                  from: "users",
                  localField: "likes",
                  foreignField: "_id",
                  as: "likedUsers",
               },
            },
            {
               $unwind: "$likedUsers",
            },
            {
               $project: {
                  _id: 0,
                  postid: postid,
                  likedUsernames: "$likedUsers.name",
               },
            },
         ]);

         if (postlikers) {
            res.json({ postlikers });
         } else {
            res.status(500).send("Postid not found");
         }
      } catch (err2) {
         console.error(err2.message);
         res.status(500).send("Server down.");
      }
   }
);

router.get(
   "/postcount",
   [check("username", "username is required!").not().isEmpty()],
   auth,
   async (req, res) => {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json(errors["errors"]);
         }
         const { username } = req.body;

         let user = await User.findOne({ username });
         if (user) {
            let id = user.id;

            let postcount = await Post.find({ author: id }).count();
            res.json({ postcount });
         } else {
            res.status(500).send("User not found.");
         }
      } catch (err2) {
         console.error(err2.message);
         res.status(500).send("Server down.");
      }
   }
);

router.put(
   "/",
   [check("username", "username is required.").not().isEmpty()],
   auth,
   async (req, res) => {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(400).json(errors["errors"]);
         }

         let user = await User.findOne({ username: req.body.username });
         if (user.id == req.user.id) {
            let updateObj = {};

            if (req.body.name) {
               updateObj.name = req.body.name;
            }
            if (req.body.email) {
               updateObj.email = req.body.email;
            }
            if (req.body.mobile) {
               updateObj.mobile = req.body.mobile;
            }

            await User.findOneAndUpdate(
               { username: req.body.username },
               updateObj
            );
            res.send("user profile updated successfully");
         } else {
            res.status(500).send("you are not authorized to change this user");
         }
      } catch (err2) {
         console.error(err2.message);
         res.status(500).send("Server down.");
      }
   }
);

module.exports = router;
