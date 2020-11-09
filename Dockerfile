FROM node:12-alpine as build
WORKDIR /app
COPY package.json /app/package.json
RUN npm install --only=prod
COPY . /app
#RUN cd src/ | ls -la
RUN ["chmod", "+x", "/dummy.sh"]
RUN cat /dev/null > src/constants/server.js | echo $ENV_BACKEND_URI > src/constants/server.js | cat src/constants/server.js

RUN echo $ENV_BACKEND_URI

#RUN npm i -S @semantic-ui-react/craco-less
#RUN npm run build
#FROM nginx:1.16.0-alpine
#COPY --from=build /app/build /usr/share/nginx/html
#COPY default.conf /etc/nginx/conf.d/default.conf
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]