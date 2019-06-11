# npm install -g concurrently

# concurrently "cd client && npm install" "cd server && npm install"

concurrently "cd client && npm run serve" "cd server/ && npm start"