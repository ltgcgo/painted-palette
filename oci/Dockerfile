FROM docker.io/ltgc/stratus:node

WORKDIR /root

COPY ./includes /root/
RUN sh /root/setup.sh

EXPOSE 14514
CMD ["sh", "runner.sh"]