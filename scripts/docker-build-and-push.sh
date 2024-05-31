#!/bin/bash -eu
#set -x
# Usage example: scripts/docker-build-and-push.sh cm-api yosefrow/scalable-shop-cm-api:latest

DOCKER_CONTEXT=$1
REMOTE_IMAGE=$2

main() {
    echo "Generating image for specific architectures..."
    docker buildx build --platform=linux/amd64 -t "$REMOTE_IMAGE" "$DOCKER_CONTEXT"

    echo "Logging in to docker registry..."
    docker login

    echo "Pushing to docker registry..."
    docker push "$REMOTE_IMAGE"
}

main "${@}"
