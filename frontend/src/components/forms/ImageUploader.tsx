import React from 'react';

import { ControlLabel, FormGroup, Uploader } from 'rsuite';

import { GenericUploaderProps, validateOnChange } from './GenericUploader';

const acceptDefault = ['.png', '.jpg', '.jpeg'];

type IProps = GenericUploaderProps;

export default function ImageUploader({ label, accept = acceptDefault, fileList, onChange }: IProps): JSX.Element {
    const uploader =
        <Uploader
            fileList={fileList}
            onChange={list => validateOnChange(list, accept, onChange)}
            accept={accept.join()}
            multiple
            draggable
            autoUpload={false}
            listType='picture'
        >
            <div style={{ lineHeight: '62px', fontSize: '25px' }}>+</div>
        </Uploader>;

    return label
        ? <FormGroup>
            <ControlLabel>{label}</ControlLabel>
            {uploader}
        </FormGroup>
        : uploader;
}
