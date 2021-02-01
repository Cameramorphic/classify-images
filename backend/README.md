

build:
docker image build -t classify-images:0.0.1 .

run:
docker run -p 8080:8080 -d classify-images:0.0.1



