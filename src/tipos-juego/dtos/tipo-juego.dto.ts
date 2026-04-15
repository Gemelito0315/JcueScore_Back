import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTipoJuegoDto {
    @ApiProperty({ example: 'billar' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Juego de billar con mesas profesionales', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateTipoJuegoDto extends PartialType(CreateTipoJuegoDto) {}
