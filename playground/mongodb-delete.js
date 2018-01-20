const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, db) => {
  if(error){
    return console.log("Unable to connect to MongoDB server.");
  }
  console.log('Connected to MongoDB server.');

  // db.collection('Todos').deleteMany({text: 'Do taxes'}).then((result) => {
  //   console.log(result);
  // });

  // db.collection('Todos').deleteOne({text: 'Do taxes'}).then((result) => {
  //   console.log(result);
  // });

  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result);
  // });

  // db.collection('Users').deleteMany({name: 'Edward'}).then((result) => {
  //   console.log(result);
  // });

  db.collection('Users').findOneAndDelete({_id: new ObjectID('5a63708d5c009f50e488b132')}).then((result) => {
    console.log(result);
  });

  // db.close();
});
