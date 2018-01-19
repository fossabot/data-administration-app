import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// d2
import { getInstance } from 'd2/lib/d2';

// Material UI
import { Card, CardText } from 'material-ui/Card';

import DataStatisticsTable from './DataStatisticsTable';

const OBJECT_COUNTS_KEY = 'objectCounts';
const ACTIVE_USERS_KEY = 'activeUsers';
const USER_INVITATIONS_KEY = 'userInvitations';
const DATA_VALUE_COUNT_KEY = 'dataValueCount';
const EVENT_COUNT_KEY = 'eventCount';

const PENDING_INVITATION_ALL_KEY = 'all';
const EXPIRED_INVITATION_KEY = 'expired';

class DataStatisticsPage extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    }

    constructor() {
        super();

        this.state = {
            tables: [],
        };
    }

    componentDidMount() {
        // auxiliar functions
        const objectCountsTableObjectToShowFromServerResponse = (objectCountsResponse) => {
            if (objectCountsResponse) {
                const objectCountsKeys = Object.keys(objectCountsResponse);
                const objectCountsTable = {
                    label: 'Object type',
                    elements: [],
                };

                for (let i = 0; i < objectCountsKeys.length; i++) {
                    const key = objectCountsKeys[i];
                    objectCountsTable.elements.push({
                        label: key,
                        count: objectCountsResponse[key],
                    });
                }

                return objectCountsTable;
            }

            return {};
        };

        const timeLabelFromIntProperty = (intProperty) => {
            let label = 'Last hour';
            if (intProperty === 1) {
                label = 'Today';
            } else if (intProperty > 0) {
                label = `Last ${intProperty} days`;
            }

            return label;
        };

        const activeUsersTableObjectToShowFromServerResponse = (activeUsersResponse) => {
            if (activeUsersResponse) {
                const activeUsersKeys = Object.keys(activeUsersResponse);
                const activeUsersTable = {
                    label: 'Users logged in',
                    elements: [],
                };

                for (let i = 0; i < activeUsersKeys.length; i++) {
                    const key = activeUsersKeys[i];
                    activeUsersTable.elements.push({
                        label: timeLabelFromIntProperty(parseInt(key, 10)),
                        count: activeUsersResponse[key],
                    });
                }

                return activeUsersTable;
            }

            return {};
        };

        const userInvitationsTableObjectToShowFromServerResponse = (userInvitationsResponse) => {
            if (userInvitationsResponse) {
                const userInvitationsTable = {
                    label: 'User account invitations',
                    elements: [],
                };

                if (userInvitationsResponse.hasOwnProperty(PENDING_INVITATION_ALL_KEY)) {
                    userInvitationsTable.elements.push({
                        label: 'Pending invitations',
                        count: userInvitationsResponse[PENDING_INVITATION_ALL_KEY],
                    });
                }

                if (userInvitationsResponse.hasOwnProperty(EXPIRED_INVITATION_KEY)) {
                    userInvitationsTable.elements.push({
                        label: 'Expired invitations',
                        count: userInvitationsResponse[EXPIRED_INVITATION_KEY],
                    });
                }

                return userInvitationsTable;
            }

            return {};
        };

        const dataValueCountsTableObjectToShowFromServerResponse = (dataValueCountsResponse) => {
            if (dataValueCountsResponse) {
                const dataValueCountsKeys = Object.keys(dataValueCountsResponse);
                const dataValueCountsTable = {
                    label: 'Data values',
                    elements: [],
                };

                for (let i = 0; i < dataValueCountsKeys.length; i++) {
                    const key = dataValueCountsKeys[i];
                    dataValueCountsTable.elements.push({
                        label: timeLabelFromIntProperty(parseInt(key, 10)),
                        count: dataValueCountsResponse[key],
                    });
                }

                return dataValueCountsTable;
            }

            return {};
        };

        const eventCountsTableObjectToShowFromServerResponse = (eventCountsResponse) => {
            if (eventCountsResponse) {
                const eventCountsKeys = Object.keys(eventCountsResponse);
                const eventCountsTable = {
                    label: 'Events',
                    elements: [],
                };

                for (let i = 0; i < eventCountsKeys.length; i++) {
                    const key = eventCountsKeys[i];
                    eventCountsTable.elements.push({
                        label: timeLabelFromIntProperty(parseInt(key, 10)),
                        count: eventCountsResponse[key],
                    });
                }

                return eventCountsTable;
            }

            return {};
        };

        // request to GET statistics
        getInstance().then((d2) => {
            const api = d2.Api.getApi();
            api.get('system/statistics').then((response) => {
                this.setState({
                    tables: [
                        objectCountsTableObjectToShowFromServerResponse(response[OBJECT_COUNTS_KEY]),
                        activeUsersTableObjectToShowFromServerResponse(response[ACTIVE_USERS_KEY]),
                        userInvitationsTableObjectToShowFromServerResponse(response[USER_INVITATIONS_KEY]),
                        dataValueCountsTableObjectToShowFromServerResponse(response[DATA_VALUE_COUNT_KEY]),
                        eventCountsTableObjectToShowFromServerResponse(response[EVENT_COUNT_KEY]),
                    ],
                });
            }).catch(() => {
                // TODO show error
                this.setState({
                    tables: [],
                });
            });
        });
    }

    render() {
        const noContent = (
            <Card>
                <CardText>{ this.props.t('No data to show.') }</CardText>
            </Card>
        );

        const tables = this.state.tables.map((table) => {
            if (table && table.label && table.elements.length > 0) {
                return (
                    <DataStatisticsTable
                        key={table.label}
                        t={this.props.t}
                        label={table.label}
                        elements={table.elements}
                    />
                );
            }
            return null;
        }).filter(table => table && !table.empty);

        const content = tables && tables.length > 0 ? tables : noContent;

        return (
            <div>
                <h1>{ this.props.t('Data Statistics') }</h1>
                {content}
            </div>
        );
    }
}

export default DataStatisticsPage;