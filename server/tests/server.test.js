const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {todoApp} = require('./../server.js');
const {Todo} = require('./../models/todo.js');
const {User} = require('./../models/user.js');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    var text = 'Testing creation of todo';

    request(todoApp)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
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
    .set('x-auth', users[0].tokens[0].token)
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
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((response) => {
      expect(response.body.todos.length).toBe(1);
    })
    .end(done);
  });
});

describe('GET /todos/:id' , () => {
  it('should get the todo doc', (done) => {
    request(todoApp)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((response) => {
      expect(response.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should not return a todo doc created by other user', (done) => {
    request(todoApp)
    .get(`/todos/${todos[1]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return a 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(todoApp)
    .get(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return a 404 for non-object ids', (done) => {
    request(todoApp)
    .get(`/todos/1425`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  })
});

describe('DELETE /todos/:id', () => {

  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(todoApp)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
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

  it('should not remove a todo created by other user', (done) => {
    var hexId = todos[0]._id.toHexString();

    request(todoApp)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end((error, response) => {
      if(error){
        return done(error);
      }

      Todo.findById(hexId).then((todo) => {
        expect(todo).toNotBe(null);
        done();
      }).catch((error) => done(error));
    });
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(todoApp)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object ID is invalid', (done) => {
    request(todoApp)
    .delete('/todos/123df3c')
    .set('x-auth', users[1].tokens[0].token)
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
    .set('x-auth', users[0].tokens[0].token)
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

  it('should not update the todo created by another user', (done) => {
    var id = todos[0]._id;
    var text = 'Some new text';

    request(todoApp)
    .patch(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[1].tokens[0].token)
    .send({
      completed: true,
      text: text
    })
    .expect(404)
    .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var id = todos[1]._id;
    var text = 'Some other new text'

    request(todoApp)
    .patch(`/todos/${todos[1]._id.toHexString()}`)
    .set('x-auth', users[1].tokens[0].token)
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

describe('GET /users/me', () => {
  it('should return a user if authenticated', (done) => {
    request(todoApp)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((response) => {
        expect(response.body._id).toBe(users[0]._id.toHexString());
        expect(response.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(todoApp)
      .get('/users/me')
      .expect(401)
      .expect((response) => {
        expect(response.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = 'somepassword';

    request(todoApp)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-auth']).toExist();
        expect(response.body._id).toExist();
        expect(response.body.email).toBe(email);
      })
      .end((error) => {
        if(error){
          return done(error);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((error) => done(error));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    var email = 'bad_email';
    var password = '';

    request(todoApp)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email taken', (done) => {
    var email = 'eamoros12@gmail.com';
    var password = 'agoodpassword';

    request(todoApp)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(todoApp)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-auth']).toExist();
      })
      .end((error, response) => {
        if(error){
          return done(error);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: response.headers['x-auth']
          });
          done();
        }).catch((error) => done(error));
      });
  });

  it('should reject invalid login', (done) => {
    request(todoApp)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'badpass'
      })
      .expect(400)
      .expect((response) => {
        expect(response.headers['x-auth']).toNotExist();
      })
      .end((error, response) => {
        if(error){
          return done(error);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((error) => done(error));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(todoApp)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((error, response) => {
        if(error){
          return done(error);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((error) => done(error));
      });
  });
});
