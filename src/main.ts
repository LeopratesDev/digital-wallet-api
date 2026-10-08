import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Digital Wallet API')
    .setDescription('Carteira digital e transferências entre contas')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'idempotency-key', in: 'header' }, 'idempotency-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: unknown, res: { json: (o: object) => void }) =>
    res.json({ status: 'ok' }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
