import csv
import json

import pytest
import requests
import os
import time

from PIL import Image

import abstract_test
import base64

pytest_plugins = ["docker_compose"]

video_endpoint = abstract_test.ADDRESS + abstract_test.video

VIDEOS_DIRECTORY = "Videos"
file = "example_video.mp4"


def test_get_video(function_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.image)
    response = requests.get(video_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_VID_FILES_HTML


def test_post_video_csv(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_video(abstract_test.video, file)
    multipart_form_data.append(('categories', (
        str(abstract_test.example_csv), open('CategoryFiles/' + abstract_test.example_csv, 'rb'), 'text/plain')))

    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data)

    with open('CategoryFiles/' + abstract_test.example_csv, 'r') as f:
        reader = csv.reader(f)
        categories = next(reader)

    is_valid_response(categories, json_response)


def test_post_video_json(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_video(abstract_test.video, file)
    multipart_form_data.append(('categories', (
        str(abstract_test.example_json), open('CategoryFiles/' + abstract_test.example_json, 'rb'), 'text/plain')))
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data)

    with open('CategoryFiles/' + abstract_test.example_json) as json_file:
        categories = json.load(json_file)['categories']

    is_valid_response(categories, json_response)

    assert len(json_response) == len(categories)


def is_float(string):
    try:
        float(string)
        return True
    except ValueError:
        return False


def is_int(string):
    try:
        int(string)
        return True
    except ValueError:
        return False


def is_image(path):
    try:
        image = Image.open(path)
        image.verify()
        return True
    except (IOError, SyntaxError):
        return False

def is_valid_response(categories, json_response):
    for category in categories:
        probability = json_response[category][1]
        second = json_response[category][2]
        assert is_float(probability)
        assert is_int(second)
        file_bytes = base64.b64decode(json_response[category][0])
        file_path = "GeneratedImages/test" + second + ".jpg"
        f = open(file_path, "wb")
        f.write(file_bytes)
        f.close()
        assert is_image(file_path)

