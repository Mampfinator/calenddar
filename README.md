<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Built with Nest - A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Calenddar
A realtime (WebSocket & Webhook), RESTful & GraphQL multi-platform VTuber API. A running version can be found over at https://api.calenddar.de.

## TODO:
  - ~~implement proper authentication mechanism for protected endpoints (adding/removing/updating VTubers, ...)~~
  - ~~finish platform integration for Twitch & YouTube properly~~
  - ~~finish WebEvents implementation for platform events (also come up with proper way of fitting them into a uniform schema)~~
  - add Twitcasting & Twitter Space support, potentially Niconico & Bilibili as well
  - ~~add YouTube community posts~~
  
## Platform Support
Twitch: 
  - Basic functionality ???
  - Realtime API ???
  - REST API ??? (well, somewhat)
  - GraphQL API ??? (integrated in `streams` API)

YouTube:
  - Basic functionality ???
  - Realtime API ??? 
  - REST API ??? (/post(s) for an actual YouTube Community POST API)
  - GraphQL API ??? (integrated in `streams` API)

Twitcasting:
Twitter Spaces:
  - in planning :PolFade:

## REST API Coverage
For a detailed look at the REST API, either check the source or [read the guide](./guides/REST.md).

Bad & largely undocumented.

## GraphQL
Check the [Playground](https://api.calenddar.de/graphql) for documentation, or use a GraphQL introspection tool of your choice!
