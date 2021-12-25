import { Logger, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class ProtectedGuard implements CanActivate {
    private readonly logger = new Logger(ProtectedGuard.name);
    constructor(
        private readonly reflector: Reflector,
        private readonly configService: ConfigService
    ) {}
    canActivate(context: ExecutionContext): boolean {
        const isProtected = this.reflector.get<boolean>("protected", context.getHandler());
        const req = context.switchToHttp().getRequest();
        const canExecute = (!isProtected) || (isProtected && this.configService.get<string>("ADMIN_API_KEY") === req.header("apikey"));
        if (isProtected && !canExecute) {
            this.logger.log(
                `Got invalid API key on protected endpoint from ${req.socket.remoteAddress}.`
            );
        }
        return canExecute;  
    }
}