import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string, string> {
    transform(objectId: string): string {
        const isValid = Types.ObjectId.isValid(objectId);
        if (!isValid) throw new BadRequestException(`Invalid ID.`);
        return objectId;
    }
}
