import { ModulesGuard } from './modules.guard.guard';
import { Reflector } from '@nestjs/core';

describe('ModulesGuardGuard', () => {
  it('should be defined', () => {
    const mockReflector = {
      get: jest.fn(),
    } as unknown as Reflector;
    expect(new ModulesGuard(mockReflector)).toBeDefined();
  });
});
