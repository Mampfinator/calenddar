import { Injectable, Logger, NestMiddleware } from "@nestjs/common";


// ugly solution I had to put in place because express' json parser was not calling next on /twitch/*
@Injectable() 
export class JSONBodyMiddleware implements NestMiddleware {
    private readonly logger = new Logger(JSONBodyMiddleware.name);
    
    use(req: any, res: any, next: () => void) {
        const originalBody = req.body;
        try {
            req.body = JSON.parse(req["rawBody"]);
        } catch (err) {
            req.body = originalBody;
            this.logger.log(`Could not parse JSON for ${req.path}: ${err.message}`);
        }

        next();
    }
}