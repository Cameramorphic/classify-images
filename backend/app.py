import preprocessing
from MessageException import MessageException

import os
import pdoc
import json
from flask import Flask, request, Response
from os import listdir
from os.path import isfile, join

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = '/app/uploads/'

@app.errorhandler(MessageException)
def handle_MessageException(e):
    ''' Returns a flask response with an error message as json. '''
    dict = {'error' : str(e)}
    return Response(json.dumps(dict), status=400, mimetype='application/json')

# required for kubernetes health checks
@app.route("/", methods=['GET'])
def hello():
    ''' Returns a flask response with a plain welcome text message.'''
    return Response("Welcome to classify-images. categorize files at /categorize ", status=200, mimetype='text/plain')

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
    ''' Checks the filenames extension. '''
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in exts
def save_if_allowed(file, exts):
    ''' Saves the file to the upload folder if its extension is valid. '''
    if is_allowed(file.filename, exts):
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
        return True
    raise MessageException("Invalid extension, allowed extensions are: " + str(exts))

def save_special_file(name, exts, allow_no_file=False):
    '''
    Reads a file from the flask request and saves it to the upload folder if its file extension is valid.

    Parameters
    ----------
    name : str
    exts : Set[str]
        Set of valid file extensions.
    allow_no_file : bool, optional
        If `True` no exception is raised if the flask request contains no file.

    Raises
    ------
    MessageException
        If no input file can be read from flask request and allow_no_file is `False`.
    '''
    file = request.files.get(name)
    if file == None or file.filename == "":
        if not allow_no_file:
            raise MessageException("No file selected, please select a " + name + " file")
    else:      
        save_if_allowed(file, exts)

def save_images_and_categories_file(allow_no_categories_file):
    '''
    Reads images and a categories file from the flask request and saves all files with valid extensions to the uploads
    folder.

    Parameters
    ----------
    allow_no_categories_file : bool
        If `True` no exeption is raised on a missing categories file.

    Raises
    ------
    MessageException
        Raised if no image with a valid extension was uploaded. A missing categories file raises the exception only if
        allow_no_categories_file is `False`.
    '''
    save_special_file("categories", ALLOWED_CATEGORIES_EXTS, allow_no_categories_file)
    uploaded_files = request.files.getlist("files")
    if len(uploaded_files) == 0:
        raise MessageException("No image file selected")
    filenames = [f.filename for f in uploaded_files if save_if_allowed(f, ALLOWED_IMAGE_EXTS)]
    if len(filenames) == 0:
        raise MessageException("No image file with allowed extension selected (" + str(ALLOWED_IMAGE_EXTS) + " are allowed)")
    print(filenames)

@app.route("/categorize", methods=['GET', 'POST'])
def categorize():
    if request.method != 'POST':
        return Response(SELECT_FILES_HTML, status=200, mimetype='text/html')
    
    save_images_and_categories_file(True)
    return preprocessing.predict_multiple(True)

@app.route("/image", methods=['GET', 'POST'])
def image():
    if request.method != 'POST':
        return Response(SELECT_FILES_HTML, status=200, mimetype='text/html')
    
    save_images_and_categories_file(False)
    return preprocessing.predict_multiple(False)

@app.route("/video", methods=['GET', 'POST'])
def video():
    if request.method != 'POST':
        return Response(SELECT_VID_FILES_HTML, status=200, mimetype='text/html')

    save_special_file("video", ALLOWED_VIDEO_EXTS, False)
    save_special_file("categories", ALLOWED_CATEGORIES_EXTS, False)
    return preprocessing.video_retrieval()

@app.route("/doc/preprocessing", methods=['GET'])
def preproccessing_doc():
    ''' Generates HTML documentation for preprocessing.py. '''
    return pdoc.html('preprocessing')

@app.route("/doc/app", methods=['GET'])
def app_doc():
    ''' Generates HTML documentation for app.py. '''
    return pdoc.html('app')

def delete_files():
    ''' Deletes all files in the upload folder. '''
    mypath = app.config['UPLOAD_FOLDER']
    onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
    for filename in onlyfiles:
        filepath = os.path.join(mypath, filename)
        delete_file(filepath)

def delete_file(filepath):
    '''
    Deletes the file at the given filepath.

    Parameters
    ----------
    filepath : str
        The path to the file in the upload folder.
    '''
    if os.path.exists(filepath):
        os.remove(filepath)
        print( filepath + " removed", sep=' ')
    else:
        print( filepath + " does not exist", sep=' ')

@app.after_request
def after_request(response):
    '''
        Deletes all files in the upload folder and returns the given flask response with headers set to allow
        cross origin communication.
    '''
    delete_files()
    # allow cross origin communication (cors)
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Expose-Headers'] = 'Content-Disposition'
    return response

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')