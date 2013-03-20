
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
