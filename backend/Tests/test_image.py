import csv
import requests
import os
import abstract_test
import json


files = os.listdir("Pictures")

image_endpoint = abstract_test.ADDRESS + abstract_test.image


def test_get_image(module_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.image)
    response = requests.get(image_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_FILES_HTML


def test_post_image_csv(module_scoped_container_getter):
    multipart_form_data = build_image_multipart("Pictures/", abstract_test.example_csv)
    json_response = abstract_test.post_multipart(abstract_test.image, multipart_form_data, 201)

    with open('CategoryFiles/' + abstract_test.example_csv, 'r') as f:
        reader = csv.reader(f)
        categories = next(reader)

    matches = 0
    for element in categories:
        if json_response[element] in files:
            matches += 1

    assert len(json_response) == len(categories)
    assert len(categories) == matches


def test_post_image_json(module_scoped_container_getter):
    multipart_form_data = build_image_multipart("Pictures/", abstract_test.example_json)
    json_response = abstract_test.post_multipart(abstract_test.image, multipart_form_data, 201)
    with open('CategoryFiles/' + abstract_test.example_json) as json_file:
        categories = json.load(json_file)['categories']

    matches = 0
    for element in categories:
        if json_response[element] in files:
            matches += 1

    assert len(json_response) == len(categories)
    assert len(categories) == matches

def test_post_image_csv_utf16(module_scoped_container_getter):
    multipart_form_data = build_image_multipart("Pictures/", abstract_test.utf16_csv)
    json_response = abstract_test.post_multipart(abstract_test.image, multipart_form_data, 400)
    assert json_response["error"] == "Invalid encoding in file " + abstract_test.utf16_csv + ", valid encodings are UTF-8 and US-ASCII"


def test_post_image_json_utf16(module_scoped_container_getter):
    multipart_form_data = build_image_multipart("Pictures/", abstract_test.utf16_json)
    json_response = abstract_test.post_multipart(abstract_test.image, multipart_form_data, 400)
    assert json_response["error"] == "Invalid encoding in file " + abstract_test.utf16_json + ", valid encodings are UTF-8 and US-ASCII"

def test_post_image_invalid_image_files(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.image, os.listdir("InvalidFiles"), "InvalidFiles/")
    multipart_form_data.append(('categories', (str(abstract_test.example_json)
                                               , open("CategoryFiles/" + abstract_test.example_json, 'rb')
                                               , 'text/plain')))
    json_response = abstract_test.post_multipart(abstract_test.image, multipart_form_data, 400)
    assert json_response["error"] == "Invalid extension, allowed extensions are: ['png', 'jpg', 'jpeg']"


def test_post_image_invalid_categories_file(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.image, files, "Pictures/")
    multipart_form_data.append(('categories', (str("Invalid2.pdf")
                                               , open('InvalidFiles/' + "Invalid2.pdf", 'rb')
                                               , 'text/plain')))
    json_response = abstract_test.post_multipart(abstract_test.image, multipart_form_data, 400)
    assert json_response["error"] == "Invalid extension, allowed extensions are: ['csv', 'json']"


def build_image_multipart(images_path, categories_file_name):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.image, files, images_path)
    multipart_form_data.append(('categories', (str(categories_file_name)
                                               , open('CategoryFiles/' + categories_file_name, 'rb')
                                               , 'text/plain')))
    return multipart_form_data
