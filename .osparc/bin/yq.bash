#!/bin/bash

# Define variables
YQ_IMAGE="mikefarah/yq"
YQ_VERSION="4.12.0"

# Define function to run yq inside container
run_yq() {
    docker run --rm -v "$(pwd):/workdir" "$YQ_IMAGE:$YQ_VERSION" "$@"
}

# Call function with arguments
run_yq "$@"
