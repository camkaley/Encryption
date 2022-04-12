require("dotenv").config();
const { insert, read } = require("./utils/database");
const { encrypt, decrypt } = require("./utils/cryptography");
const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/login", (req, res) => {
  if ("username" in req.body && "password" in req.body) {
    read(process.env.DBNAME, process.env.DBCOLL, {
      username: req.body.username.toLowerCase(),
    })
      .then((result) => {
        if (result.length && decrypt(result[0].password) === req.body.password) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(404);
      });
  } else {
    res.sendStatus(500);
  }
});

app.post("/register", (req, res) => {
  if ("username" in req.body && "password" in req.body) {
    read(process.env.DBNAME, process.env.DBCOLL, {
      username: req.body.username.toLowerCase(),
    })
      .then((result) => {
        if (result.length) {
          res.sendStatus(409);
        } else {
          if (
            validateString(req.body.username) &&
            validateString(req.body.password)
          ) {
            insert(process.env.DBNAME, process.env.DBCOLL, {
              username: req.body.username.toLowerCase(),
              password: encrypt(req.body.password),
            });
            res.sendStatus(200);
          } else {
            res.sendStatus(400);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function validateString(str) {
  return /^[A-Za-z0-9!@#$%^&*()_+]*$/.test(str);
}
