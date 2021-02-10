import app

import clip
import cv2
import json
import numpy as np
import os
import torch
from PIL import Image
import base64
from flask import Response
from MessageException import MessageException


device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

image_mean = torch.tensor([0.48145466, 0.4578275, 0.40821073]).to(device)
image_std = torch.tensor([0.26862954, 0.26130258, 0.27577711]).to(device)


def get_texts_images_imagenames():
    '''
        Uses the images and categories file in the upload folder as input. Retrieves the texts from the categories file,
        the images and imagenames from the uploaded images.

        Returns
        -------
        texts : List[str]
            List of categories from the categories file.
        images : List
            List of images from the upload folder, preprocessed with the model.
        imagenames : List[str]
            Names of all images returned.

        Raises
        ------
        MessageException
            If the categories file has an invalid encoding or syntax or an image has invalid content.
        '''
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
            except Exception:
                raise MessageException("Invalid image, the file " + filename + " seems to be broken")
        elif filename.endswith(".csv"):
            try:
                texts = open(os.path.join(dir, filename)).read().split(',')
            except UnicodeDecodeError:
                raise MessageException("Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
        elif filename.endswith(".json"):
            try:
                file = open(os.path.join(dir, filename))
                texts = json.loads(file.read())["categories"]
                file.close()
            except UnicodeDecodeError:
                raise MessageException("Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
            except Exception:
                raise MessageException("Invalid json file, please check the syntax of " + filename)

    if not texts:
        texts = open("/app/default-list.csv").read().split(',')
    print('categories set to: ' + ' - '.join(texts))
    return texts, images, imagenames


def predict_multiple(by_image):
    '''
    Uses the images and a categories file in the upload folder as input. Maps one image to each category or one category
    to each image depending on the parameter by_image.

    Parameters
    ----------
    by_image : bool
        If `True` the function returns one category for each image as used for categorizing, otherwise one image for
        each category as used for searching.

    Returns
    -------
    flask.Response
        Response with a json containing the mappings of imagenames to categories.

    Raises
    ------
    MessageException
        If the categories file has an invalid encoding or syntax, an image has invalid content or a category has invalid
        length (>77 characters).
    '''
    texts, images, imagenames = get_texts_images_imagenames()

    image_input = torch.tensor(np.stack(images)).to(device)
    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]

    try:
        text_input = clip.tokenize(texts).to(device)
    except RuntimeError:
        raise MessageException("One of your categories is too long, maximum number of characters per category is 77")

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        if by_image:
            probs = logits_per_image.softmax(dim=-1).cpu().numpy()
            dic = {imagenames[i]: texts[np.argmax(probs[i])] for i in range(len(probs))}
        else:
            probs = logits_per_text.softmax(dim=-1).cpu().numpy()
            dic = {texts[i]: imagenames[np.argmax(probs[i])] for i in range(len(probs))}
    return Response(json.dumps(dic), status=201, mimetype='application/json')


def get_texts_images_imagenames_videopath():
    '''
    Uses the video and categories file in the upload folder as input. Retrieves the texts from the categories file, the
    videopath, the images and imagenames from the video.

    Returns
    -------
    texts : List[str]
        List of categories from the categories file.
    images : List
        List of images retrieved from the video (one per second) and preprocessed with the model
    imagenames : List[str]
        Names of all images returned.
    videopath : str
        Path to the video in the upload folder.

    Raises
    ------
    MessageException
        If the categories file has an invalid encoding or syntax.
    '''
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
            try:
                texts = open(os.path.join(dir, filename)).read().split(',')
                print('categories set to: ' + ' - '.join(texts))
            except UnicodeDecodeError:
                raise MessageException("Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
        elif filename.endswith(".json"):
            try:
                file = open(os.path.join(dir, filename))
                texts = json.loads(file.read())["categories"]
                print('categories set to: ' + ' - '.join(texts))
                file.close()
            except UnicodeDecodeError:
                raise MessageException("Invalid encoding in file " + filename + ", valid encodings are UTF-8 and US-ASCII")
            except json.JSONDecodeError:
                raise MessageException("Invalid json file, please check the syntax of " + filename)
    return texts, images, imagenames, videopath


def video_retrieval():
    '''
        Uses the video and categories file in the upload folder as input. Searches the video for the best matching image
        to each category.

        Returns
        -------
        flask.Response
            Response with a json containing a list with a base64 encoded image, the probability calculated by the model
             and the images position in seconds the mapped to each category.

        Raises
        ------
        MessageException
            If the categories file has an invalid encoding or syntax, the video file has invalid content or one of the
            categories has an invalid length (>77 characters).

    '''
    texts, images, imagenames, videopath = get_texts_images_imagenames_videopath()

    try:
        image_input = torch.tensor(np.stack(images)).to(device)
    except ValueError:
        raise MessageException("Invalid video, the file " + videopath[videopath.rfind("/")+1:] + " seems to be broken")

    image_input -= image_mean[:, None, None]
    image_input /= image_std[:, None, None]
    try:
        text_input = clip.tokenize(texts).to(device)
    except RuntimeError:
        raise MessageException("One of your categories is too long, maximum number of characters per category is 77")

    with torch.no_grad():
        logits_per_image, logits_per_text = model(image_input, text_input)
        probs = logits_per_text.softmax(dim=-1).cpu().numpy()
    print(probs)
    print(imagenames)

    result = {}
    for i in range(len(texts)):
        filepath = saveImageFromVideo(videopath, np.argmax(probs[i]))
        with open(filepath, "rb") as image_file:
            trimmed_base64 = str(base64.b64encode(image_file.read()))
            trimmed_base64 = trimmed_base64[2:(len(trimmed_base64) - 1)]
            result[texts[i]] = [trimmed_base64, str(probs[i][np.argmax(probs[i])] * 100), str(np.argmax(probs[i]))]
    return Response(json.dumps(result), status=201, mimetype='application/json')


def extractImages(pathIn):
    '''
        Extracts one images per second from the video given by pathIn.

        Parameters
        ----------
        pathIn : str
            The path to the video in the upload folder.

        Returns
        -------
        images : List
            List of images extracted from the video and preprocessed with the model.
        count : int
            Count of images returned.
    '''
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


def saveImageFromVideo(pathIn, index):
    '''
        Saves the image at position index of the video given by pathIn.

        Parameters
        ----------
        pathIn : str
            The path to the video in the upload folder.
        index : int
            The position of the image in seconds.

        Returns
        -------
        image_path : str
            The path of the newly saved image.
    '''
    vidcap = cv2.VideoCapture(pathIn)
    vidcap.set(cv2.CAP_PROP_POS_MSEC, (index * 1000))
    success, image = vidcap.read()
    image_path = os.path.basename(pathIn) + '-' + str(index) + '.jpg'
    cv2.imwrite(image_path, image)
    return image_path
