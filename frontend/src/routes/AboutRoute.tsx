import React, { Component } from 'react';

import ReactMarkdown from 'react-markdown'

import { Form } from 'rsuite';

import styles from './AboutRoute.module.css';

import readme from './README.md';

type textState = {
    mdtext: string
}

export default class AboutRoute extends Component<{}, textState> {
    componentWillMount() {
      fetch(readme).then((response) => response.text()).then((text) => {
        this.setState({ mdtext: "text was set" });
      })
    }

    render() {
      return (
        <div>
            <Form className={styles.form}>
                <ReactMarkdown source={this.state.mdtext} />
            </Form>
        </div>
      )
    }
}

// export default function AboutRoute() {
//     var filetext: string;
//     fetch(readme).then((response) => response.text()).then((text) => {
//         filetext = text;
//         return (
//             <div>
//                 <Form className={styles.form}>
//                     <ReactMarkdown source={filetext} />
//                 </Form>
//             </div>
//         );
//     })
// }
