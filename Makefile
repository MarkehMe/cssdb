
# Group targets
all: start


# Install dependencies
deps:
	@echo "Installing dependencies..."
	@npm install
	@./node_modules/.bin/bower install

# Start the application
start:
	@echo "Starting application..."
	@./node_modules/.bin/nf start


# Create CSS from Sass
compile-sass:
	@echo "Compiling Sass to CSS...";
	@sass ./asset/style/app.scss --style expanded > ./public/style/app.css;
	@echo "  > Done"

# Create minified CSS from Sass
minify-sass: compile-sass
	@echo "Minifying CSS...";
	@sass ./asset/style/app.scss --style compressed > ./public/style/app.min.css;
	@echo "  > Done"

# Watch Sass
watch-sass:
	@echo "Watching Sass for changes...";
	@sass --watch --style expanded ./asset/style/app.scss:./public/style/app.css;


# Lint JavaScript
lint:
	@echo "Linting JavaScript..."
	@./node_modules/.bin/jshint \
		--config ./test/config/jshint.json \
		config model public task view ./*.js

# Run all tests
test: test-feature

# Run feature tests
test-feature:
	@echo "Running features..."
	@./node_modules/.bin/cucumber-js \
		--format pretty \
		./test/feature

# Deploy the app
deploy: deps minify-sass
	@echo "Deploying...";
	@modulus deploy
