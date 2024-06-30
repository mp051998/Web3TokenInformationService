
## Description

Nest app which can be used to fetch web3 token information while also enforcing rate limitting on the requests by communicating with an access-key-management microservice.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Collection (Thunder Client):

NOTE: This collection is for the local environment. The base URL is set to `http://localhost:3001`. Change the base URL to the deployed URL if you want to use it in a deployed environment.
Can be found [here](./thunder-collection.json)
