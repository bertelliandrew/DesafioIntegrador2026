import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelarAssinaturaDto {
  @IsString({ message: 'Informe um motivo de cancelamento com pelo menos 3 caracteres.' })
  @IsNotEmpty({ message: 'Informe um motivo de cancelamento com pelo menos 3 caracteres.' })
  @MinLength(3, { message: 'Informe um motivo de cancelamento com pelo menos 3 caracteres.' })
  motivoCancelamento: string;
}
