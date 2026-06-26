import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '../entities/pedido.entity';

export class PedidoItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  cantidad: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsObject()
  personalizaciones?: any;
}

export class CreatePedidoDto {
  @IsOptional()
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @IsInt()
  recursoId?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsString()
  direccionEntrega?: string;

  @IsOptional()
  @IsString()
  userLat?: string;

  @IsOptional()
  @IsString()
  userLng?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    origen?: 'mesa' | 'barra' | 'app' | 'telefono';
    prioridad?: 'normal' | 'alta' | 'urgente';
    canalNotificacion?: 'app' | 'sms' | 'email';
    ubicacionMesa?: string;
    nombreCliente?: string;
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  @IsNotEmpty()
  items: PedidoItemDto[];
}
