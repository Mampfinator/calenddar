import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import Parser from 'rss-parser';

const logger = new Logger('@XML');

export const XML = createParamDecorator(
    async (data: Record<string, any>, context: ExecutionContext) => {
        const req: Request = context.switchToHttp().getRequest();
        const rawBody = req['rawBody'];
        if (!rawBody)
            throw new TypeError(`rawBody not present on req on ${req.path}!`);
        const parser = data ? new Parser(data) : new Parser();

        try {
            return await parser.parseString(rawBody);
        } catch (e) {
            // ignore invalid fields
            if (!(e instanceof TypeError)) throw e;
            else
                logger.warn(
                    `Could not parse XML body on request to ${req.path}.`,
                );
        }
    },
);
