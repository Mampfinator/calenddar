import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class StringToArrayPipe implements PipeTransform {
    transform(value: string): string[] {
        return value.split(',');
    }
}
