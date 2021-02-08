import { useReducer, useState } from "react";

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { Alert } from "rsuite";

const API_BASE_URL = 'http://localhost:8080';

const ALERT_DURATION = 8000;

interface IAction {
    type: 'loading' | 'success' | 'error';
    value?: AxiosResponse | AxiosError;
}

interface IState {
    loading: boolean;
    data?: any;
    error?: AxiosError;
}

const defaultState: IState = {
    loading: false,
    data: undefined,
    error: undefined
};

export function useAPI({ path }: { path: string }) {
    const [progress, setProgress] = useState<number>();
    const [state, dispatch] = useReducer((_state: any, action: IAction) => {
        switch (action.type) {
            case 'loading':
                return { ...defaultState, loading: true };
            case 'success':
                return { ...defaultState, data: action.value };
            case 'error':
                return { ...defaultState, error: action.value };
        }
    }, defaultState);

    const config: AxiosRequestConfig = {
        onUploadProgress: p => setProgress(Math.round((p.loaded / p.total) * 100))
    };

    const executePost = async (data: any) => {
        dispatch({ type: 'loading' });
        try {
            const response = await axios.post(`${API_BASE_URL}/${path}`, data, config);
            dispatch({ type: 'success', value: response.data });
        } catch (err) {
            const error = err as AxiosError;
            dispatch({ type: 'error', value: error });
            if (error.response) { // api responded with error code outside of range 2xx
                const message = error.response.data.error;
                if (message) Alert.error(message, ALERT_DURATION);
                else Alert.error(`Error ${error.response.status}. An unknown error occurred.`, ALERT_DURATION);
            } else if (error.request) { // request was made but api didn't respond
                Alert.error('Upload failed. The API doesn\'t respond.', ALERT_DURATION);
            } else { // creating the request failed
                Alert.error('Upload failed during request.', ALERT_DURATION);
            }
        }
        setProgress(undefined);
    };

    return {
        loading: state.loading,
        data: state.data,
        error: state.error,
        progress,
        executePost
    };
}
