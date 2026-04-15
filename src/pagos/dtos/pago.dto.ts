import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreatePagoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    invoiceId: number;

    @ApiProperty({ example: 50000 })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ example: 'cash', enum: ['cash', 'card', 'transfer', 'qr'] })
    @IsEnum(['cash', 'card', 'transfer', 'qr'])
    @IsNotEmpty()
    paymentMethod: string;

    @ApiProperty({ example: '2026-03-20' })
    @IsDateString()
    @IsNotEmpty()
    paymentDate: string;

    @ApiProperty({ example: 'completed', enum: ['pending', 'completed', 'refunded'], required: false })
    @IsEnum(['pending', 'completed', 'refunded'])
    @IsOptional()
    status?: string;
}

export class UpdatePagoDto extends PartialType(CreatePagoDto) {}
