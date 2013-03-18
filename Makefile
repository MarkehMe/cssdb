
# Group targets
all: start

# Install dependencies
deps:
	@echo "Installing dependencies..."
	@npm install

# Start the application
start: deps
	@echo "Starting application..."
	@node app.js

# Start the application and reboot when a file changes
watch: deps
	@echo "Watching application..."
	@./node_modules/.bin/supervisor -q app.js
