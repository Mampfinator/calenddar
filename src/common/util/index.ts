// pipes
export { StringToArrayPipe } from './pipes/StringToArrayPipe';
export { ValidateObjectIdPipe } from './pipes/ValidateObjectIdPipe';
export { ValidateObjectIdsPipe } from './pipes/ValidateObjectIdsPipe';

export function isValidDate(date: Date): boolean {
    return !isNaN(date.valueOf());
}

export { DynamicTimer } from './DynamicTimer';
export { RequestBuilder } from './RequestBuilder';

export * as CONSTANTS from './constants';
