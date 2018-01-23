const expect = require('expect');
const request = require('supertest');

var {todoApp} = require('./../server.js');
var {Todo} = require('./../models/todo.js');

const todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Testing creation of todo';

    request(todoApp)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((response) => {
      expect(response.body.text).toBe(text);
    })
    .end((error, response) => {
      if(error){
        return done(error);
      }

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });

  it('should not create a todo with bad data', (done) => {

    request(todoApp)
    .post('/todos')
    .send({})
    .expect(400)
    .end((error, response) => {
      if(error){
        return done(error);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((error) => done(error));
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(todoApp)
    .get('/todos')
    .expect(200)
    .expect((response) => {
      expect(response.body.todos.length).toBe(2);
    })
    .end(done);
  });
});
