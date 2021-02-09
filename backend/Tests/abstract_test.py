import requests
import time

ADDRESS = "http://localhost:8080"

categorize = "/categorize"
image = "/image"


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

#Tests if specified endpoint url is reachable
def wait_for_server(test_path):
    for i in range(10):
        try:
            requests.get(ADDRESS + test_path)
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(5)