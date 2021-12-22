import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private authService: AuthService) {
        super(
            {
                header: 'Api-Key',
                prefix: '',
            },
            true,
            async (apiKey, done: (success: boolean) => void, req) => {
                const checkKey: boolean = await authService.validateApiKey(
                    apiKey,
                );
                if (!checkKey) return done(false);
                return done(true);
            },
        );
    }
}
