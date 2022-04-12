var MongoClient = require("mongodb").MongoClient;
var url = process.env.dburl;

const insert = (dbName, coll, item) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    dbo.collection(coll).insertOne(item, function (err, res) {
      if (err) throw err;
      console.log("Document inserted");
      db.close();
    });
  });
};

const read = (dbName, coll, query) => {
  return new Promise((resolve) => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo
        .collection(coll)
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err;
          db.close();
          resolve(result)
        });
    });
  });
};

module.exports = {
  insert,
  read,
};
