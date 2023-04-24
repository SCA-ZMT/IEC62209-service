
.DEFAULT_GOAL := help
SHELL := /bin/bash

REPO_DIR := $(abspath $(CURDIR)/..)


.PHONY: info
info:
	printenv | sort

.PHONY: compose
compose: ## creates docker-compose.yml
	cd $(REPO_DIR) \
	&& .osparc/bin/ooil.bash compose -f .osparc/docker-compose.yml


.PHONY: build
build: ## builds image
	docker compose build


IMAGES=$(shell yq eval '.services.*.image' docker-compose.yml)
export REGISTRY ?= registry:5000

.PHONY: push
push: ## retags and pushes to ${REGISTRY}
	for image in ${IMAGES}; do \
		docker tag $$image ${REGISTRY}/$$image; \
		docker push ${REGISTRY}/$$image; \
	done
	@curl ${REGISTRY}/v2/_catalog | jq


.PHONY: help
help: ## help on rule's targets
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
