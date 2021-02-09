import pytest
import requests
import os
import time
import abstract_test

pytest_plugins = ["docker_compose"]

image_endpoint = abstract_test.ADDRESS + abstract_test.image


def test_get_image(function_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.image)
    response = requests.get(image_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_FILES_HTML
