import pytest
import requests
import os
import time
import abstract_test

pytest_plugins = ["docker_compose"]

video_endpoint = abstract_test.ADDRESS + abstract_test.video


def test_get_video(function_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.image)
    response = requests.get(video_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_VID_FILES_HTML
