FROM node:12

WORKDIR /app
# ADD . /app
ADD package.json /app
RUN npm install


EXPOSE 3030
CMD ["npm", "start"]
