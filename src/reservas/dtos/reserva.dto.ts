import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class CreateReservaDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    customerId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    resourceId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    venueId: number;

    @ApiProperty({ example: '2026-03-20' })
    @IsDateString()
    @IsNotEmpty()
    reservationDate: string;

    @ApiProperty({ example: '14:00' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ example: '16:00' })
    @IsString()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty({ example: 'pending', enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'], required: false })
    @IsEnum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
    @IsOptional()
    status?: string;

    @ApiProperty({ example: 30000 })
    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @ApiProperty({ example: 0, required: false })
    @IsNumber()
    @IsOptional()
    paidAmount?: number;

    @ApiProperty({ example: 'pending', enum: ['pending', 'partial', 'paid'], required: false })
    @IsEnum(['pending', 'partial', 'paid'])
    @IsOptional()
    paymentStatus?: string;

    @ApiProperty({ example: 'Reserva para torneo', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateReservaDto extends PartialType(CreateReservaDto) {}
