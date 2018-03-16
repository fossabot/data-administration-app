import React from 'react';

import { Card, CardText } from 'material-ui';
import { getDocsKeyForSection } from '../sections.conf';
import * as conf from './data.integrity.conf';

import Page from '../Page';
import DataIntegrityCard from './data-integrity-card/DataIntegrityCard';
import { ERROR, LOADING, SUCCESS } from '../../components/feedback-snackbar/FeedbackSnackbarTypes';
import PageHelper from '../../components/page-helper/PageHelper';

import styles from './DataIntegrity.css';

class DataIntegrity extends Page {
    static STATE_PROPERTIES = [
        'cards',
        'loaded',
        'loading',
    ];

    constructor() {
        super();

        this.state = {
            cards: null,
            intervalId: null,
            loaded: false,
            loading: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        const nextState = {};

        Object.keys(nextProps).forEach((property) => {
            if (nextProps.hasOwnProperty(property) && DataIntegrity.STATE_PROPERTIES.includes(property)) {
                nextState[property] = nextProps[property];
            }
        });

        if (nextState !== {}) {
            this.setState(nextState);
        }
    }

    componentDidMount() {
        if (!this.state.loading) {
            this.initDataIntegrityCheck();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.cancelPullingRequests();
    }

    cancelPullingRequests() {
        clearInterval(this.state.intervalId);
    }

    setLoadingPageState() {
        const translator = this.context.translator;
        this.context.updateAppState({
            showSnackbar: true,
            snackbarConf: {
                type: LOADING,
                message: translator('Performing data integrity checks...'),
            },
            currentSection: this.props.sectionKey,
            pageState: {
                loaded: false,
                loading: true,
            },
        });
    }

    setLoadedPageWithErrorState(error) {
        const translator = this.context.translator;
        const messageError = error && error.message ?
            error.message :
            translator('An unexpected error happened during data integrity checks');
        this.cancelPullingRequests();
        this.context.updateAppState({
            showSnackbar: true,
            snackbarConf: {
                type: ERROR,
                message: messageError,
            },
            currentSection: this.props.sectionKey,
            pageState: {
                loaded: true,
                loading: false,
            },
        });
    }

    initDataIntegrityCheck() {
        const api = this.context.d2.Api.getApi();
        this.setLoadingPageState();
        api.post(conf.INIT_ENDPOINT).then(() => {
            if (this.isPageMounted()) {
                this.state.intervalId = setInterval(() => {
                    this.requestTaskStatus();
                }, conf.PULL_INTERVAL);
            }
        }).catch((e) => {
            if (this.isPageMounted()) {
                this.setLoadedPageWithErrorState(e);
            }
        });
    }

    requestTaskStatus() {
        const api = this.context.d2.Api.getApi();
        api.get(conf.PULL_ENDPOINT).then((response) => {
            if (this.isPageMounted()) {
                if (response.length) {
                    this.cancelPullingRequests();
                    this.loadData();
                }
            }
        }).catch((e) => {
            if (this.isPageMounted()) {
                this.setLoadedPageWithErrorState(e);
            }
        });
    }

    loadData() {
        const api = this.context.d2.Api.getApi();
        const translator = this.context.translator;
        api.get(conf.DATA_ENDPOINT).then((response) => {
            if (this.isPageMounted()) {
                this.context.updateAppState({
                    showSnackbar: true,
                    snackbarConf: {
                        type: SUCCESS,
                        message: translator('Data integrity checks performed with success'),
                    },
                    currentSection: this.props.sectionKey,
                    pageState: {
                        loaded: true,
                        cards: response,
                        loading: false,
                    },
                });
            }
        }).catch((e) => {
            if (this.isPageMounted()) {
                this.setLoadedPageWithErrorState(e);
            }
        });
    }

    render() {
        const translator = this.context.translator;
        const noContent = (
            <Card>
                <CardText>{translator('No data to show.')}</CardText>
            </Card>
        );
        let cardsToShow = [];
        if (this.state.cards) {
            const errorElementskeys = Object.keys(this.state.cards);
            cardsToShow = errorElementskeys.map(element => (
                <DataIntegrityCard
                    key={element}
                    title={
                        conf.dataIntegrityControls.find(
                            control => control.key === element).label
                    }
                    content={this.state.cards[element]}
                />
            ));
            if (this.state.loaded) {
                const noErrors = conf.dataIntegrityControls
                    .filter(
                        element => errorElementskeys.indexOf(element.key) < 0,
                    ).map(
                        resultNoErrorElement => (
                            <DataIntegrityCard
                                key={resultNoErrorElement.key}
                                title={resultNoErrorElement.label}
                                content={[]}
                            />
                        ),
                    );
                cardsToShow.push(noErrors);
            }
        }
        return (
            <div className={styles.maxWith}>
                <h1 className={styles.header}>
                    { translator(conf.PAGE_TITLE) }
                    <PageHelper
                        sectionDocsKey={getDocsKeyForSection(this.props.sectionKey)}
                    />
                </h1>
                {cardsToShow && cardsToShow.length > 0 ? cardsToShow : noContent}
            </div>
        );
    }
}

export default DataIntegrity;
