FROM python:3.11-alpine

ENV LANG=C.UTF-8
ENV PYTHONIOENCODING=utf-8

WORKDIR /src

COPY requirements-build.txt /tmp/requirements-build.txt
RUN python -m pip install --no-cache-dir --upgrade "pip==26.1.2" "setuptools==80.9.0" "wheel==0.45.1" \
    && python -m pip install --no-cache-dir --no-deps --no-build-isolation "simiki==1.6.2.3" \
    && python -m pip install --no-cache-dir --no-deps -r /tmp/requirements-build.txt

COPY . /src

RUN simiki -V \
    && simiki g \
    && test -s output/index.html \
    && touch output/.nojekyll

CMD ["simiki", "p", "-w", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000
