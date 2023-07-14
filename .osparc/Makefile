
.DEFAULT_GOAL := help
SHELL := /bin/bash


REPO_DIR := $(abspath $(CURDIR)/..)

export DOCKER_REGISTRY ?= itisfoundation
export DOCKER_IMAGE_NAME ?= iec62209-service
export DOCKER_IMAGE_TAG  ?= $(shell cat ../VERSION 2> /dev/null || echo undefined)
export DOCKER_IMAGE ?= ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}

.PHONY: info
info: ## lists environments and required tools
	# tools
	@echo 'docker         : $(shell docker --version 2>/dev/null || echo ERROR required tool missing )'
	@echo 'docker compose : $(shell docker compose version 2>/dev/null || echo ERROR required tool missing )'
	@echo 'docker buildx  : $(shell docker buildx version 2>/dev/null || echo WARNING optional tool missing )'
	@echo 'make           : $(shell make --version 2>&1 | head -n 1)'
	@echo 'awk            : $(shell awk -W version 2>&1 | head -n 1)'
	@echo 'sed            : $(shell sed  --version 2>&1 | head -n 1)'
	# environments
	@echo "REPO_DIR           = ${REPO_DIR}"
	@echo "DOCKER_IMAGE       = ${DOCKER_IMAGE}"
	@echo "DOCKER_REGISTRY    = ${DOCKER_REGISTRY}"


.PHONY: update-version
update-version:
	cd $(REPO_DIR) \
	&& . update_version.sh \
	&& cd -

.PHONY: compose
compose: update-version ## creates docker-compose.yml
	# creating compose specs
	cd $(REPO_DIR) \
	&& .osparc/bin/ooil.bash compose -f .osparc/docker-compose.yml \
	&& sed -r "s/ image: .+/"${DOCKER_IMAGE}"/g" -i .osparc/docker-compose.yml


.PHONY: build build-nc
build build-nc: compose ## builds image. Suffix -nc disables cache
	# building
	docker compose build $(if $(findstring -nc,$@),--no-cache,)

version_exists = $(shell DOCKER_CLI_EXPERIMENTAL=enabled docker manifest inspect $(DOCKER_REGISTRY)/$(DOCKER_IMAGE) > /dev/null && echo "image already exists on $(DOCKER_REGISTRY)")

.PHONY: push
push: ## retags and pushes to ${DOCKER_REGISTRY}
	# tag & push
	$(if $(call version_exists),$(error $(DOCKER_REGISTRY)/$(DOCKER_IMAGE) already exists on $(DOCKER_REGISTRY)), $(info $(DOCKER_IMAGE) not yet on $(DOCKER_REGISTRY)))
	echo "Tagging and pushing ${DOCKER_REGISTRY}/${DOCKER_IMAGE} ..."; \
	docker tag "$(DOCKER_IMAGE)" "${DOCKER_REGISTRY}/${DOCKER_IMAGE}"; \
	docker push "${DOCKER_REGISTRY}/${DOCKER_IMAGE}"; \


.PHONY: all
all: compose build-nc push ## all workflow
	@echo "'${IMAGES}' built, and pushed to '${DOCKER_REGISTRY}'"


.PHONY: help
help: ## help on rule's targets
	@awk --posix 'BEGIN {FS = ":.*?## "} /^[[:alpha:][:space:]_-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
