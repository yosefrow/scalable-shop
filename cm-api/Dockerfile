FROM node:lts-alpine3.20
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
# By docker history, node UID == 1000 & k8s securityContext.runAsNonRoot needs numbers)
USER 1000
CMD ["npm", "start"]