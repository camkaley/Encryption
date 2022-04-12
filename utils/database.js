const { query } = require("express");

var MongoClient = require("mongodb").MongoClient;
var url = process.env.DBURL;

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
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);
      dbo
        .collection(coll)
        .find(query)
        .toArray(function (err, result) {
          if (err){
            reject(err)
          }
          db.close();
          resolve(result);
        });
    });
  });
};

const remove = (dbName, coll, query) => {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    dbo.collection(coll).deleteOne(query, function(err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();
    });
  });
}

module.exports = {
  insert,
  read,
  remove
};
