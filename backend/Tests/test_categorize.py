import pytest
import requests
import os
import abstract_test
import json


files = os.listdir("Pictures")


categorize_endpoint = abstract_test.ADDRESS + abstract_test.categorize


def test_get_categorize(module_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.categorize)
    response = requests.get(categorize_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_FILES_HTML

def test_post_categorize_csv(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.categorize, files)
    multipart_form_data.append(('categories', (str(abstract_test.example_csv), open('CategoryFiles/' + abstract_test.example_csv, 'rb'), 'text/plain')))

    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data)
    for f in files:
        if f != "sources.txt":
            assert ((json_response[f] == "an apple") or (json_response[f] == "a cat") or json_response[f] == "a dog")
    assert len(json_response) == len(files) - 1

def test_post_categorize_json(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.categorize, files)
    multipart_form_data.append(('categories', (str(abstract_test.example_json), open('CategoryFiles/' + abstract_test.example_json, 'rb'), 'text/plain')))
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data)
    for f in files:
        if f != "sources.txt":
            assert ((json_response[f] == "an apple") or (json_response[f] == "a dog"))
    assert len(json_response) == len(files) - 1







