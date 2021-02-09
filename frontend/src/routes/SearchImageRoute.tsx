import React, { useState } from 'react';

import { Form } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import GenericUploader from 'components/forms/GenericUploader';
import ImageUploader from 'components/forms/ImageUploader';
import { UploadControls } from 'components/forms/UploadControls';
import { useAPI } from 'hooks/useAPI';

import styles from './SearchImageRoute.module.css';

/**
 * Creates all the image panels to show the results.
 * @param param0 
 */
function ImagePanel({ imageMap, imageList }: { imageMap: { [key: string]: string }, imageList: FileType[] }) {
    var panels = [];

    for (const key in imageMap) {
        var image = imageList.find(x => x.name === imageMap[key]);
        if (!image) continue;
        var image_url = URL.createObjectURL(image.blobFile);
        panels.push(
            <ImageGridItem key={key}
                imageUrl={image_url}
                title={key}
                subtitle={image?.name}
            />
        );
    }

    return <ImageGrid>{panels}</ImageGrid>;
}

export default function SearchImageRoute() {
    const [imageList, setImageList] = useState<FileType[]>([]);
    const [categoryList, setCategoryList] = useState<FileType[]>([]);
    const { loading, progress, data, executePost } = useAPI({ path: 'image' });

    const isInputInvalid = imageList.length === 0 || categoryList.length !== 1;

    const upload = async () => {
        if (isInputInvalid) return;
        const formData = new FormData();
        imageList.forEach(file => file.blobFile && formData.append('files', file.blobFile))
        const categoryFile = categoryList[0].blobFile;
        if (categoryFile) formData.append('categories', categoryFile);

        executePost(formData);
    };

    return (
        <div>
            <Form className={styles.form}>
                <ImageUploader
                    label='Image Files'
                    fileList={imageList}
                    onChange={setImageList}
                />
                <GenericUploader
                    label='Categories'
                    fileList={categoryList}
                    onChange={setCategoryList}
                    accept={['.csv', '.json']}
                />
                <UploadControls
                    onUpload={upload}
                    disabled={isInputInvalid}
                    loading={loading}
                    progress={progress}
                />
            </Form>
            <ImagePanel imageMap={data} imageList={imageList} />
        </div>
    );
}
