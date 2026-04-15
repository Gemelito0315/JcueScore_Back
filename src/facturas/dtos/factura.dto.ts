import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class CreateFacturaDto {
    @ApiProperty({ example: 'FAC-001' })
    @IsString()
    @IsNotEmpty()
    invoiceNumber: string;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    customerId?: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    venueId: number;

    @ApiProperty({ example: '2026-03-20' })
    @IsDateString()
    @IsNotEmpty()
    issueDate: string;

    @ApiProperty({ example: 50000 })
    @IsNumber()
    @IsNotEmpty()
    total: number;

    @ApiProperty({ example: 'draft', enum: ['draft', 'issued', 'paid', 'cancelled'], required: false })
    @IsEnum(['draft', 'issued', 'paid', 'cancelled'])
    @IsOptional()
    status?: string;

    @ApiProperty({ example: 'Factura de reserva', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateFacturaDto extends PartialType(CreateFacturaDto) {}
