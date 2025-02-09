/**
 * User Routes Module
 * Handles all user-related API endpoints
 */

import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/security';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const router = Router();
const users = new Map<string, User>();

/**
 * Create a new user
 * POST /api/users
 */
router.post('/', apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name and email are required'
      });
    }

    const userId = `user-${Date.now()}`;
    const user: User = {
      id: userId,
      name,
      email,
      role: 'user'
    };

    users.set(userId, user);

    if (process.env.NODE_ENV === 'development') {
      process.stdout.write(`Creating user with sanitized input: ${JSON.stringify({ email, name })}\n`);
    }

    if (req.session) {
      if (process.env.NODE_ENV === 'development') {
        process.stdout.write('Session saved with user data\n');
      }
      req.session.user = {
        userId,
        role: user.role,
        lastAccess: new Date()
      };
    }

    return res.status(201).json(user);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      process.stderr.write(`Error creating user: ${error}\n`);
    }
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create user'
    });
  }
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', apiKeyAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = users.get(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user'
    });
  }
});

/**
 * Update user
 * PUT /api/users/:id
 */
router.put('/:id', apiKeyAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = users.get(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const updatedUser = {
      ...user,
      ...req.body,
      id // Prevent ID modification
    };

    users.set(id, updatedUser);

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update user'
    });
  }
});

/**
 * Delete user
 * DELETE /api/users/:id
 */
router.delete('/:id', apiKeyAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = users.get(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    users.delete(id);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete user'
    });
  }
});

export default router;