import csv
import json

import requests
import os

from PIL import Image

import abstract_test
import base64

video_endpoint = abstract_test.ADDRESS + abstract_test.video

VIDEOS_DIRECTORY = "Videos"
file = "example_video.mp4"


def test_get_video(function_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.image)
    response = requests.get(video_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_VID_FILES_HTML


def test_post_video_csv(module_scoped_container_getter):
    multipart_form_data = build_video_multipart(file, abstract_test.example_csv, "Videos/")
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data, 201)

    with open('CategoryFiles/' + abstract_test.example_csv, 'r') as f:
        reader = csv.reader(f)
        categories = next(reader)

    is_valid_response(categories, json_response)


def test_post_video_json(module_scoped_container_getter):
    multipart_form_data = build_video_multipart(file, abstract_test.example_json, "Videos/")
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data, 201)

    with open('CategoryFiles/' + abstract_test.example_json) as json_file:
        categories = json.load(json_file)['categories']

    is_valid_response(categories, json_response)

    assert len(json_response) == len(categories)


def test_post_video_csv_utf16(module_scoped_container_getter):
    multipart_form_data = build_video_multipart(file, abstract_test.utf16_csv, "Videos/")
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data, 400)

    assert json_response['error'] == 'Invalid encoding in file '\
           + abstract_test.utf16_csv + ', valid encodings are UTF-8 and US-ASCII'


def test_post_video_json_utf16(module_scoped_container_getter):
    multipart_form_data = build_video_multipart(file, abstract_test.utf16_json, "Videos/")
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data, 400)

    assert json_response['error'] == 'Invalid encoding in file ' \
           + abstract_test.utf16_json + ', valid encodings are UTF-8 and US-ASCII'


def test_post_video_invalid_video_file(module_scoped_container_getter):
    multipart_form_data = build_video_multipart('Invalid2.pdf', abstract_test.example_json, "InvalidFiles/")
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data, 400)
    assert json_response["error"] == "Invalid extension, allowed extensions are: {'mp4'}"


def test_post_video_invalid_categories_file(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_video(abstract_test.video, file, "Videos/")
    multipart_form_data.append(('categories', (str("Invalid2.pdf")
                                               , open('InvalidFiles/' + "Invalid2.pdf", 'rb')
                                               , 'text/plain')))
    json_response = abstract_test.post_multipart(abstract_test.video, multipart_form_data, 400)
    assert json_response["error"] == "Invalid extension, allowed extensions are: ['csv', 'json']"


def build_video_multipart(video_file, categories_file, dir_path):
    multipart_form_data = abstract_test.build_base_video(abstract_test.video, video_file, dir_path)
    multipart_form_data.append(('categories', (
        str(categories_file), open('CategoryFiles/' + categories_file, 'rb'), 'text/plain')))
    return multipart_form_data


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
        os.remove(path)
        return True
    except (IOError, SyntaxError):
        os.remove(path)
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
