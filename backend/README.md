downlaod the model into /backend with:
curl https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt -O model.pt
(or use wget)
download the tokenizer into /backend with:
curl https://openaipublic.azureedge.net/clip/bpe_simple_vocab_16e6.txt.gz -O bpe_simple_vocab_16e6.txt.gz
(or use wget)

build:
docker image build -t classify-images:0.0.1 .

run:
docker run -p 8080:8080 classify-images:0.0.1
docker run -p 8080:8080 -d classify-images:0.0.1



