import React, { useState } from 'react';

import { Form, FormGroup, ControlLabel, FormControl } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import GenericUploader from 'components/forms/GenericUploader';
import { UploadControls } from 'components/forms/UploadControls';
import { useAPI } from 'hooks/useAPI';

import styles from './SearchVideoRoute.module.css';

/**
 * Parses a string of categories and converts them into a JSON string.
 *
 * @param categoryString Categories as a comma separated string.
 */
function categoriesToJson(categoryString?: string) {
    if (categoryString) {
        // replaces multiple whitespaces with only one and replaces semicolons with ','
        const categoriesWithoutMultipleWhitespaces = categoryString.replace(/\s\s+/g, ' ')
            .replaceAll(';', ',');
        // trims leading and ending whitespaces
        const categories = categoriesWithoutMultipleWhitespaces.split(',').map(c => c.trim());
        return JSON.stringify({ categories });
    }
    return undefined;
}

export default function SearchVideoRoute(): JSX.Element {
    const [videoList, setVideoList] = useState<FileType[]>([]);
    const [category, setCategory] = useState<string>();
    const { loading, progress, data, executePost } = useAPI({ path: 'video' });

    const isInputInvalid = videoList.length === 0 || category === undefined;

    const upload = () => {
        const formData = new FormData();

        if (videoList[0]) {
            const video = videoList[0].blobFile;
            if (video) formData.append('video', video);

            // only appends json categories file if at least one category is defined
            const json = categoriesToJson(category);
            if (json) {
                const blob = new Blob([json], { type: 'application/json' });
                const file = new File([blob], 'categories.json');
                formData.append('categories', file, 'categories.json');
            }

            executePost(formData);
        }
    };

    return (
        <div>
            <Form className={styles.form}>
                <GenericUploader
                    label='Video File'
                    accept={['.mp4']}
                    fileList={videoList}
                    onChange={setVideoList}
                />
                <FormGroup>
                    <ControlLabel>Categories</ControlLabel>
                    <FormControl
                        name='categories'
                        value={category}
                        onChange={setCategory}
                    />
                </FormGroup>
                <UploadControls
                    onUpload={upload}
                    disabled={isInputInvalid}
                    loading={loading}
                    progress={progress}
                />
            </Form>
            <ImageGrid>
                {data && Object.keys(data).map(key => {
                    const image_content = data[key][0];
                    const image_url = 'data:image/jpeg;base64,' + image_content;
                    return <ImageGridItem key={key} imageUrl={image_url} title={key} />;
                })}
            </ImageGrid>
        </div>
    );
}
