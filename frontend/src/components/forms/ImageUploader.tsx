import React from 'react';

import { ControlLabel, FormGroup, Uploader } from 'rsuite';

import { GenericUploaderProps, validateOnChange } from './GenericUploader';

/** List of default image file extentions. */
const acceptDefault = ['.png', '.jpg', '.jpeg'];

type IProps = Omit<GenericUploaderProps, 'multiple'>;

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
