import { useReducer, useState } from 'react';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Alert } from 'rsuite';

/** URL of the API used as base for all requests. */
const API_BASE_URL = 'http://localhost:8080';

/** Duration an alert is shown for in milliseconds. */
const ALERT_DURATION = 8000;

/**
 * Represents the action object used to update the state using the reducer.
 */
interface IAction {
    /** Type of action to be used for updating the state. */
    type: 'loading' | 'success' | 'error';
    /** Value to provide when updating the state on success. */
    successValue?: AxiosResponse;
    /** Value to provide when updating the state on failure. */
    errorValue?: AxiosError;
}

/**
 * Represents the state of an API request.
 */
interface IState {
    /** Indicates network request state. True if the request is in progress, false otherwise. */
    loading: boolean;
    /** Data returned by the API call. Undefined while loading, or if the request failed. */
    data?: any;
    /** Error caused by the API call. Undefined while loading, or if the request succeeded. */
    error?: AxiosError;
}

const defaultState: IState = {
    loading: false,
    data: undefined,
    error: undefined
};

/**
 * Properties to interact with the API.
 */
type APIProperties = {
    /** Upload progress of the API call in percent. Undefined if the request is complete. */
    progress?: number;
    /**
     * Function to trigger an upload to the API.
     * @param data Data to upload to the API.
     */
    executePost(data: any): void;
} & IState;

/**
 * Hook for using the API.
 *
 * @param path Relative path used to initialise what API endpoint to use.
 */
export function useAPI({ path }: { path: string }): APIProperties {
    const [progress, setProgress] = useState<number>();
    const [state, dispatch] = useReducer((_state: IState, action: IAction) => {
        switch (action.type) {
            case 'loading':
                return { ...defaultState, loading: true };
            case 'success':
                return { ...defaultState, data: action.successValue };
            case 'error':
                return { ...defaultState, error: action.errorValue };
        }
    }, defaultState);

    const config: AxiosRequestConfig = {
        onUploadProgress: p => setProgress(Math.round((p.loaded / p.total) * 100))
    };

    const executePost = async (data: any) => {
        dispatch({ type: 'loading' });
        try {
            const response = await axios.post(`${API_BASE_URL}/${path}`, data, config);
            dispatch({ type: 'success', successValue: response.data });
        } catch (err) {
            const error = err as AxiosError;
            dispatch({ type: 'error', errorValue: error });
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
