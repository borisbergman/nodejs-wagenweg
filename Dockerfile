# 1. Start from an official Node image (includes npm!)
FROM node:23.11.1-alpine

# 2. Set our working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package manifests and install deps
#    — only these two files so Docker can cache the install step
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 4. Copy your config folder into the image
COPY ./config/* ./config/
COPY ./proto/* ./proto/

#COPY . .
# 5. Copy the rest of your application code
COPY ./src/* ./src/

# 6. Expose whatever port your app listens on
EXPOSE 8080

# 7. Run your app with Node
CMD ["node", "src/app.js"]
