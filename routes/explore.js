const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

router.get("/latest", auth, async (req, res) => {
   try {
      let p_list;
      let id = req.user.id;
      if (
         req.body.page != null &&
         typeof req.body.page == "number" &&
         req.body.page != 0
      ) {
         console.log(id);
         let page = req.body.page;
         p_list = await Post.find({ status: "public", author: { $ne: id } })
            .sort({
               createdAt: -1,
            })
            .skip(10 * (page - 1))
            .limit(10);
      } else {
         p_list = await Post.find({ status: "public" }).sort({
            createdAt: -1,
         });
      }

      res.json(p_list);
   } catch (err2) {
      console.error(err2.message);
      res.status(500).send("Server down.");
   }
});

router.get("/random", auth, async (req, res) => {
   try {
      let p_count = await Post.find({ status: "public" }).count();
      if (p_count > 0) {
         let rand = Math.floor(Math.random() * p_count);
         let p_rand = await Post.findOne({ status: "public" }).skip(rand);
         if (p_rand) {
            res.json(p_rand);
         } else {
            res.status(500).send("Server down.");
         }
      }
   } catch (err2) {
      console.error(err2.message);
      res.status(500).send("Server down.");
   }
});

module.exports = router;
