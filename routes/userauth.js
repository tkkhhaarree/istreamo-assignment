const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

const indianPhoneNumberRegex = /^\+91[789]\d{9}$/;

// Custom validation function for Indian phone numbers using regex
const isIndianPhoneNumber = (value) => {
   return indianPhoneNumberRegex.test(value);
};

router.post(
   "/signup",
   [
      check("name", "Name is required.").not().isEmpty(),
      check("email", "Please use valid email.").isEmail(),
      check("password", "password not in proper format").matches(
         "^(?=.*[A-Z])(?=.*[0-9a-zA-Z])(?=.*[^0-9a-zA-Z]).{8,}$"
      ),
      check("username", "userame is required.").not().isEmpty(),
      check(
         "mobile",
         "mobile should start with +91 and should be valid indian number."
      ).custom(isIndianPhoneNumber),
      check("profilestatus", "status should be public or private").isIn([
         "public",
         "private",
      ]),
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      const { name, email, password, username, mobile, profilestatus } =
         req.body;
      try {
         let user = await User.findOne({ email });
         if (user) {
            return res
               .status(400)
               .json({ errors: [{ msg: "User email already exists!" }] });
         }

         let user2 = await User.findOne({ username });
         if (user2) {
            return res
               .status(400)
               .json({ errors: [{ msg: "Username already exists!" }] });
         }

         user = new User({
            name,
            email,
            password,
            username,
            mobile,
            profilestatus,
         });

         const salt = await bcrypt.genSalt(10);
         user.password = await bcrypt.hash(password, salt);
         // console.log(user.password);
         await user.save();

         const payload = {
            user: {
               id: user.id,
            },
         };

         jwt.sign(
            payload,
            config.get("jwtSecret"),
            { expiresIn: 36000 },
            (err, token) => {
               if (err) throw err;
               res.json({ token });
            }
         );
      } catch (err) {
         console.error(err.message);
         res.status(500).send("Server error.");
      }
   }
);

router.post(
   "/login",
   [
      check("email", "Please use valid email.").isEmail(),
      check("password", "password not in proper format").matches(
         "^(?=.*[A-Z])(?=.*[0-9a-zA-Z])(?=.*[^0-9a-zA-Z]).{8,}$"
      ),
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors["errors"]);
      }

      const { email, password } = req.body;
      try {
         const user = await User.findOne({ email });
         if (!user) {
            return res
               .status(400)
               .json({ errors: [{ msg: "User does not exists!" }] });
         }
         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
            return res
               .status(400)
               .json({ errors: [{ msg: "invalid credentials." }] });
         }
         const payload = {
            user: {
               id: user.id,
            },
         };
         jwt.sign(
            payload,
            config.get("jwtSecret"),
            { expiresIn: 36000 },
            (err, token) => {
               if (err) throw err;
               res.json({ token, username: user.username });
               //console.log("auth token from login: ", token);
            }
         );
      } catch (err) {
         console.error(err.message);
         res.status(500).send("Server error.");
      }
   }
);

router.get(
   "/userinfo",
   [check("username", "username is required.").not().isEmpty()],
   auth,
   async (req, res) => {
      try {
         let username = req.body.username;
         const user = await User.findOne({ username }).select("-password");
         if (user) {
            res.json({ user });
         } else {
            res.status(500).send("User not found");
         }
      } catch (err2) {
         console.error(err2.message);
         res.status(500).send("Server down.");
      }
   }
);

module.exports = router;
