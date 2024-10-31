import { Body, Controller, Get, Post, Req, Res, ValidationPipe } from '@nestjs/common';
import { SignInDto } from '../dto/sign-in-dto';
import { Response, Request } from 'express';
import { UserService } from '../services/user.service';
import { CatchError } from '../decorators/catchError.decorator';
import { UserPublicInfo } from '../dto/user-public-info';
import { SignUpDto } from '../dto/sign-up-dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('/register')
    @CatchError('user.controller signUp()')
    async signUp(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: SignUpDto, @Res() res: Response): Promise<Response> {
        const signUpStatus = await this.userService.signUp(body.name, body.phone, body.favorite_number, body.password);
        if (!signUpStatus) { return res.status(500).json({ error: 'Sign up failed' }) }
        return res.status(201).json({ response: 'OK' });
    }

    @Post('/auth')
    @CatchError('user.controller signIn()')
    async signIn(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: SignInDto, @Res() res: Response): Promise<Response> {
        const token = await this.userService.signIn(body.phone, body.password);
        if (!token) { return res.status(403).json({ error: 'Incorrect user credentials' }) }
        return res.status(200).json({ response: 'OK', token })
    }

    @Get('/data')
    @CatchError('user.controller getUserData()')
    async getUserData(@Req() req: Request, @Res() res: Response): Promise<Response> {
        // this app is too small to create auth guard so i just added headers verification here
        const token = req.headers.authorization;
        if (!token) { return res.status(401).json({ error: 'Not authorized' }) }
        const info: UserPublicInfo = await this.userService.getUserData(token);
        if (!info) { return res.status(404).json({ error: 'User data not found' }) }
        return res.status(200).json(info);
    }
}
