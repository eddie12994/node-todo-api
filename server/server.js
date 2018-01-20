const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var todoApp = express();

todoApp.use(bodyParser.json());

todoApp.post('/todos', (request, response) => {
  // console.log(request.body);
  var todo = new Todo({
    text: request.body.text
  });

  todo.save().then((doc) => {
    response.send(doc);
  }, (err) => {
    response.status(400).send(err);
  });
});

// todoApp.post('/anotherTodo', (request, response) => {
//   var anotherTodo = new Todo({
//     text: request.body.text
//   });
//
//   todo.save().then((doc) => {
//     response.send(doc);
//   }, (err) => {
//     response.status(400).send(err);
//   });
// });

todoApp.listen(3000, () => {
  console.log('Started server on port 3000');
});
