// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

// var user = {name: 'Edward', age: 31};
// var {name} = user;
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {
  if(error){
    return console.log("Unable to connect to MongoDB server.");
  }
  console.log('Connected to MongoDB server.');

  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false
  }, (error, result) => {
    if(error){
      return console.log('Unable to insert todo', error);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  db.collection('Users').insertOne({
    // _id: 1234,
    name: 'Edward',
    age: 32,
    location: 'Miami'
  }, (error, result) => {
    if(error){
      return console.log('Unable to insert user', error);
    }

    console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  });

  db.close();
});
