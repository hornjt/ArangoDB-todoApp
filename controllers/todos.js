'use strict';
var _ = require('underscore');
var joi = require('joi');
var Foxx = require('org/arangodb/foxx');
var ArangoError = require('org/arangodb').ArangoError;
var Todos = require('../repositories/todos');
var Todo = require('../models/todo');
var controller = new Foxx.Controller(applicationContext);

var todoIdSchema = joi.string().required()
.description('The id of the todo')
.meta({allowMultiple: false});

var todos = new Todos(
  applicationContext.collection('todos'),
  {model: Todo}
);

/** Lists of all todos.
 *
 * This function simply returns the list of all Todo.
 */
controller.get('/', function (req, res) {
  res.json(_.map(todos.all(), function (model) {
    return model.forClient();
  }));
});

/** Creates a new todo.
 *
 * Creates a new todo. The information has to be in the
 * requestBody.
 */
controller.post('/', function (req, res) {
  var todo = req.parameters.todo;
  res.json(todos.save(todo).forClient());
})
.bodyParam('todo', {
  description: 'The todo you want to create',
  type: Todo
});

/** Reads a todo.
 *
 * Reads a todo.
 */
controller.get('/:id', function (req, res) {
  var id = req.urlParameters.id;
  res.json(todos.byId(id).forClient());
})
.pathParam('id', todoIdSchema)
.errorResponse(ArangoError, 404, 'The todo could not be found');

/** Replaces a todo.
 *
 * Changes a todo. The information has to be in the
 * requestBody.
 */
controller.put('/:id', function (req, res) {
  var id = req.urlParameters.id;
  var todo = req.parameters.todo;
  res.json(todos.replaceById(id, todo));
})
.pathParam('id', todoIdSchema)
.bodyParam('todo', {
  description: 'The todo you want your old one to be replaced with',
  type: Todo
})
.errorResponse(ArangoError, 404, 'The todo could not be found');

/** Updates a todo.
 *
 * Changes a todo. The information has to be in the
 * requestBody.
 */
controller.patch('/:id', function (req, res) {
  var id = req.urlParameters.id;
  var patchData = req.parameters.patch;
  res.json(todos.updateById(id, patchData));
})
.pathParam('id', todoIdSchema)
.bodyParam('patch', {
  description: 'The patch data you want your todo to be updated with',
  type: joi.object().required()
})
.errorResponse(ArangoError, 404, 'The todo could not be found');

/** Removes a todo.
 *
 * Removes a todo.
 */
controller.delete('/:id', function (req, res) {
  var id = req.urlParameters.id;
  todos.removeById(id);
  res.json({success: true});
})
.pathParam('id', todoIdSchema)
.errorResponse(ArangoError, 404, 'The todo could not be found');
