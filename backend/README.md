downlaod the model into /backend to avoid downloading it again with every run:
curl https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt --remote-name
(or use wget with -O model.pt)
PUT THIS FILE INTO /.cache/clip


build:
docker image build -t classify-images:0.0.1 .


THE DOCKER REQUIRES APPROX 4GB of RAM to function properly
AT 2GB RAM it behaved weirdly (files attached to requests just disappeared)
run:
docker run -p 8080:8080 classify-images:0.0.1
docker run -p 8080:8080 -d classify-images:0.0.1
#interactive mode
docker run -it classify-images:0.0.1 /bin/bash 


