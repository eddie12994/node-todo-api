var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

var Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

// var newTodo = new Todo({
//   text: 'Cook dinner'
// });

var secondTodo = new Todo({
  text: '   Edit this video    '
  // text: 'Eat lunch',
  // completed: true,
  // completedAt: 1657778956
})

// newTodo.save().then((doc) => {
//   console.log('Saved todo', doc);
// }, (error) => {
//   console.log('Unable save todo');
// });

secondTodo.save().then((doc) => {
  console.log(JSON.stringify(doc, undefined, 2));
}, (error) => {
  console.log('Unable to save todo', error);
});
