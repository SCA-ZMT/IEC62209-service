include ../scripts/common.Makefile


info: ## info on tools
	 which node
	 node --version

.PHONY: install
install: ## installs nodejs
	npm install
	node --version

.PHONY: compile
compile: ## compiles
	npx qx compile --debug --clean

.PHONY: serve
serve: ## compiles, watches and serves with nodejs
	npx qx serve
