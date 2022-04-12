require("dotenv").config();
const { insert, read } = require("./utils/database");
const { encrypt, decrypt } = require("./utils/cryptography");

read(process.env.dbName, process.env.dbColl, { username: "encrypted" }).then(
  (result) => console.log(decrypt(result[0].password))
);
