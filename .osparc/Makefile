
.DEFAULT_GOAL := help
SHELL := /bin/bash

REPO_DIR := $(abspath $(CURDIR)/..)
IMAGES=$(shell yq eval '.services.*.image' docker-compose.yml)
export DOCKER_REGISTRY ?= registry:5000

.PHONY: info
info: ## environs
	@echo 'REPO_DIR =${REPO_DIR}'
	@echo 'IMAGES   =${IMAGES}'
	@echo 'DOCKER_REGISTRY =${DOCKER_REGISTRY}'

.PHONY: compose
compose: ## creates docker-compose.yml
	cd $(REPO_DIR) \
	&& .osparc/bin/ooil.bash compose -f .osparc/docker-compose.yml


.PHONY: build build-nc
build build-nc: compose ## builds image. Suffix -nc disables cache
	docker compose build $(if $(findstring -nc,$@),--no-cache,)


.PHONY: push
push: ## retags and pushes to ${DOCKER_REGISTRY}
	@for image in ${IMAGES}; do \
		echo "Tagging and pushing ${DOCKER_REGISTRY}/$$image ..."; \
		docker tag "$$image" "${DOCKER_REGISTRY}/$$image"; \
		docker push "${DOCKER_REGISTRY}/$$image"; \
	done
	# registry view
	@curl --silent ${DOCKER_REGISTRY}/v2/_catalog | jq


.PHONY: help
help: ## help on rule's targets
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
