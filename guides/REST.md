# Calenddar REST API
An in-development version of this API can be found at https://api.calenddar.de/. Please note that it's still very much in development and therefore prone to breaking changes & instability.

## The basics
The API is structured into a handful of different categories of endpoints: VTubers as such, streams and platform specific endpoints (currently YouTube & Twitch). 

### VTubers
`VTuber` resource:
```typescript
{
    "id": string,               // Unique ID of this VTuber
    "name": string,             // The VTuber's English name
    "originalName"?: string,    // The VTuber's name in original/ other common script 
    "youtubeId"?: string,       // the VTuber's YouTube channel ID (no sub-channels as of now)
    "twitchId"?: string,        // the VTuber's Twitch channel ID (no sub-channels)     
    "affiliation": string       // the agency the VTuber is currently part of, or "indie".
}
```

---
```REST
GET /vtubers
```
Returns an array of all `VTuber`s tracked by the system.

---
```REST
GET /vtubers/{id}
```
Returns the `VTuber` with that specific ID. Returns status code 400 if the ID is invalid.

---
```REST
GET /vtubers/live
```
Returns an array of `VTuber`s that are currently live on any platform.

---

### Streams
Streams doesn't have any associated endpoints. However, the `Stream` resource below is shared across all platform-specific stream & video endpoints.

`Stream` resource:
```typescript
{
    "id": string,               // platform-specific stream ID
    "channelId": string,        // platform-specific channel ID
    "platform": string,         // platform identifier ("youtube", "twitch",...)
    "title": string,            // Title
    "status": integer,          // 0 - offline, 1 - live, 2 - upcoming
    "description"?: string,     // stream description (youtube only)
    "startedAt"?: string,       // ISO 8601 string
    "endedAt"?: string,         // ISO 8601 string
    "scheduledFor"?: string     // youtube only, ISO 8601 string
}
```

### YouTube
TODO: actually finish & document

### Twitch

```rest
GET /twitch/live
```
Returns all currently live Twitch streams as an array of `Stream`s. In future versions, this will instead return an array of `VTuber`s with an added `stream` property which will be the current stream.

---
```rest
GET /twitch/{vtuberId}/live
```
Returns
```typescript
{
    "isLive": boolean,
    "stream"?: Stream
}
```
for the VTuber with the given ID.

---
```rest
GET /twitch/{vtuberId}/channel
```
Returns
```typescript
{
    "vtuberId": string,
    "channelId": string | null
}
```