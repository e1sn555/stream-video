import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import { join } from 'path';
import { NextFunction, Request, Response } from 'express';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Config
  const configService = app.get(ConfigService);

  // Logger
  const logger = new Logger(configService.get<string>('APP_NAME'));

  // Swagger
  if (configService.get<string>('APP_MODE') === 'development') {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('APP_NAME'))
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet.xssFilter());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('trust proxy', 1);

  // Session
  const redisClient = createClient({
    url: configService.get<string>('REDIS_URL'),
  });

  redisClient.on('error', (err) => {
    logger.error(err);
  });

  redisClient.on('connect', () => {
    logger.log('Redis connected');
  });

  await redisClient.connect();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      saveUninitialized: false,
      secret: configService.get<string>('SESSION_SECRET'),
      resave: false,
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url !== '/admin/login') {
      res.locals.layout = 'index';
    }
    next();
  });

  app.use('/admin/*', (req: any, res: any, next: any) => {
    res.locals.user = req.session.user;
    next();
  });

  // CORS
  await app.listen(configService.get<number>('APP_PORT'), () => {
    logger.log(
      `Server running on port ${configService.get<number>('APP_PORT')}`,
    );
  });
}
bootstrap();
