import { Test, TestingModule } from '@nestjs/testing';
import { TiposJuegoController } from './tipos-juego.controller';

describe('TiposJuegoController', () => {
  let controller: TiposJuegoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposJuegoController],
    }).compile();

    controller = module.get<TiposJuegoController>(TiposJuegoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
