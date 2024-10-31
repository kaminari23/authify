import { IsString } from "class-validator";

export class SignInDto {
    
    @IsString()
    phone: string;

    @IsString()
    password: string;
}
