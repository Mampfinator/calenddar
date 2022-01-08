import axios from 'axios';
import { RequestBuilder } from '../../../common/util/RequestBuilder';

export class YouTubeRequestBuilder extends RequestBuilder {
    setApiKey(key: string) {
        this.addParam('key', key);
        return this;
    }

    setPart(...parts: string[]) {
        this.addParam('part', parts.join(','));
        return this;
    }
}
