/**
 * Redis Client Configuration
 * Handles Redis connection and lifecycle management
 */

import { createClient } from 'redis';

// Redis client configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
};

// Create Redis client with proper error handling
const redisClient = createClient(redisConfig);

// Error handling
redisClient.on('error', (err) => {
  if (process.env.NODE_ENV === 'development') {
    process.stderr.write(`Redis Client Error: ${err}\n`);
  }
});

// Connection handling
redisClient.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    process.stdout.write('Redis Client Connected\n');
  }
});

redisClient.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    process.stdout.write('Redis Client Ready\n');
  }
});

redisClient.on('end', () => {
  if (process.env.NODE_ENV === 'development') {
    process.stdout.write('Redis Client Connection Ended\n');
  }
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      process.stderr.write(`Redis Connection Error: ${error}\n`);
    }
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await redisClient.quit();
    if (process.env.NODE_ENV === 'development') {
      process.stdout.write('Redis connection closed.\n');
    }
    process.exit(0);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      process.stderr.write(`Error during shutdown: ${error}\n`);
    }
    process.exit(1);
  }
});

export default redisClient;