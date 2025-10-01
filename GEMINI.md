# Project Overview

This project is a real-time search engine for a collection of Mastodon instances. It listens to public timelines, indexes the posts, and provides a web interface for searching and browsing. The project is built with Node.js and uses MongoDB for the database. It also uses a large language model (LLM) to categorize posts.

## Key Technologies

*   **Backend:** Node.js, Express
*   **Database:** MongoDB
*   **Frontend:** Mustache
*   **Containerization:** Docker

## Architecture

The application is composed of two main services:

*   `masto-kukei-web`: The main web application that serves the frontend and the search API.
*   `masto-kukei-llm`: A service that uses a large language model to categorize posts.

The services are defined in the `docker-compose.yml` file. The web application listens to the public timelines of the configured Mastodon instances, indexes the posts in a MongoDB database, and provides a web interface for searching and browsing. The LLM service is used to categorize the posts.

# Building and Running

## Prerequisites

*   Node.js
*   Yarn
*   Docker
*   Docker Compose

## Development

To run the application in development mode, use the following command:

```bash
yarn dev
```

This will start the server with `nodemon`, which will automatically restart the server when you make changes to the code.

## Production

To build and run the application in production, use the following commands:

```bash
yarn build
docker-compose up -d
```

The `yarn build` command will install the production dependencies and run the `make:hash` script. The `docker-compose up -d` command will start the `masto-kukei-web` and `masto-kukei-llm` services in detached mode.

## Testing

To run the tests, use the following command:

```bash
yarn test
```

# Development Conventions

## Linting

This project uses ESLint for linting. To run the linter, use the following command:

```bash
yarn lint
```

## Code Style

The project uses the `eslint-config-minimal-tabs` ESLint configuration, which enforces a minimal, tab-based code style.

## Commits

The project does not have a formal commit message convention, but the commit messages are generally short and descriptive.
