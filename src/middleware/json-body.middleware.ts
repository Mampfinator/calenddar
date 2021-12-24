import { Injectable, NestMiddleware } from '@nestjs/common';

// ugly solution I had to put in place because express' json parser was not calling next on /twitch/*
// FIXME: find more efficient way to implement
@Injectable()
export class JSONBodyMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const originalBody = req.body;
        try {
            req.body = JSON.parse(req['rawBody']);
        } catch (err) {
            req.body = originalBody;
        }
        next();
    }
}
