import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class CriarAssinaturaDto {
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'A assinatura precisa estar vinculada a um cliente.' })
  @Min(1, { message: 'A assinatura precisa estar vinculada a um cliente.' })
  clienteId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'A assinatura precisa ter um plano de firewall.' })
  @Min(1, { message: 'A assinatura precisa ter um plano de firewall.' })
  planoId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'A quantidade de firewalls deve ser maior que zero.' })
  @Min(1, { message: 'A quantidade de firewalls deve ser maior que zero.' })
  quantidadeFirewalls: number;

  @IsOptional()
  @IsIn(['mensal', 'anual'], { message: 'O ciclo deve ser mensal ou anual.' })
  ciclo?: 'mensal' | 'anual';
}
