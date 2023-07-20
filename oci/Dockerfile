FROM docker.io/ltgc/stratus:deno

WORKDIR /root

COPY ./setup.sh /root/
RUN sh /root/setup.sh

EXPOSE 14514
CMD ["sh", "runner.sh"]