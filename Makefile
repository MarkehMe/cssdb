
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
	@node app.js

# Start the application and reboot when a file changes
watch:
	@echo "Watching application..."
	@./node_modules/.bin/supervisor -q app.js


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


# Deploy the app
deploy: deps minify-sass
	@echo "Deploying...";
	@modulus deploy
