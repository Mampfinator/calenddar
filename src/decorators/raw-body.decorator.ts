import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RawBody = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const req: Request = context.switchToHttp().getRequest();
        const rawBody = req['rawBody'];

        if (!rawBody || typeof rawBody !== 'string')
            throw new TypeError(
                `Expected rawBody to be of type string, received ${typeof rawBody}. Are you sure the RawBodyMiddleware is being applied to ${
                    req.path
                }?`,
            );

        return rawBody;
    },
);
