const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const jwt = require("jsonwebtoken");

//route for user Signup
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    if (req.body.referedBy) {
      const referrer = await User.findOne({ referCode: req.body.referedBy });
      if (!referrer) {
        throw new Error("Please Check Refer Code!");
      }
      user.points = 5;
      await User.findOneAndUpdate(
        { referCode: req.body.referedBy },
        { $inc: { points: 10 } }
      );
    }
    let referCode = "";
    while (1) {
      referCode =
        req.body.name.slice(0, 5) +
        String(Math.floor(Math.random() * 1000) + 1);

      const tempUser = await User.findOne({ referCode });
      if (!tempUser) {
        break;
      }
    }
    user.referCode = referCode;
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//API for checking all users who signup using referCode
router.get("/users/referCode", async (req, res) => {
  const users = await User.find();
  const referedUsers = [];
  users.map((user) => {
    if (user.referedBy !== "None") {
      referedUsers.push(user);
    }
  });
  res.status(201).send(referedUsers);
});

//API to check points of a user
router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      throw new Error("User not found");
    }
    const points = user.points;
    res.status(200).send({ points });
  } catch (e) {
    res.status(404).send(e);
  }
});

module.exports = router;
