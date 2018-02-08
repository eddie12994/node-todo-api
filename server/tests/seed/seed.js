const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo.js');
const {User} = require('../../models/user.js');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneID
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoID
}];

const users = [{
  _id: userOneID,
  email: 'eamoros12@gmail.com',
  password: 'mypassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneID, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
},{
  _id: userTwoID,
  email: 'edwardamoros@icloud.com',
  password: 'mypassword2',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoID, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};
