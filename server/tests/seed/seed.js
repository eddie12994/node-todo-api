const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const {ObjectID} = require('mongodb');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];


(done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
}

module.exports ={};
