import express from 'express';
import UsersController from './usersController';
export default express
  .Router()
  .get('/', UsersController.getAllUsers.bind(UsersController))
  .get('/:id', UsersController.getUser.bind(UsersController))
  .post('/', UsersController.createUser.bind(UsersController))
  .put('/:id', UsersController.updateUser.bind(UsersController))
  .delete('/:id', UsersController.deleteUser.bind(UsersController))
  .post('/login', UsersController.loginUser.bind(UsersController))
  