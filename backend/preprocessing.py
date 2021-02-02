import app

import torch
import clip
from PIL import Image
import os
import numpy as np
import cv2

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

image_mean = torch.tensor([0.48145466, 0.4578275, 0.40821073]).to(device) #.cuda()
image_std = torch.tensor([0.26862954, 0.26130258, 0.27577711]).to(device) #.cuda()

def predict():
    image = preprocess(Image.open("CLIP.png")).unsqueeze(0).to(device)
    text = clip.tokenize(["a diagram", "a dog", "a cat"]).to(device)

    with torch.no_grad():
        #image_features = model.encode_image(image)
        #text_features = model.encode_text(text)
    
        logits_per_image, logits_per_text = model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    print("Label probs:", probs)
    return str(probs)


def predict_multiple():
    dir = app.app.config['UPLOAD_FOLDER']
    texts = []
    images = []
    imagenames = []
    for filename in os.listdir(dir):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            image = preprocess(Image.open(os.path.join(dir, filename)).convert("RGB"))
            images.append(image)
            imagenames.append(filename)
        elif filename.endswith(".csv"):
            texts = open(os.path.join(dir, filename)).read().split(',')
            print('categories set to: ' + ' - '.join(texts))

    image_input = torch.tensor(np.stack(images)).to(device) #.cuda()
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]

    text_input = clip.tokenize(texts).to(device) #.cuda()

    with torch.no_grad():
        #image_features = model.encode_image(image_input).float()
        #text_features = model.encode_text(text_input).float()

        logits_per_image, logits_per_text = model(image_input, text_input)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()

    print(probs)
    results = ['<tr><td>' + imagenames[i] + ': </td><td>' + texts[np.argmax(probs[i])] + '</td></tr>' for i in range(len(probs))]

    #m = np.argmax(probs, axis=-1)
    #res = [imagenames[i] + " :  " + texts[i] for i in m]
    return '<table>' + ' '.join(results) + '</table>'


def video_retrieval():
    dir = app.app.config['UPLOAD_FOLDER']
    texts = []
    images = []
    imagenames = []
    for filename in os.listdir(dir):
        if filename.endswith(".mp4"):
            images, secs = extractImages(os.path.join(dir, filename))
            images = [preprocess(image.convert("RGB")) for image in images]
        elif filename.endswith(".csv"):
            texts = open(os.path.join(dir, filename)).read().split(',')
            print('categories set to: ' + ' - '.join(texts))

    image_input = torch.tensor(np.stack(images)).to(device)
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]
    text_input = clip.tokenize(texts).to(device)

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        probs = logits_per_text.softmax(dim=-1).cpu().numpy()
    print(probs)
    print(imagenames)

    results = ['<tr><td>' + texts[i] + ': </td><td>' + str(np.argmax(probs[i])) + '</td></tr>' for i in range(len(texts))]
    return '<table>' + ' '.join(results) + '</table>'


def extractImages(pathIn):
    images = []
    count = 0
    vidcap = cv2.VideoCapture(pathIn)
    success,image = vidcap.read()
    success = True
    while success:
        vidcap.set(cv2.CAP_PROP_POS_MSEC,(count*1000))
        success,image = vidcap.read()
        if success:
            images.append(Image.fromarray(image))
        count = count + 1
    return images, count



