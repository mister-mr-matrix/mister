# Mister - Matrix Registration

Mister is a tool designed for administrators of Matrix servers. It allows them to generate one-time tokens and links for users to register on the admin's Matrix server using the Matrix Registration API V3. The application utilizes Redis for token and session storage, but can also be configured to use an in-memory database (note that the data will not persist when the app is restarted if using the in-memory option).

## Features

- Generate one-time tokens for Matrix registration
- Easily share registration links with users
- Flexible configuration options for token expiry and session inactivity
- Supports Redis for persistent storage or in-memory for testing

## Environment Variables

You need to set the following environment variables for the app to work:

| Variable                        | Description                                                            | Example                            | Default Value        |
| ------------------------------- | ---------------------------------------------------------------------- | ---------------------------------- | -------------------- |
| `MR_FRONTEND_URL`               | The URL pointing to this server, used for sharing the generated links. | `http://localhost:5173`            | N/A                  |
| `MR_ADMIN_TOKEN`                | Secret admin token for authentication.                                 | `averylongtokenwithatleast32chars` | N/A                  |
| `MR_MATRIX_HOMESERVER`          | The name of the Matrix server (domain part of usernames).              | `example.org`                      | N/A                  |
| `MR_MATRIX_HOMESERVER_URL`      | Actual URL of your Matrix homeserver.                                  | `https://matrix.example.org`       | N/A                  |
| `MR_MATRIX_REGISTRATION_TOKEN`  | Registration token for Matrix API v3.                                  | `YOUR_MATRIX_REGISTRATION_TOKEN`   | N/A                  |
| `MR_SESSION_INACTIVITY_TIMEOUT` | Session inactivity timeout in minutes.                                 | `5`                                | `5`                  |
| `MR_DATABASE_DRIVER`            | The database driver to use: `memory` or `redis`.                       | `redis`                            | `memory`             |
| `MR_DATABASE_REDIS_HOST`        | Redis host.                                                            | `localhost`                        | `localhost`          |
| `MR_DATABASE_REDIS_PORT`        | Redis port.                                                            | `6379`                             | `6379`               |
| `MR_DATABASE_REDIS_USERNAME`    | Redis username.                                                        | `default`                          | `default`            |
| `MR_DATABASE_REDIS_PASSWORD`    | Redis password.                                                        | `password123`                      | `""` (empty string)  |
| `MR_DATABASE_REDIS_DB`          | Redis database number.                                                 | `0`                                | `0`                  |
| `MR_TOKEN_MAXIMUM_ACTIVE`       | Maximum number of active tokens that can be generated at once.         | `1000`                             | `1000`               |
| `MR_TOKEN_EXPIRY_OPTIONS`       | Comma-separated list of valid token expiry options.                    | `1h,6h,12h,1d,3d,1w`               | `1h,6h,12h,1d,3d,1w` |

## Redis Configuration

If you're using Redis for storage, make sure Redis is running and accessible via the configured host and port. The default is `localhost:6379`.

To run Redis locally, you can use Docker:

```bash
docker run --rm -p 6379:6379 docker.io/valkey/valkey:latest
```

Or Podman:

```bash
podman run --rm -p 6379:6379 docker.io/valkey/valkey:latest
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
