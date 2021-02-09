import pytest
import requests
import os
import time
import abstract_test

pytest_plugins = ["docker_compose"]


categorize_endpoint = abstract_test.ADDRESS + abstract_test.categorize


def test_get_categorize(function_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.categorize)
    response = requests.get(categorize_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_FILES_HTML

def test_post_categorize(function_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.categorize)
    files = os.listdir("Pictures")
    assert (len(files) == 2)
    #response = requests.post(categorize_endpoint, files)









