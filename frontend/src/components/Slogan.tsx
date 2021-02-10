import React from 'react';

import clx from 'classnames';
import Particles from 'react-particles-js';

import styles from './Slogan.module.css';

interface IProps {
    text?: string;
    small?: boolean;
}

export default function Slogan({ text, small }: IProps) {
    return (
        <div className={clx(styles.sloganArea, small && styles.small)}>
            <div className={styles.slogan}>
                {text ?? 'AI powered image classification'}
            </div>
            <Particles
                className={clx(styles.particles, small && styles.small)}
                params={{
                    particles: {
                        number: {
                            value: 150,
                            density: {
                                enable: true,
                                value_area: 800
                            }
                        },
                        color: {
                            value: '#ffffff'
                        },
                        opacity: {
                            value: 0.5,
                            random: false,
                            anim: {
                                enable: false,
                                speed: 1,
                                opacity_min: 0.1,
                                sync: false
                            }
                        },
                        size: {
                            value: 3,
                            random: true,
                            anim: {
                                enable: false,
                                speed: 40,
                                size_min: 0.1,
                                sync: false
                            }
                        },
                        line_linked: {
                            enable: true,
                            distance: 150,
                            color: '#ffffff',
                            opacity: 0.4,
                            width: 1
                        },
                        move: {
                            enable: !small,
                            speed: 2,
                            direction: 'none',
                            random: false,
                            straight: false,
                            out_mode: 'bounce',
                            bounce: false,
                            attract: {
                                enable: false,
                                rotateX: 600,
                                rotateY: 1200
                            }
                        }
                    },
                    interactivity: {
                        detect_on: 'window',
                        events: {
                            onhover: {
                                enable: !small,
                                mode: 'bubble'
                            },
                            resize: true
                        },
                        modes: {
                            grab: {
                                distance: 400,
                                line_linked: {
                                    opacity: 1
                                }
                            },
                            bubble: {
                                distance: 300,
                                size: 5,
                                duration: 2,
                                opacity: 1
                            },
                            repulse: {
                                distance: 200,
                                duration: 0.4
                            },
                            push: {
                                particles_nb: 4
                            },
                            remove: {
                                particles_nb: 2
                            }
                        }
                    },
                    retina_detect: true
                }}
            />
        </div>
    );
}
