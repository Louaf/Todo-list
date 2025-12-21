import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

//register a new user end point /auth/register route
router.post("/register", (req, res) => {
  const { username, password } = req.body;

  //encrypt the password
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(username, password);

  // save the new user and password to the DB
  try {
    const insertUser = db.prepare(`
      INSERT INTO users (username,password)
      VALUES (?,?)
      `);
    const result = insertUser.run(username, hashedPassword);

    // now that we have a user , i want to add thier first todo for them
    const defaultTodo = `Hello :) Add your first todo! `;
    const insertTodo = db.prepare(`
      INSERT INTO todos (user_id,task)
      VALUES (?,?)
      `);
    insertTodo.run(result.lastInsertRowid, defaultTodo);

    // Create a token

    const token = jwt.sign(
      { id: result.lastInsertRowid },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.json({ token });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(503);
  }
});
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    const getUser = db.prepare(`
      SELECT * FROM users WHERE username = ? 
      `);
    const user = getUser.get(username);
    //unmatched email or username
    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    // unmatched password
    if (!passwordIsValid) {
      return res.status(401).send({ message: "invalid password! " });
    }
    // console.log(user);
    //successful authentecation
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (err) {
    console.log(err.message);
    res.sendStatus(503);
  }
});

export default router;
