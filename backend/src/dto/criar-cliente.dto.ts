import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CriarClienteDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'Todos os campos do cliente são obrigatórios.' })
  nome: string;

  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'Todos os campos do cliente são obrigatórios.' })
  email: string;

  @IsString({ message: 'A cidade deve ser um texto.' })
  @IsNotEmpty({ message: 'Todos os campos do cliente são obrigatórios.' })
  cidade: string;

  @IsString({ message: 'O estado deve ser um texto.' })
  @IsNotEmpty({ message: 'Todos os campos do cliente são obrigatórios.' })
  estado: string;

  @IsString({ message: 'O país deve ser um texto.' })
  @IsNotEmpty({ message: 'Todos os campos do cliente são obrigatórios.' })
  pais: string;
}
