// TODO: Actually implement properly. For now, letting the guard check a pregenerated random key is *probably* fine.

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './apiKey.strategy';

@Module({})
export class AuthModule {}
