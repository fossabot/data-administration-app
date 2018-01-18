import React from 'react';
import PropTypes from 'prop-types';

// Material UI
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';

import styles from './DataStatistics.css';

const DataStatisticsTable = ({ t, label, elements }) => {
    const rows = elements.map(element => (
        <TableRow key={element.label}>
            <TableRowColumn>{t(element.label)}</TableRowColumn>
            <TableRowColumn>{element.count}</TableRowColumn>
        </TableRow>
    ));
    return (
        <div className={styles.statisticsTable}>
            <Table selectable={false}>
                <TableHeader
                    className={styles.statisticsTableHeader}
                    displaySelectAll={false}
                    adjustForCheckbox={false}
                    enableSelectAll={false}
                >
                    <TableRow>
                        <TableHeaderColumn>{t(label)}</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody
                    displayRowCheckbox={false}
                    stripedRows={false}
                >
                    {rows}
                </TableBody>
            </Table>
        </div>
    );
};

DataStatisticsTable.propTypes = {
    t: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    elements: PropTypes.array.isRequired,
};

export default DataStatisticsTable;