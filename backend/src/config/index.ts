import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import bullConfig from './bull.config';
import securityConfig from './security.config';

export default [
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  bullConfig,
  securityConfig,
];