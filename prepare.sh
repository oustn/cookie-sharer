#!/usr/bin/env bash

version=$1

# 替换 -alpha 为空字符串
metadata=${version//-alpha/}

export COOKIE_RELEASE_VERSION=$metadata
export COOKIE_VERSION=$version

npm run build
