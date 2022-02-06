FROM node:12

WORKDIR /app
# ADD . /app
ADD package.json /app
RUN npm install


EXPOSE 3000
CMD ["npm", "start"]
