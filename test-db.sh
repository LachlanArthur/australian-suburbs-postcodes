#!/usr/bin/env bash
docker run --rm -d -p 32771:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=australia -e MYSQL_USER=user -e MYSQL_PASSWORD=secret mysql:8.4
