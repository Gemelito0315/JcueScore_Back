import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsNumber } from 'class-validator';

export class CreateProductoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    venueId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    productTypeId: number;

    @ApiProperty({ example: 'Coca-Cola 350ml' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Bebida gaseosa', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'SKU001' })
    @IsString()
    @IsNotEmpty()
    sku: string;

    @ApiProperty({ example: '7702001234567', required: false })
    @IsString()
    @IsOptional()
    barcode?: string;

    @ApiProperty({ example: 'Coca-Cola', required: false })
    @IsString()
    @IsOptional()
    brand?: string;

    @ApiProperty({ example: '350ml', required: false })
    @IsString()
    @IsOptional()
    presentation?: string;

    @ApiProperty({ example: 3000 })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ example: 1500 })
    @IsNumber()
    @IsNotEmpty()
    cost: number;

    @ApiProperty({ example: 100, required: false })
    @IsInt()
    @IsOptional()
    stock?: number;

    @ApiProperty({ example: 10, required: false })
    @IsInt()
    @IsOptional()
    minStock?: number;

    @ApiProperty({ example: 'unidad', required: false })
    @IsString()
    @IsOptional()
    unit?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: 'https://...', required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;
}

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
