import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { DemoDataService } from './seed/demo-data';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aumentar límite para imágenes base64
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = new DocumentBuilder()
    .setTitle('JcueScore API')
    .setDescription('JcueScore - Plataforma de gestión y competencia para billares')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Crear datos de demo para presentación (comentado temporalmente para login)
  // const demoDataService = app.get(DemoDataService);
  // await demoDataService.createDemoData();

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 JcueScore API corriendo en http://localhost:3000');
  console.log('📚 Documentación Swagger: http://localhost:3000/docs');
  console.log('🎱 Datos de demo creados exitosamente');
}
bootstrap();
