FROM keymetrics/pm2:latest-alpine
ARG CONF_TYPE_ARG
ENV CONF_TYPE=$CONF_TYPE_ARG
ENV NPM_CONFIG_LOGLEVEL warn
ARG RELEASE=latest


RUN apk update && \
    apk add -y python make g++ git && \
    mkdir /app
COPY . /app
WORKDIR /app

RUN npm cache clean --force && npm install && npm rebuild bcrypt --update-binary

#RUN npm install -g chronobank-middleware --unsafe
#RUN mkdir src && cd src && \
#RUN dmt init && \
#    dmt install middleware-auth-service"#$RELEASE"

EXPOSE 8081

#CMD ["node", "./index.js"]
#CMD pm2-docker start /app/ecosystem.config.js

ENTRYPOINT ["./start.sh"]
