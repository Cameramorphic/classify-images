import requests
import os
import abstract_test


files = os.listdir("Pictures")


categorize_endpoint = abstract_test.ADDRESS + abstract_test.categorize


def test_get_categorize(module_scoped_container_getter):
    abstract_test.wait_for_server(abstract_test.categorize)
    response = requests.get(categorize_endpoint)
    assert response.status_code == 200
    assert response.text == abstract_test.SELECT_FILES_HTML


def test_post_categorize_csv(module_scoped_container_getter):
    multipart_form_data = build_categorize_multipart("Pictures/", abstract_test.example_csv)
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data, 201)
    for f in files:
        if f != "sources.txt":
            assert ((json_response[f] == "an apple") or (json_response[f] == "a cat") or json_response[f] == "a dog")
    assert len(json_response) == len(files) - 1


def test_post_categorize_csv_utf16(module_scoped_container_getter):
    multipart_form_data = build_categorize_multipart("Pictures/", abstract_test.utf16_csv)
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data, 400)
    assert json_response["error"] == "Invalid encoding in file " + abstract_test.utf16_csv + ", valid encodings are UTF-8 and US-ASCII"


def test_post_categorize_json_utf16(module_scoped_container_getter):
    multipart_form_data = build_categorize_multipart("Pictures/", abstract_test.utf16_json)
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data, 400)
    assert json_response["error"] == "Invalid encoding in file " + abstract_test.utf16_json + ", valid encodings are UTF-8 and US-ASCII"


def test_post_categorize_json(module_scoped_container_getter):
    multipart_form_data = build_categorize_multipart("Pictures/", abstract_test.example_json)
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data, 201)
    for f in files:
        if f != "sources.txt":
            assert ((json_response[f] == "an apple") or (json_response[f] == "a dog"))
    assert len(json_response) == len(files) - 1


def test_post_categorize_invalid_image_files(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.categorize, os.listdir('InvalidFiles'), "InvalidFiles/")
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data, 400)
    assert json_response["error"] == "Invalid extension, allowed extensions are: ['png', 'jpg', 'jpeg']"


def test_post_categorize_invalid_categories_file(module_scoped_container_getter):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.categorize, files, "Pictures/")
    multipart_form_data.append(('categories', (str("invalid2.pdf")
                                               , open('InvalidFiles/' + "Invalid2.pdf", 'rb')
                                               , 'text/plain')))
    json_response = abstract_test.post_multipart(abstract_test.categorize, multipart_form_data, 400)
    assert json_response["error"] == "Invalid extension, allowed extensions are: ['csv', 'json']"


def build_categorize_multipart(images_path, categories_file_name):
    multipart_form_data = abstract_test.build_base_multipart_images(abstract_test.categorize, files, images_path)
    multipart_form_data.append(('categories', (str(categories_file_name)
                                               , open('CategoryFiles/' + categories_file_name, 'rb')
                                               , 'text/plain')))
    return multipart_form_data





