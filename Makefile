install:
	npm install

lint:
	npx eslint .

test-debug:
	DEBUG=page-loader npm test

test-debug-axios:
	DEBUG=axios npm test

test-debug-nock:
	DEBUG=nock.* npm test

test:
	npm test