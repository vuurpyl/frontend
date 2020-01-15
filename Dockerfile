FROM node:10.15.3 AS builder
LABEL stage=intermediate
ARG VERSION

COPY ./src /app/src
COPY ./public /app/public
COPY ./package.json /app/package.json
COPY ./jsconfig.json /app/jsconfig.json
COPY ./config-overrides-application.js /app/config-overrides.js
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN echo $VERSION >> public/version.txt
RUN sed -i "s/VERSION_TO_SET_ON_BUILD/$VERSION/g" /app/public/index.html


RUN yarn install
RUN yarn run build --env=prod

FROM nginx:1.16.0-alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
