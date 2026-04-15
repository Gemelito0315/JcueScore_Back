import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateSedeDto {
    @ApiProperty({ example: 'Sede Centro' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Calle 50 #45-30' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 'Medellín', required: false })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({ example: '3001234567' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'centro@ejemplo.com', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: '08:00' })
    @IsString()
    @IsNotEmpty()
    openingTime: string;

    @ApiProperty({ example: '22:00' })
    @IsString()
    @IsNotEmpty()
    closingTime: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateSedeDto extends PartialType(CreateSedeDto) {}
