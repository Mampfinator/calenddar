import { Injectable, NestMiddleware } from "@nestjs/common";
import { json, Request } from "express";

@Injectable() 
export class RawBodyMiddleware implements NestMiddleware {
    use(req: Request, res: any, next: () => void) {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });

        req.on("end", () => {
            req["rawBody"] = data;
            next();
        });
    }
}