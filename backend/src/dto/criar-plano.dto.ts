import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriarPlanoDto {
  @IsString({ message: 'O nome do plano deve ser um texto.' })
  @IsNotEmpty({ message: 'Nome, descrição, preço mensal, limite e suporte são obrigatórios.' })
  nome: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'Nome, descrição, preço mensal, limite e suporte são obrigatórios.' })
  descricao: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'O preço mensal deve ser maior que zero.' })
  @Min(0.01, { message: 'O preço mensal deve ser maior que zero.' })
  precoMensal: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'O limite de dispositivos deve ser maior que zero.' })
  @Min(1, { message: 'O limite de dispositivos deve ser maior que zero.' })
  limiteDispositivos: number;

  @IsString({ message: 'O suporte deve ser um texto.' })
  @IsNotEmpty({ message: 'Nome, descrição, preço mensal, limite e suporte são obrigatórios.' })
  suporte: string;

  @IsOptional()
  recursos?: string[] | string;
}
