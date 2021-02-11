import React, { useEffect, useState } from 'react';

import axios from 'axios';
import ReactMarkdown from 'react-markdown';

import { API_BASE_URL } from 'hooks/useAPI';

import styles from './AboutRoute.module.css';

/**
 * Displays the README.md file.
 */
export default function AboutRoute(): JSX.Element {
  const [mdText, setMdText] = useState('');

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/Cameramorphic/classify-images/master/README.md')
      .then(response => setMdText(response.data))
      .catch(() => setMdText('The README file couldn\'t be fetched from GitHub.'));
  }, []);

  return (
    <div className={styles.mdContainer}>
      <ReactMarkdown source={mdText} />
      <div className={styles.backendLinks}>
        <h4>Backend Documentation</h4>
        Go to <a href={`${API_BASE_URL}/doc/app`} target='_blank' rel='noreferrer'>App</a> or <a href={`${API_BASE_URL}/doc/preprocessing`} target='_blank' rel='noreferrer'>Preprocessing</a>.
      </div>
    </div>
  );
}
