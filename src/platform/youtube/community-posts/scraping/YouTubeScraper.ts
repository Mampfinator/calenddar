import axios from "axios";
import {last} from "ts-prime";
export type ytInitialData = Record<string, any>;

const findValuesByKeys = (object: Record<string, any>, keys: string[]): any[] => {
    const values: any[] = [];
    const seenObjects = new WeakSet();
    const find = (object: Record<string, any>, keys: string[]) => {
        Object.keys(object).some((k) => {
            if (keys.includes(k)) values.push(object[k]);
            if (object[k] && !seenObjects.has(object[k]) && typeof object[k] === "object") {
                find(object[k], keys);
                seenObjects.add(object[k]);
            }
        });

        return values;
    }
    return find(object, keys);
}


export class YouTubeScraper {
    private parseYtInitialData(body: string): ytInitialData {
        const regex = /(?<=var ytInitialData \=).*(?=\;<\/script\>)/
        let match: string | RegExpMatchArray = body.match(regex);
        match = match[0] ?? match;
        
        return JSON.parse(match as unknown as string);
    }

    private formatPost(rawPost: Record<string, any>, channelId?: string): CommunityPost {
        const id = rawPost.postId;
        const text = rawPost.contentText.runs?.map(r => r.text).join("");
        const post: CommunityPost = {id, text, channelId};

        const {backstageAttachment} = rawPost;
        if (backstageAttachment) {
            // TODO: find the proper content of backstageMultiImageRenderer and deal with it :dead:
            const {backstageImageRenderer: imageRenderer, pollRenderer, videoRenderer, postMultiImageRenderer: multiImageRenderer} = backstageAttachment;
            
            const type = (imageRenderer ?? multiImageRenderer) ? "image" : (pollRenderer ? "poll" : (videoRenderer ? "video" : null));
            const attachment: CommunityPostAttachment = {type};
            if (!type) console.error(`Could not find type for backstageAttachment! Details: `, backstageAttachment);

            switch(type) {
                case "image":
                    const images = [imageRenderer?.image, ...(multiImageRenderer?.images.map(renderer => renderer.backstageImageRenderer.image) ?? [])].filter(v => v);
                    attachment.images = images.map(image => last<any>(image.thumbnails).url).map(url => `${url.split("=")[0]}=s8000`);
                    break;
                case "poll":
                    attachment.choices = pollRenderer.choices.map(choice => choice.text.runs.map(run => run.text).join(""));
                    break;
                case "video":
                    const id = videoRenderer.videoId;

                    if (!id) {
                        // unarchived streams don't have an ID, so we just return a null-filled video object. 
                        // the client can figure out what to do with it.
                        attachment.video = {
                            id: null,
                            thumbnail: null,
                            title: null,
                            descriptionSnippet: null
                        }
                        break;
                    }

                    const thumbnail = last<any>(videoRenderer.thumbnail.thumbnails).url;
                    const title = videoRenderer.title.runs?.map(run => run.text).join("") ?? videoRenderer.title.simpletext;
                    const descriptionSnippet = videoRenderer.descriptionSnippet?.runs?.map(run => run.text).join("") ?? videoRenderer.descriptionSnippet.simpleText;

                    attachment.video = {
                        id, 
                        thumbnail,
                        title,
                        descriptionSnippet
                    }
                    break;
            }

            if (attachment.type) post.attachment = attachment;
        }

        return post;
    }

    public async fetchPost(id: string): Promise<CommunityPost> {
        // TODO: find out if there's a convenient way of parsing a channel's ID from initialData.

        const initialData = this.parseYtInitialData(await axios.get(`https://www.youtube.com/post/${id}`, {transformResponse: res => res}).then(res => res.data));
        const posts = findValuesByKeys(initialData, ["backstagePostRenderer"]);

        if (!posts || posts.length === 0) return;
        return this.formatPost(posts[0]);
    }

    public async fetchPosts(channelId: string): Promise<Map<string, CommunityPost>>  {
        const initialData = this.parseYtInitialData(await axios.get(`https://www.youtube.com/channel/${channelId}/community`, {transformResponse: res => res}).then(res => res.data));

        const postRenderers = initialData?.contents?.twoColumnBrowseResultsRenderer.tabs.find(tab =>
            tab.tabRenderer.selected    
        )?.tabRenderer.content.sectionListRenderer.contents[0]?.itemSectionRenderer.contents;

        const rawPosts = findValuesByKeys(postRenderers, ["backstagePostRenderer"]);


        return new Map<string, CommunityPost>(rawPosts.map(rawPost => {
            const post = this.formatPost(rawPost, channelId);
            return [post.id, post];
        }));
    }
}



export interface CommunityPost {
    id: string;
    text: string;
    channelId: string;
    attachment?: CommunityPostAttachment
}

export interface CommunityPostAttachment {
    type: "image" | "poll" | "video";
    images?: string[];
    choices?: string[];
    video?: {
        id: string;
        thumbnail: string;
        title: string;
        descriptionSnippet: string;
    }
}