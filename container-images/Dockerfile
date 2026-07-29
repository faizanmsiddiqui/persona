FROM debian:bookworm-slim

RUN rm -f /etc/apt/apt.conf.d/docker-clean \
    && apt-get update \
    && apt-get -o APT::Keep-Downloaded-Packages=true install -y \
        curl \
        dnsutils \
        gdb \
        iproute2 \
        netcat-openbsd \
        strace \
        tcpdump \
        vim-tiny

CMD ["sleep", "infinity"]
