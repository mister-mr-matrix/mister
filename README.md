# Mister - Matrix Registration

Mister is a tool designed to make registrations on your Matrix server easier to handle. It allows generating one-time tokens and links for users to register on the your Matrix server using the Matrix Registration API V3. The application utilizes Redis for token and session storage, but can also be configured to use an in-memory database (note that the data will not persist when the app is restarted if using the in-memory option). Other database options should be easy to implement so feel free to open an issue with your request.

## Features

- Generate one-time tokens for Matrix registration
- Easily share registration links with users
- Flexible configuration options for token expiry and session inactivity
- Supports Redis for persistent storage or in-memory for testing

## Environment Variables

Variables without default value must be set for the app to work:

| Variable                        | Description                                                            | Example                            | Default Value        |
| ------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| `MR_FRONTEND_URL`               | The URL pointing to this server, used for sharing the generated links. | `http://localhost:5173`            | N/A                  |
| `MR_ADMIN_TOKEN`                | Secret admin token for authentication.                                 | `averylongtokenwithatleast32chars` | N/A                  |
| `MR_MATRIX_HOMESERVER`          | The name of the Matrix server (domain part of usernames).              | `example.org`                      | N/A                  |
| `MR_MATRIX_HOMESERVER_URL`      | Actual URL of your Matrix homeserver.                                  | `https://matrix.example.org`       | N/A                  |
| `MR_MATRIX_REGISTRATION_TOKEN`  | Registration token for Matrix API v3.                                  | `YOUR_MATRIX_REGISTRATION_TOKEN`   | N/A                  |
| `PUBLIC_MR_RANDOM_USERNAME`     | Should username be randomly generated.                                 | `true`                             | `false`              |
| `PUBLIC_MR_RANDOM_PASSWORD`     | Should password be randomly generated.                                 | `true`                             | `false`              |
| `MR_SESSION_INACTIVITY_TIMEOUT` | Session inactivity timeout in minutes.                                 | `5`                                | `5`                  |
| `MR_DATABASE_DRIVER`            | The database driver to use: `memory` or `redis`.                       | `redis`                            | `memory`             |
| `MR_DATABASE_REDIS_HOST`        | Redis host.                                                            | `localhost`                        | `localhost`          |
| `MR_DATABASE_REDIS_PORT`        | Redis port.                                                            | `6379`                             | `6379`               |
| `MR_DATABASE_REDIS_USERNAME`    | Redis username.                                                        | `default`                          | `default`            |
| `MR_DATABASE_REDIS_PASSWORD`    | Redis password.                                                        | `password123`                      | `""` (empty string)  |
| `MR_DATABASE_REDIS_DB`          | Redis database number.                                                 | `0`                                | `0`                  |
| `MR_TOKEN_MAXIMUM_ACTIVE`       | Maximum number of active tokens that can be generated at once.         | `1000`                             | `1000`               |
| `MR_TOKEN_EXPIRY_OPTIONS`       | Comma-separated list of valid token expiry options.                    | `1h,6h,12h,1d,3d,1w`               | `1h,6h,12h,1d,3d,1w` |

## Deployment

You can use the prebuilt docker image hosted on `ghcr.io/mister-mr-matrix/mister`.

Check out the example [`docker-compose.yml`](docker-compose.yml)

## Development Setup

To get started with the Mister project and run a demo Matrix server (which is essentially a dummy API that answers requests used by Mister), follow the steps below:

1. Run the Demo Matrix Server

First, you need to run the demo Matrix server. This server is a simple implementation that will answer requests used by Mister, but is not a full Matrix server. You can run it using the following command:

```bash
MATRIX_REGISTRATION_TOKEN="demo" go run demo/demo.go
```

2. Set Up the Environment

Before you can run Mister, you need to set up your environment variables. First, copy the example .env file with all the values required for Mister to work with the demo Matrix server:

```bash
cp .env.example .env
```

3. Install Dependencies

Next, you need to install the project dependencies using pnpm:

```bash
pnpm i --frozen-lockfile
```

4. Start the Development Server

Now you're ready to start the development server:

```bash
pnpm run dev
```

Mister will be available at `http://localhost:5173`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
