require("dotenv").config();
const { insert, read, remove } = require("./utils/database");
const { encrypt, decrypt } = require("./utils/cryptography");
const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");
var cors = require('cors');
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));

app.post("/login", (req, res) => {
  if ("username" in req.body && "password" in req.body) {
    read(process.env.DBNAME, process.env.DBCOLL, {
      username: req.body.username.toLowerCase(),
    })
      .then((result) => {
        if (
          result.length &&
          decrypt(result[0].password) === req.body.password
        ) {
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
  if ("username" in req.body && "password" in req.body && "code" in req.body) {
    read(process.env.DBNAME, process.env.DBCOLL, {
      username: req.body.username.toLowerCase(),
    })
      .then((result) => {
        if (result.length) {
          //User exists
          res.sendStatus(409);
        } else {
          if (
            validateString(req.body.username) &&
            validateString(req.body.password)
          ) {
            validateCode(req.body.code)
              .then((response) => {
                insert(process.env.DBNAME, process.env.DBCOLL, {
                  username: req.body.username.toLowerCase(),
                  password: encrypt(req.body.password),
                });
                //Succsess
                res.sendStatus(200);
              })
              .catch((err) => {
                //Incorrect code
                res.sendStatus(404);
              });
          } else {
            //Invalid details
            res.sendStatus(400);
          }
        }
      })
      .catch((err) => {
        //Invalid request
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    //Invalid request
    res.sendStatus(500);
  }
});

app.post("/generate", (req, res) => {
  if ("code" in req.body && req.body.code === process.env.CODEPASS) {
    const code = generateCode(10);
    insert(process.env.DBNAME, process.env.DBCOLLCODES, {
      code: code,
      valid: true,
    });
    res.status(200).send({code: code});
  } else {
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function generateCode(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function validateCode(code) {
  return new Promise((resolve, reject) => {
    read(process.env.DBNAME, process.env.DBCOLLCODES, { code: code }).then(
      (res) => {
        if (res.length) {
          remove(process.env.DBNAME, process.env.DBCOLLCODES, {
            code: res[0].code,
          });
          resolve(null);
        } else {
          reject("Code doesnt exist");
        }
      }
    );
  });
}

function validateString(str) {
  return /^[A-Za-z0-9!@#$%^&*()_+]*$/.test(str);
}
