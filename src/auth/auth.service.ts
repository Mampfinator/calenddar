import { Injectable } from '@nestjs/common';
import { UserService } from './users.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UserService) {}
    validateApiKey(apiKey: string) {
        return typeof apiKey === 'string';
    }
}
