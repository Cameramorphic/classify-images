import pytest
import requests
import os
import time

pytest_plugins = ["docker_compose"]

categorize_endpoint = "http://localhost:8080/categorize"


def test_get_categorize(function_scoped_container_getter):
    # assert ("t" == "s")

    time.sleep(20)

    response = requests.get(categorize_endpoint)
    assert response.status_code == 200
    assert response.text == '''
        <form method="POST" enctype="multipart/form-data">   
        <input type="file" name="files" multiple="">
        <input type="file" name="categories">
        <input type="submit" value="add">
        </form>
         '''

def test_post_categorize(function_scoped_container_getter):
    files = os.listdir("Pictures")
    assert (len(files) == 3)
    response = requests.post(categorize_endpoint, files)



