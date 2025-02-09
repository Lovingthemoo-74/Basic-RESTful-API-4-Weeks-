import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System health and status endpoints
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the API's current status and developer information
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 developer:
 *                   type: object
 *                   properties:
 *                     github:
 *                       type: string
 *                       example: https://github.com/Lovingthemoo-74
 *                     contact:
 *                       type: string
 *                       example: lovingthemoo@gmail.com
 */
router.get('/', (_req, res) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    developer: {
      github: 'https://github.com/Lovingthemoo-74',
      contact: 'lovingthemoo@gmail.com'
    }
  });
});

/**
 * @swagger
 * /api/health/error-test:
 *   get:
 *     summary: Test error handling
 *     description: Endpoint that always throws an error for testing error handling
 *     tags: [System]
 *     responses:
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 *                 message:
 *                   type: string
 *                   example: An unexpected error occurred
 */
router.get('/error-test', (_req, _res) => {
  throw new Error('Test internal server error');
});

export default router;