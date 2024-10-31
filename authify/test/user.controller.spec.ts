import { Test, TestingModule } from '@nestjs/testing';

import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

import { UserService } from '../src/services/user.service';
import { SignUpDto } from '../src/dto/sign-up-dto';
import { SignInDto } from '../src/dto/sign-in-dto';
import { UserController } from '../src/controllers/user.controller';

describe('UserController', () => {
    let app: INestApplication;
    let userService = {
        signUp: jest.fn(),
        signIn: jest.fn(),
        getUserData: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: userService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/user/register (POST)', () => {
        it('should register a user successfully', async () => {
            userService.signUp.mockResolvedValue(true);
            const signUpDto: SignUpDto = { name: 'Alex', phone: '380123456789', favorite_number: 7, password: 'password' };

            return request(app.getHttpServer())
                .post('/user/register')
                .send(signUpDto)
                .expect(201)
                .expect({ response: 'OK' });
        });

        it('should fail to register a user', async () => {
            userService.signUp.mockResolvedValue(false);
            const signUpDto: SignUpDto = { name: 'Alex', phone: '380123456789', favorite_number: 7, password: 'password' };

            return request(app.getHttpServer())
                .post('/user/register')
                .send(signUpDto)
                .expect(500)
                .expect({ error: 'Sign up failed' });
        });
    });

    describe('/user/auth (POST)', () => {
        it('should authenticate a user successfully', async () => {
            userService.signIn.mockResolvedValue('mockedToken');
            const signInDto: SignInDto = { phone: '380123456789', password: 'password' };

            return request(app.getHttpServer())
                .post('/user/auth')
                .send(signInDto)
                .expect(200)
                .expect({ response: 'OK', token: 'mockedToken' });
        });

        it('should fail to authenticate a user with incorrect credentials', async () => {
            userService.signIn.mockResolvedValue(null);
            const signInDto: SignInDto = { phone: '380123456789', password: 'wrongPassword' };

            return request(app.getHttpServer())
                .post('/user/auth')
                .send(signInDto)
                .expect(403)
                .expect({ error: 'Incorrect user credentials' });
        });
    });

    describe('/user/data (GET)', () => {
        it('should return user data successfully', async () => {
            const token = 'mockedToken';
            userService.getUserData.mockResolvedValue({ name: 'Alex', phone: '380123456789', favorite_number: 7 });

            return request(app.getHttpServer())
                .get('/user/data')
                .set('Authorization', token)
                .expect(200)
                .expect({ name: 'Alex', phone: '380123456789', favorite_number: 7 });
        });

        it('should fail to get user data without token', async () => {
            return request(app.getHttpServer())
                .get('/user/data')
                .expect(401)
                .expect({ error: 'Not authorized' });
        });

        it('should fail to get user data if not found', async () => {
            const token = 'mockedToken';
            userService.getUserData.mockResolvedValue(null);

            return request(app.getHttpServer())
                .get('/user/data')
                .set('Authorization', token)
                .expect(404)
                .expect({ error: 'User data not found' });
        });
    });
});