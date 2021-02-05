import preprocessing

import os
import pdoc
import json
from flask import Flask, flash, request, send_file
from os import listdir
from os.path import isfile, join

results_path = "/app/results.csv"

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = '/app/uploads/'
# Use this to restrict the maximum file size, This restricts to 16MB:
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# This is necessary so that the kubernetes load balancer can perform health checks
@app.route("/", methods=['GET'])
def hello():
    return "Welcome to classify-images. categorize files at /categorize "

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

ALLOWED_IMAGE_EXTS = {'png', 'jpg', 'jpeg'}
ALLOWED_CATEGORIES_EXTS = {'csv', 'json'}
ALLOWED_VIDEO_EXTS = {'mp4'}
def is_allowed(filename, exts):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in exts
def save_if_allowed(file, exts):
    allowed = is_allowed(file.filename, exts)
    if allowed:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return allowed

#CSV FILE SHOULD ONLY HAVE , between words, NO SPACES!
@app.route("/categorize", methods=['GET', 'POST'])
def categorize():
    if request.method != 'POST':
        return SELECT_FILES_HTML
    error = upload_images_and_categories_file(True)
    return error if error else preprocessing.predict_multiple(True)
    #return send_file(results_path, as_attachment=True, attachment_filename='results.csv')

@app.route("/image", methods=['GET', 'POST'])
def image():
    if request.method != 'POST':
        return SELECT_FILES_HTML
    error = upload_images_and_categories_file(False)
    return error if error else preprocessing.predict_multiple(False)

def upload_images_and_categories_file(allow_no_categories_file):
    uploaded_files = request.files.getlist("files")
    error = check_uploaded_file("categories", ALLOWED_CATEGORIES_EXTS, allow_no_categories_file)
    if error:
        return error
    if len(uploaded_files) == 0:
        return "No file selected"
    filenames = [f.filename for f in uploaded_files if save_if_allowed(f, ALLOWED_IMAGE_EXTS)]
    if len(filenames) == 0:
        return "No file with allowed extension selected (" + str(ALLOWED_IMAGE_EXTS) + " are allowed)"
    print(filenames)
    return None

@app.route("/video", methods=['GET', 'POST'])
def video():
    if request.method != 'POST':
        return SELECT_VID_FILES_HTML
    video_error = check_uploaded_file("video", ALLOWED_VIDEO_EXTS)
    categories_error = check_uploaded_file("categories", ALLOWED_CATEGORIES_EXTS, True)
    if video_error is not None or categories_error is not None:
        return video_error if categories_error is None else categories_error
    return preprocessing.video_retrieval()

def check_uploaded_file(name, allowed_extensions, allow_no_file=False):
    uploaded_file = request.files.get(name)
    if uploaded_file == None or uploaded_file.filename == "":
        return None if allow_no_file else "No file selected, please select a " + name + " file"
    allowed = save_if_allowed(uploaded_file, allowed_extensions)
    if not allowed:
        return "Invalid extension, allowed extensions are: " + str(allowed_extensions)
    print(uploaded_file)
    return None

@app.route("/doc/preprocessing", methods=['GET'])
def preproccessing_doc():
    return pdoc.html('preprocessing')

@app.route("/doc/app", methods=['GET'])
def app_doc():
    return pdoc.html('app')

def delete_files():
    mypath = app.config['UPLOAD_FOLDER']
    onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
    for filename in onlyfiles:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        delete_file(filepath)
    delete_file(results_path)

def delete_file(filepath):
    if os.path.exists(filepath):
        os.remove(filepath)
        print( filepath + " removed", sep=' ')
    else:
        print( filepath + " does not exist", sep=' ')

@app.after_request
def after_request(response):
    # this only works, because the container is restricted to one thread!
    delete_files()
    # allow cross origin communication (cors)
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Expose-Headers'] = 'Content-Disposition'
    return response

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')