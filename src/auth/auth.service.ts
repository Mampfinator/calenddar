import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    validateApiKey(apiKey: string) {
        return typeof apiKey === 'string';
    }
}
