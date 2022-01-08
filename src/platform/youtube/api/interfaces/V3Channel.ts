export interface YouTubeV3Channel {
    kind: 'youtube#channel';
    etag: string;
    id: string;
    snippet?: {
        title: string;
        description: string;
        customUrl: string;
        publishedAt: string;
        thumbnails: {
            [key: string]: {
                url: string;
                width: number;
                height: number;
            };
        };
        defaultLanguage: string;
        localized: {
            title: string;
            description: string;
        };
        country: string;
    };
    contentDetails?: {
        relatedPlaylists: {
            likes: string;
            favorites: string;
            uploads: string;
        };
    };
    statistics?: {
        viewCount: number;
        subscriberCount: number; // this value is rounded to three significant figures
        hiddenSubscriberCount: boolean;
        videoCount: number;
    };
    topicDetails?: {
        topicIds: string[];
        topicCategories: string[];
    };
    status?: {
        privacyStatus: string;
        isLinked: boolean;
        longUploadsStatus: string;
        madeForKids: boolean;
        selfDeclaredMadeForKids: boolean;
    };
    brandingSettings?: {
        channel: {
            title: string;
            description: string;
            keywords: string;
            trackingAnalyticsAccountId: string;
            moderateComments: boolean;
            unsubscribedTrailer: string;
            defaultLanguage: string;
            country: string;
        };
        watch?: {
            textColor: string;
            backgroundColor: string;
            featuredPlaylistId: string;
        };
    };
    auditDetails?: {
        overallGoodStanding: boolean;
        communityGuidelinesGoodStanding: boolean;
        copyrightStrikesGoodStanding: boolean;
        contentIdClaimsGoodStanding: boolean;
    };
    contentOwnerDetails?: {
        contentOwner: string;
        timeLinked: string;
    };
    localizations?: {
        [key: string]: {
            title: string;
            description: string;
        };
    };
}
