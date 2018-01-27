const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {todoApp} = require('./../server.js');
var {Todo} = require('./../models/todo.js');

beforeEach();

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

describe('GET /todos/:id' , () => {
  it('should get the todo doc', (done) => {
    request(todoApp)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((response) => {
      expect(response.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should return a 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(todoApp)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('should return a 404 for non-object ids', (done) => {
    request(todoApp)
    .get(`/todos/1425`)
    .expect(404)
    .end(done);
  })
});

describe('DELETE /todos/:id', () => {

  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(todoApp)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((response) => {
      expect(response.body.todo._id).toBe(hexId);
    })
    .end((error, response) => {
      if(error){
        return done(error);
      }

      Todo.findById(hexId).then((todo) => {
        expect(todo).toBe(null);
        done();
      }).catch((error) => done(error));
    });
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(todoApp)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object ID is invalid', (done) => {
    request(todoApp)
    .delete('/todos/123df3c')
    .expect(404)
    .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var id = todos[0]._id;
    var text = 'Some new text';

    request(todoApp)
    .patch(`/todos/${todos[0]._id.toHexString()}`)
    .send({
      completed: true,
      text: text
    })
    .expect(200)
    .expect((response) => {
      expect(response.body.todo.text).toBe(text);
      expect(response.body.todo.completed).toBe(true);
      expect(response.body.todo.completedAt).toBeA('number');
    })
    .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[1]._id;
    var text = 'Some other new text'

    request(todoApp)
    .patch(`/todos/${todos[1]._id.toHexString()}`)
    .send({
      completed: false,
      text: text
    })
    .expect(200)
    .expect((response) => {
      expect(response.body.todo.text).toBe(text);
      expect(response.body.todo.completed).toBe(false);
      expect(response.body.todo.completedAt).toNotExist();
    })
    .end(done);
  });
});
