#!/usr/bin/env bash

version=$1

# 替换 -alpha 为空字符串
metadata=${version//-alpha/}

export EXTENSION_RELEASE_VERSION=$metadata
export EXTENSION_VERSION=$version

npm run build

npx crx pack ./dist -o ./archives/cookie-sharer-"$version".crx -p ./cookie-sharer.pem
