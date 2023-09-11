# Instructions to setup an alias for `psql` to run it from docker container

[Provisioning Instructions](./provisioning.md)

## Requirements

- [Docker Engine CE](https://docs.docker.com/engine/install/#server) 19.03 or newer
- [Docker Compose](https://docs.docker.com/compose/install/) 1.22 or newer
-

## Preparing docker images

1. Create Dockerfile for psql client (in an isolated folder)

```
FROM alpine:latest
RUN apk --update add postgresql-client

ENTRYPOINT ["psql"]
```

2. Create psql docker image (in the same folder)

```sh
docker build -t psql .
```

3. Add an alias into our ~/.bash_profile

Place this line into your .bash_profile

```sh
alias psql='docker run --rm -it psql'
```

4. Restart your terminal

5. Test it by running this:

```sh
psql --help
```
