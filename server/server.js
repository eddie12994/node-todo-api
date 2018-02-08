require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate.js');

var todoApp = express();
var port = process.env.PORT;

todoApp.use(bodyParser.json());

todoApp.post('/todos', authenticate, (request, response) => {
  // console.log(request.body);
  var todo = new Todo({
    text: request.body.text,
    _creator: request.user._id
  });

  todo.save().then((doc) => {
    response.send(doc);
  }, (err) => {
    response.status(400).send(err);
  });
});

todoApp.get('/todos', authenticate, (request, response) => {
  Todo.find({
    _creator: request.user._id
  }).then((todos) => {
    response.send({todos});
  }, (error) => {
    response.status(400).send(error);
  });
});

todoApp.get('/todos/:id', authenticate, (request, response) => {
  // response.send(request.params);
  var id = request.params.id;

  if(!ObjectID.isValid(id)){
    return response.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: request.user._id
  }).then((todo) => {
    if(!todo){
      return response.status(404).send();
    }

    response.send({todo});
  }, (error) => {
    response.status(400).send();
  });
});

todoApp.delete('/todos/:id', authenticate, (request, response) => {
  var id = request.params.id;

  if(!ObjectID.isValid(id)){
    return response.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: request.user._id
  }).then((todo) => {
    if(!todo){
      return response.status(404).send();
    }

    response.status(200).send({todo: todo});
  }, (error) => {
    response.status(400).send();
  });
});

todoApp.patch('/todos/:id', authenticate, (request, response) => {
  var id = request.params.id;
  var body = _.pick(request.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    response.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  } else{
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: request.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if(!todo){
      return response.status(404).send();
    }

    response.send({todo: todo});
  }).catch((error) => {
    response.status(400).send();
  });
});

todoApp.post('/users', (request, response) => {
  var body = _.pick(request.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    // response.send(user);
    return user.generateAuthToken();
  }).then((token) => {
    response.header('x-auth', token).send(user);
  }).catch((error) => {
    response.status(400).send();
  });

});

todoApp.get('/users/me', authenticate, (request, response) => {
  response.send(request.user);
});

todoApp.post('/users/login', (request, response) => {
  var body = _.pick(request.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    // response.send(user);
    return user.generateAuthToken().then((token) => {
      response.header('x-auth', token).send(user);
    });
  }).catch((error) => {
    response.status(400).send();
  });
  // response.send(body);
});

todoApp.delete('/users/me/token', authenticate, (request, response) => {
  request.user.removeToken(request.token).then(() => {
    response.status(200).send();
  }, () => {
    response.status(400).send();
  });
});

todoApp.listen(port, () => {
  console.log(`Started server on ${port}`);
});

module.exports = {todoApp};
