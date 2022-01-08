import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdsPipe
    implements PipeTransform<string[], string[]>
{
    transform(objectIds: string[]): string[] {
        if (!objectIds || objectIds.length == 0) return objectIds;
        const isValid = objectIds
            .map((id) => Types.ObjectId.isValid(id))
            .reduce((acc, cur) => acc && cur);
        if (!isValid) throw new BadRequestException(`Invalid ID(s).`);
        return objectIds;
    }
}
