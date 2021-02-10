import React, { useEffect, useState } from 'react';

import ReactMarkdown from 'react-markdown';

import readme from './README.md';

import styles from './AboutRoute.module.css';

/**
 * Displays the readme.md
*/
export default function AboutRoute(): JSX.Element {
  const [mdText, setMdText] = useState('');

  useEffect(() => {
    fetch(readme).then(response => response.text()).then(text => setMdText(text));
  }, []);

  return (
    <div className={styles.mdContainer}>
      <ReactMarkdown source={mdText} />
    </div>
  );
}
