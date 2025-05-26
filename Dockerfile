FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    wget \
    git \
    ffmpeg \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    libffi-dev \
    liblzma-dev \
    && apt-get clean

RUN add-apt-repository ppa:deadsnakes/ppa -y && apt-get update && \
    apt-get install -y python3.12 python3.12-venv python3.12-dev && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12

RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@11.3.0

RUN npm install -g @angular/cli@19.2.8

WORKDIR /app
COPY . .

WORKDIR /app/backend
RUN pip install --ignore-installed -r requirements.txt

WORKDIR /app/frontend
RUN rm -rf node_modules package-lock.json && npm install

EXPOSE 5000 4200

CMD ["bash", "-c", "cd /app/backend && python3 app.py & cd /app/frontend && ng serve --host 0.0.0.0"]
