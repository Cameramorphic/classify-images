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

done = False

# This is necessary so that the kubernetes load balancer can perform health checks
@app.route("/", methods=['GET'])
def hello():
    return "Hello this is the keyword extractor. Upload your files at /multiple"


SELECT_FILES_HTML = '''
        <form method="POST" enctype="multipart/form-data">   
        <input type="file" name="files" multiple="">
        <input type="submit" value="add">
        </form>
         '''

def save_if_allowed(file, exts):
    is_allowed = '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in exts
    if is_allowed:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return is_allowed

ALLOWED_EXTS = {'pdf','docx','xlsx', 'pptx', 'ppt'}

# Upload multiple files
@app.route("/multiple", methods=['GET', 'POST'])
def multiple():
    if request.method != 'POST':
        return SELECT_FILES_HTML
    uploaded_files = request.files.getlist("files")
    if len(uploaded_files) == 0:
        return "No file selected"
    filenames = [f.filename for f in uploaded_files if save_if_allowed(f, ALLOWED_EXTS)]
    if len(filenames) == 0:
        return "No file with allowed extension selected (" + str(ALLOWED_EXTS) + " are allowed)"
    print(filenames)
    

    global done
    done = True
    return send_file(results_path, as_attachment=True, attachment_filename=s)




def delete_files():
    mypath = app.config['UPLOAD_FOLDER']
    onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
    for filename in onlyfiles:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        delete_file(filepath)
    delete_file(keywords_excel_path)
    delete_file(keywords_txt_path)
    delete_file(keywords_json_path)

def delete_file(filepath):
    if os.path.exists(filepath):
        os.remove(filepath)
        print( filepath + " removed", sep=' ')
    else:
        print( filepath + " does not exist", sep=' ')

@app.after_request
def after_request(response):
    # this only works, because the container is restricted to one thread!
    global done
    if done:
        delete_files()
        done = False

    # allow cross origin communication (cors)
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Expose-Headers'] = 'Content-Disposition'
    return response

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')