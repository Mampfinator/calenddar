export { StringToArrayPipe } from './pipes/StringToArrayPipe';
export { ValidateObjectIdPipe } from './pipes/ValidateObjectIdPipe';
export { ValidateObjectIdsPipe } from './pipes/ValidateObjectIdsPipe';



import { appendFile } from 'fs';
import { join } from 'path';

// mainly used during development to figure out what exactly is happening request-wise on /youtube/eventsub
export async function _logToFile(content: string, fileName: string, context?: string) {
    await new Promise((res, rej) => {
        content = `[${new Date().toISOString()}]    [${context}]
${content}
--------------------------------------------------------------

`
        appendFile(join(__dirname, `..`, `..`, `logs`, fileName), content, (err) => {
            if (err) return rej();
            return res(true);
        });
    });
}

export function isValidDate(date: Date): boolean {
    return !isNaN(date.valueOf());
}