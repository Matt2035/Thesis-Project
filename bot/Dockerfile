FROM node:12-alpine
ENV NODE_ENV=production
# Uncomment the following line to enable agent logging
# LABEL "network.forta.settings.agent-logs.enable"="true"
WORKDIR /app
EXPOSE 3000
COPY ./src ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]
