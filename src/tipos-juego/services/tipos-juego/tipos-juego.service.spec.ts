import { Test, TestingModule } from '@nestjs/testing';
import { TiposJuegoService } from './tipos-juego.service';

describe('TiposJuegoService', () => {
  let service: TiposJuegoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposJuegoService],
    }).compile();

    service = module.get<TiposJuegoService>(TiposJuegoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
