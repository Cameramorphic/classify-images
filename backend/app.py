import preprocessing

from flask import Flask, flash, request, send_file
from werkzeug.utils import secure_filename
import time
import os
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

ALLOWED_IMAGE_EXTS = {'png', 'jpg'}
ALLOWED_CATEGORIES_EXTS = {'csv'}
def save_if_allowed(file, exts):
    is_allowed = '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in exts
    if is_allowed:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return is_allowed

#CSV FILE SHOULD ONLY HAVE , between words, NO SPACES!
@app.route("/categorize", methods=['GET', 'POST'])
def categorize():
    if request.method != 'POST':
        return SELECT_FILES_HTML
    uploaded_files = request.files.getlist("files")
    uploaded_categories = request.files.get("categories")
    save_if_allowed(uploaded_categories, ALLOWED_CATEGORIES_EXTS)
    print(uploaded_categories.filename)
    if len(uploaded_files) == 0:
        return "No file selected"
    filenames = [f.filename for f in uploaded_files if save_if_allowed(f, ALLOWED_IMAGE_EXTS)]
    if len(filenames) == 0:
        return "No file with allowed extension selected (" + str(ALLOWED_IMAGE_EXTS) + " are allowed)"
    print(filenames)
    return preprocessing.predict_multiple()
    #return send_file(results_path, as_attachment=True, attachment_filename='results.csv')

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