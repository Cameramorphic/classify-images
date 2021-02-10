import json

import requests
import time

ADDRESS = "http://localhost:8080"

categorize = "/categorize"
image = "/image"
video = "/video"

example_csv = 'example_categories_csv.csv'
example_json = 'example_categories_json.json'

SELECT_FILES_HTML = '''
        <form method="POST" enctype="multipart/form-data">   
        <input type="file" name="files" multiple="">
        <input type="file" name="categories">
        <input type="submit" value="add">
        </form>
         '''

SELECT_VID_FILES_HTML = '''
        <form method="POST" enctype="multipart/form-data">   
        <input type="file" name="video">
        <input type="file" name="categories">
        <input type="submit" value="add">
        </form>
         '''


# Tests if specified endpoint url is reachable
def wait_for_server(test_path):
    for i in range(10):
        try:
            requests.get(ADDRESS + test_path)
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(5)


def build_base_multipart_images(endpoint, files):
    wait_for_server(endpoint)
    multipart_form_data = []
    for f in files:
        if f != "sources.txt":
            multipart_form_data.append(('files', (str(f), open('Pictures/' + f, 'rb'), 'image/jpg')))
    return multipart_form_data

def build_base_video(endpoint, file):
    wait_for_server(endpoint)
    multipart_form_data = [('video', (str(file), open('Videos/' + file, 'rb'), 'video/mp4'))]
    return multipart_form_data


def post_multipart(endpoint, multipart_form_data):
    wait_for_server(categorize)
    response = requests.post(ADDRESS + endpoint, files=multipart_form_data)
    assert response.status_code == 201
    json_response = json.loads(response.text)
    return json_response
