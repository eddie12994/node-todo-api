const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('../server/models/user.js');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// Todo.findOneAndRemove({_id: '5a67e1fd90998e0b1b05b939'}).then((todo) => {
//   console.log(todo);
// });

Todo.findByIdAndRemove('5a67e1fd90998e0b1b05b939').then((todo) => {
  console.log(todo);
});
