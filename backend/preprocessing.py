import app

import clip
import cv2
import json
import numpy as np
import os
import torch
from flask import Response
from PIL import Image
from requests_toolbelt import MultipartEncoder

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

image_mean = torch.tensor([0.48145466, 0.4578275, 0.40821073]).to(device)
image_std = torch.tensor([0.26862954, 0.26130258, 0.27577711]).to(device)


def predict_multiple():
    dir = app.app.config['UPLOAD_FOLDER']
    texts = []
    images = []
    imagenames = []
    for filename in os.listdir(dir):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            with Image.open(os.path.join(dir, filename)) as image:
                images.append(preprocess(image.convert("RGB")))
            imagenames.append(filename)
        elif filename.endswith(".csv"):
            texts = open(os.path.join(dir, filename)).read().split(',')
            print('categories set to: ' + ' - '.join(texts))
        elif filename.endswith(".json"):
                    file = open(os.path.join(dir, filename))
                    texts = json.loads(file.read())["categories"]
                    print('categories set to: ' + ' - '.join(texts))
                    file.close()

    image_input = torch.tensor(np.stack(images)).to(device)
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]
    text_input = clip.tokenize(texts).to(device)

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    dic = {imagenames[i]: texts[np.argmax(probs[i])] for i in range(len(probs))}
    # results = ['<tr><td>' + key + ': </td><td>' + dic[key] + '</td></tr>' for key in dic]
    # m = np.argmax(probs, axis=-1)
    # res = [imagenames[i] + " :  " + texts[i] for i in m]
    # return '<table>' + ' '.join(results) + '</table>'
    return json.dumps(dic)


# currently only one video at a time (but with multiple textual descriptions)
def video_retrieval():
    dir = app.app.config['UPLOAD_FOLDER']
    texts = []
    images = []
    imagenames = []
    videopath = ''
    for filename in os.listdir(dir):
        if filename.endswith(".mp4"):
            videopath = os.path.join(dir, filename)
            images, secs = extractImages(videopath)
            images = [preprocess(image.convert("RGB")) for image in images]
        elif filename.endswith(".csv"):
            texts = open(os.path.join(dir, filename)).read().split(',')
            print('categories set to: ' + ' - '.join(texts))
        elif filename.endswith(".json"):
            file = open(os.path.join(dir, filename))
            texts = json.loads(file.read())["categories"]
            print('categories set to: ' + ' - '.join(texts))
            file.close()

    image_input = torch.tensor(np.stack(images)).to(device)
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]
    text_input = clip.tokenize(texts).to(device)

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        probs = logits_per_text.softmax(dim=-1).cpu().numpy()
    print(probs)
    print(imagenames)

    filepaths = []
    for i in range(len(texts)):
        filepaths.append(saveImageFromVideo(videopath, np.argmax(probs[i])))

    text_file_time = {}
    for i in range(len(texts)):
        text_file_time[texts[i]] = {filepaths[i]: str(np.argmax(probs[i]))}

    name = os.path.join(app.app.config['UPLOAD_FOLDER'], 'data.json')

    print(filepaths)


    with open(name, 'w', encoding='utf-8') as f:
        json.dump(text_file_time, f, ensure_ascii=False, indent=4)
        filepaths.append(name)
    m = MultipartEncoder(
        fields={
            fname: open(fname, 'rb') for fname in filepaths}
    )

    return Response(m.to_string(), mimetype=m.content_type)
    #results = ['<tr><td>' + key + ': </td><td>' + text_prob[key] + '</td></tr>' for key in text_prob]
    #return '<table>' + ' '.join(results) + '</table>'


def extractImages(pathIn):
    images = []
    count = 0
    vidcap = cv2.VideoCapture(pathIn)
    success, image = vidcap.read()
    success = True
    while success:
        vidcap.set(cv2.CAP_PROP_POS_MSEC, (count * 1000))
        success, image = vidcap.read()
        if success:
            images.append(Image.fromarray(image))
            count = count + 1
    return images, count


# index in seconds
def saveImageFromVideo(pathIn, index):
    vidcap = cv2.VideoCapture(pathIn)
    vidcap.set(cv2.CAP_PROP_POS_MSEC, (index * 1000))
    success, image = vidcap.read()
    image_path = os.path.basename(pathIn) + '-' + str(index) + '.jpg'
    cv2.imwrite(image_path, image)
    return image_path
