export { StringToArrayPipe } from './pipes/StringToArrayPipe';
export { ValidateObjectIdPipe } from './pipes/ValidateObjectIdPipe';
export { ValidateObjectIdsPipe } from './pipes/ValidateObjectIdsPipe';

// TODO: remove? Axios has {params: {[key: string]: string}} options that does virtually the same.
export function buildRequest(url: string, parameters: {[key: string]: string}): string {
    if (!parameters) return url;

    const parameterArray = Object.entries(parameters);
    let [key, value] = parameterArray.shift()
    url += `?${key}=${value}`;

    for ([key, value] of parameterArray) {
        url += `&${key}=${value}`;
    }

    return url;
}

import { appendFile } from 'fs';
import { join } from 'path';

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