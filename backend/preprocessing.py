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
import base64

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

image_mean = torch.tensor([0.48145466, 0.4578275, 0.40821073]).to(device)
image_std = torch.tensor([0.26862954, 0.26130258, 0.27577711]).to(device)


def predict_multiple(by_image):
    dir = app.app.config['UPLOAD_FOLDER']
    texts = []
    images = []
    imagenames = []
    for filename in os.listdir(dir):
        if app.is_allowed(filename, app.ALLOWED_IMAGE_EXTS):
            try:
                with Image.open(os.path.join(dir, filename)) as image:
                   images.append(preprocess(image.convert("RGB")))
                imagenames.append(filename)
            except:
                return app.error_response("Invalid image, the file " + filename + " seems to be broken")
        elif filename.endswith(".csv"):
            try:
                texts = open(os.path.join(dir, filename)).read().split(',')
            except UnicodeDecodeError:
                return app.error_response(
                    "Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
            except:
                return app.error_response(
                    "Invalid csv file, please check the syntax of " + filename)
        elif filename.endswith(".json"):
            try:
                file = open(os.path.join(dir, filename))
                texts = json.loads(file.read())["categories"]
                file.close()
            except UnicodeDecodeError:
                return app.error_response(
                    "Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
            except:
                return app.error_response(
                    "Invalid json file, please check the syntax of " + filename)
    print('categories set to: ' + ' - '.join(texts))
    if not texts:
        texts = open("/app/default-list.csv").read().split(',')

    image_input = torch.tensor(np.stack(images)).to(device)
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]
    text_input = clip.tokenize(texts).to(device)

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        if by_image:
            probs = logits_per_image.softmax(dim=-1).cpu().numpy()
            dic = {imagenames[i]: texts[np.argmax(probs[i])] for i in range(len(probs))}
        else:
            probs = logits_per_text.softmax(dim=-1).cpu().numpy()
            dic = {texts[i]: imagenames[np.argmax(probs[i])] for i in range(len(probs))}

    # results = ['<tr><td>' + key + ': </td><td>' + dic[key] + '</td></tr>' for key in dic]
    # m = np.argmax(probs, axis=-1)
    # res = [imagenames[i] + " :  " + texts[i] for i in m]
    # return '<table>' + ' '.join(results) + '</table>'
    return Response(json.dumps(dic), status=201, mimetype='application/json')

# currently only one video at a time (but with multiple textual descriptions)
def video_retrieval():
    dir = app.app.config['UPLOAD_FOLDER']
    texts = []
    images = []
    imagenames = []
    videopath = ''
    for filename in os.listdir(dir):
        if filename.endswith(".mp4"):
            try:
                videopath = os.path.join(dir, filename)
                images, secs = extractImages(videopath)
                images = [preprocess(image.convert("RGB")) for image in images]
            except:
                return app.error_response("Invalid video, the file " + filename + " seems to be broken")
        elif filename.endswith(".csv"):
            try:
                texts = open(os.path.join(dir, filename)).read().split(',')
                print('categories set to: ' + ' - '.join(texts))
            except UnicodeDecodeError:
                return app.error_response(
                    "Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
            except:
                return app.error_response(
                    "Invalid csv file, please check the syntax of " + filename)
        elif filename.endswith(".json"):
            try:
                file = open(os.path.join(dir, filename))
                texts = json.loads(file.read())["categories"]
                print('categories set to: ' + ' - '.join(texts))
                file.close()
            except UnicodeDecodeError:
                return app.error_response(
                    "Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
            except:
                return app.error_response(
                    "Invalid json file, please check the syntax of " + filename)
    if not texts:
        texts = open(os.path.join(dir, filename)).read().split(',')

    image_input = torch.tensor(np.stack(images)).to(device)
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]
    text_input = clip.tokenize(texts).to(device)

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        probs = logits_per_text.softmax(dim=-1).cpu().numpy()
    print(probs)
    print(imagenames)

    result = {}
    for i in range(len(texts)):
        filepath = saveImageFromVideo(videopath, np.argmax(probs[i]))
        with open(filepath, "rb") as image_file:
            result[texts[i]] = str(base64.b64encode(image_file.read()))
    return Response(json.dumps(result), status=201, mimetype='application/json')

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
