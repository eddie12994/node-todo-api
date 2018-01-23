const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('../server/models/user.js');

var id = '5a66b6dfce51905680d326e8';

if(!ObjectID.isValid(id)){
  console.log('ID not valid');
}

Todo.find({
  _id: id
}).then((todos) => {
  console.log('Todos', todos);
});

Todo.findOne({
  _id: id
}).then((todo) => {
  console.log('Todo', todo);
});

Todo.findById(id).then((todo) => {
  if(!todo){
    return console.log('ID not found');
  }
  console.log('Todo by ID', todo);
}).catch((error) => {
  console.log(error);
});

User.findById('5a6389c79778d853fc35902b').then((user) => {
  if(!user){
    return console.log('User not found');
  }

  console.log('User ID', user);
}, (error) => console.log(error));
