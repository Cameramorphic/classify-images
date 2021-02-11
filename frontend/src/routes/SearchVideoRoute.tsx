import React, { useState } from 'react';

import { Form } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import GenericUploader from 'components/forms/GenericUploader';
import TextUploader, { TextInputType } from 'components/forms/TextUploader';
import { UploadControls } from 'components/forms/UploadControls';
import { getTextFile } from 'helpers/fileHelper';
import { useAPI } from 'hooks/useAPI';

import styles from './SearchVideoRoute.module.css';

export default function SearchVideoRoute(): JSX.Element {
    const [videoList, setVideoList] = useState<FileType[]>([]);
    const [category, setCategory] = useState<TextInputType>({});
    const { loading, progress, data, executePost } = useAPI({ path: 'video' });

    const isInputInvalid = videoList.length === 0 || !category.hasContent;

    const upload = () => {
        const formData = new FormData();

        if (videoList[0]) {
            const video = videoList[0].blobFile;
            if (video) formData.append('video', video);

            const file = getTextFile(category, 'categories');
            if (file) formData.append('categories', file);

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
                <TextUploader
                    label='Categories'
                    data={category}
                    onChange={setCategory}
                    accept={['.csv', '.json']}
                />
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
