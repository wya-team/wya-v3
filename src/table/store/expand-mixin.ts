import { ref } from 'vue';
import { merge } from 'lodash';
import { getKeysMap, getRowIdentity } from '../utils';

export default class Expand {
	onReady() {
		merge(this.states, {
			defaultExpandAll: false,
			expandRows: []
		});
	}

	updateExpandRows() {
		const { data = [], rowKey, defaultExpandAll, expandRows } = this.states;
		if (defaultExpandAll) {
			this.states.expandRows = data.slice();
		} else if (rowKey) {
			// TODO：这里的代码可以优化
			const expandRowsMap = getKeysMap(expandRows, rowKey);
			this.states.expandRows = data.reduce((prev, row) => {
				const rowId = getRowIdentity(row, rowKey);
				const rowInfo = expandRowsMap[rowId];
				if (rowInfo) {
					prev.push(row);
				}
				return prev;
			}, []);
		} else {
			this.states.expandRows = [];
		}
	}

	toggleRowExpansion(row, expanded) {
		const { expandRows } = this.states;
		const changed = this.toggleRowStatus(expandRows, row, expanded);
		if (changed) {
			this.table.emit('expand-change', row, expandRows.slice());
			this.scheduleLayout();
		}
	}

	setExpandRowKeys(rowKeys) {
		this.assertRowKey();
		// TODO：这里的代码可以优化
		const { data, rowKey } = this.states;
		const keysMap = getKeysMap(data, rowKey);
		this.states.expandRows = rowKeys.reduce((prev, cur) => {
			const info = keysMap[cur];
			if (info) {
				prev.push(info.row);
			}
			return prev;
		}, []);
	}

	isRowExpanded(row) {
		const { expandRows = [], rowKey } = this.states;
		if (rowKey) {
			const expandMap = getKeysMap(expandRows, rowKey);
			return !!expandMap[getRowIdentity(row, rowKey)];
		}
		return expandRows.indexOf(row) !== -1;
	}
}
