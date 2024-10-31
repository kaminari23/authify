import { IsNumber, IsString } from "class-validator";

export class SignUpDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsNumber()
    favorite_number: number;

    @IsString()
    password: string;
}
