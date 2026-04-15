import { Test, TestingModule } from '@nestjs/testing';
import { EquipamientoController } from './equipamiento.controller';

describe('EquipamientoController', () => {
  let controller: EquipamientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipamientoController],
    }).compile();

    controller = module.get<EquipamientoController>(EquipamientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
