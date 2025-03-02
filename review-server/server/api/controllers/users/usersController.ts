import { Request, Response } from 'express';
import openSearchUsersService, { CreateUserRequest, UpdateUserRequest } from '../../services/opensearchUsers.service';

export class UsersController {
  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await openSearchUsersService.all();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users', details: error });
    }
  }

  // Get a user by ID.
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const user = await openSearchUsersService.byId(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: `User with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user', details: error });
    }
  }

  // Create a new user.
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const user = await openSearchUsersService.create(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user', details: error });
    }
  }

  // Update an existing user.
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const partial: UpdateUserRequest = req.body;
      const updatedUser = await openSearchUsersService.update(id, partial);
      if (!updatedUser) {
        res.status(404).json({ message: `User with id ${id} not found` });
      } else {
        res.status(200).json(updatedUser);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user', details: error });
    }
  }

  // Delete a user.
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await openSearchUsersService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user', details: error });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: "Name is required" });
      } else {
        // Retrieve all users and search for one with a matching name (case-insensitive)
        const users = await openSearchUsersService.all();
        const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
        
        if (existingUser) {
          res.status(200).json(existingUser);
        } else {
          // Generate an email based on the name (you may adjust this logic)
          const email = `${name.replace(/\s+/g, '.').toLowerCase()}@example.com`;
          const newUser: CreateUserRequest = { name, email };
          const createdUser = await openSearchUsersService.create(newUser);
          res.status(201).json(createdUser);
        }
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to login user', details: error });
    }
  }
}

export default new UsersController();
