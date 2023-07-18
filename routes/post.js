const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

router.post(
   "/",
   [
      check("content", "content is required!").not().isEmpty(),
      check("status", "status should be public or private").isIn([
         "public",
         "private",
      ]),
      check("hashtags", "hashtags should be array of strings")
         .isArray({ min: 1 })
         .custom((value) => {
            // Check if each element in the array is a string
            if (value.every((element) => typeof element === "string")) {
               return true;
            } else {
               throw new Error(
                  'Each element in the "tags" array must be a string'
               );
            }
         }),
   ],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { content, status, hashtags } = req.body;
      try {
         const id = req.user.id;

         let postid = Math.floor(Math.random() * (99999 - 10000)).toString();

         let post = new Post({
            content,
            status,
            hashtags,
            author: id,
            postid,
            friends: [],
            likes: [],
         });

         await post.save();

         res.json({ postid, message: "post saved successfully" });
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

router.get(
   "/",
   [check("postid", "post is required!").not().isEmpty()],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { postid } = req.body;
      try {
         let p = await Post.findOne({ postid });

         if (p) {
            res.json({ p, message: "post fetched successfully" });
         } else {
            res.status(500).send("post id does not exist");
         }
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

router.get(
   "/user",
   [check("username", "username is required").not().isEmpty()],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { username } = req.body;
      try {
         let u = await User.findOne({ username });

         if (u) {
            let p = await Post.find({ author: u.id });
            res.json({ p, message: "post fetched successfully" });
         } else {
            res.status(500).send("username does not exist");
         }
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

router.post(
   "/like",
   [check("postid", "postid is required!").not().isEmpty()],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { postid } = req.body;
      try {
         const id = req.user.id;
         let p = await Post.findOne({ postid });

         if (p) {
            let p_likes = p.likes;
            if (p_likes.includes(id)) {
               res.status(500).send({ message: "post already liked" });
            } else {
               p_likes.push(id);
               await p.save();
               res.json({ postid, message: "post liked successfully" });
            }
         } else {
            res.status(500).send({ message: "postid does not exist" });
         }
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

router.post(
   "/comment",
   [
      check("postid", "postid is required!").not().isEmpty(),
      check("comment", "comment is required!").not().isEmpty(),
   ],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { postid, comment } = req.body;
      try {
         const id = req.user.id;
         let p = await Post.findOne({ postid });

         if (p) {
            let p_comments = p.comments;
            p_comments.push({ commenter: id, comment });
            await p.save();
            res.json({ postid, message: "comment added successfully" });
         } else {
            res.status(500).send({ message: "postid does not exist" });
         }
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

router.post(
   "/friendtag",
   [
      check("postid", "postid is required!").not().isEmpty(),
      check("friendid", "friend id is required!").not().isEmpty(),
   ],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { postid, friendid } = req.body;
      try {
         const id = req.user.id;
         let p = await Post.findOne({ postid });

         if (p) {
            p.friends.push(friendid);

            await p.save();
            res.json({ postid, message: "friend tagged successfully" });
         } else {
            res.status(500).send({ message: "postid does not exist" });
         }
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

router.delete(
   "/",
   [check("postid", "postid is required!").not().isEmpty()],
   auth,
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { postid } = req.body;
      try {
         const id = req.user.id;
         let p = await Post.findOne({ postid });

         console.log(p.author + " " + id);
         if (p.author == id) {
            await Post.deleteOne({ postid });
            res.json({ postid, message: "post deleted successfully" });
         } else {
            res.status(500).send({ message: "you are not post author" });
         }
      } catch (err) {
         console.error(err.message);
         res.status(500).send({ error: err.message });
      }
   }
);

module.exports = router;
