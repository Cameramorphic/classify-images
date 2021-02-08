## Backend
This is the docker container for the backend. It will run on port 8080.

For building this docker container just run this command:
docker image build -t classify-images:0.0.1 .
First build can take some time.

To run the build docker image you have three options:
1. Run in detached mode
docker run -p 8080:8080 -d classify-images:0.0.1

2. Run in foreground mode 
docker run -p 8080:8080 classify-images:0.0.1

3. Run with access to the container console (interactive Mode)
docker run -it classify-images:0.0.1 /bin/bash 


Keep in mind that at least 2GB of RAM are needed to function properly.

Normally if started it would download the model into the backend. If you want to bypass it
just download the model with:
curl https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt --remote-name
or
wget https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt -O model.pt
and put it into /.cache/clip


## Endpoints
If you are planning to just use the backend, here are the endpoints.

#### /categorize
Takes multiple pictures with the format jpg/jpeg and a json file. This has to be send as multipart/form-data to the backend.
Note that the pictures all need to have the form-data name "files" and the json as well as the csv file need to be named "categories".
It returns a json file in the form of {"filename": "category"}. This means it tries to match a category for each picture.

#### /image
Takes multiple pictures with the format jpg/jpeg and a json file. This has to be send as multipart/form-data to the backend.
Note that the pictures all need to have the form-data name "files" and the json as well as the csv file need to be named "categories".
It returns a json file in the form of {"category": "filename"}. This means it tries to match each category to the best fit image.


#### /video
Takes one video in the format of mp4 and a json file. This has to be send as multipart/form-data to the backend.
Note that the video has to be named "video" in the form-data object and the json needs to be named "categories" before sending them to the backend.
It returns for each defined category the best fit extracted picture. This picture has the jpg-format and is sent base64 encoded
as json, {"Categories": ["filename", "base64encoded"]}.





