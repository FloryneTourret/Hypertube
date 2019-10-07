#npm install -g serve
cd client && npm run build
concurrently "serve -s dist -p 8080" "cd ../server/ && npm start" 