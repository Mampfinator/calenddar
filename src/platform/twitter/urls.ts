const baseUrl = 'https://api.twitter.com/';
const v2Url = baseUrl + '2/';

export const Users = v2Url + 'users';
export const UserByName = (name: string) => Users + `/by/username/${name}`;

export const Spaces = v2Url + 'spaces';
export const SpacesByCreatorIds = Spaces + `/by/creator_ids`;
