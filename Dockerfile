FROM python:3.7-alpine
ENV LANG=C.UTF-8
ENV PYTHONIOENCODING=utf-8
RUN pip install simiki -i https://pypi.tuna.tsinghua.edu.cn/simple
RUN apk add --no-cache gcc musl-dev python3-dev
RUN pip install --upgrade pytz tzlocal watchdog

WORKDIR /src
COPY . /src

RUN simiki -V
RUN simiki g

CMD ["simiki", "p", "-w", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000
