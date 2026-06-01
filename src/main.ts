import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { DemoDataService } from './seed/demo-data';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Registrar adaptador de websockets
  app.useWebSocketAdapter(new WsAdapter(app));

  // Aplicar cabeceras de seguridad Helmet con configuraciones flexibles para desarrollo / Swagger
  app.use(
    helmet({
      contentSecurityPolicy: false, // Permitir Swagger UI sin bloqueos de CSP
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Registrar filtro global de excepciones para evitar filtrado de información
  app.useGlobalFilters(new HttpExceptionFilter());

  // Aumentar límite para imágenes base64
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = new DocumentBuilder()
    .setTitle('JcueScore API')
    .setDescription(
      'JcueScore - Plataforma de gestión y competencia para billares',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Crear datos de demo para presentación si está habilitado
  if (process.env.SEED_ON_START === 'true') {
    const demoDataService = app.get(DemoDataService);
    await demoDataService.createDemoData();
    console.log('🎱 Datos de demo creados exitosamente');
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 JcueScore API corriendo en http://localhost:3000');
  console.log('📚 Documentación Swagger: http://localhost:3000/docs');
}
bootstrap();
