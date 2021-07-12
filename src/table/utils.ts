import { VcError } from '../vc/index';
/**
 * 10px -> 10
 * 10 -> 10
 */
export const parseHeight = height => {
	if (typeof height === 'number') {
		return height;
	}
	if (height && typeof height === 'string') {
		if (/^\d+(?:px)?/.test(height)) {
			return parseInt(height, 10);
		}
		throw new VcError('table', 'Invalid Height');
	}
	return null;
};

export const parseWidth = (width) => {
	if (width !== undefined) {
		width = parseInt(width, 10);
		if (isNaN(width)) {
			width = null;
		}
	}
	return width;
};

export const parseMinWidth = (minWidth) => {
	if (typeof minWidth !== 'undefined') {
		minWidth = parseWidth(minWidth);
		if (isNaN(minWidth)) {
			minWidth = 80;
		}
	}
	return minWidth;
};

/**
 * 行 -> 唯一key
 */
export const getRowIdentity = (row, rowKey) => {
	if (row.__KEY__) return row.__KEY__;
	if (!row) throw new VcError('table', 'row is required when get row identity');
	if (typeof rowKey === 'string') {
		if (!rowKey.includes('.')) {
			return row[rowKey];
		}
		let key = rowKey.split('.');
		let current = row;
		for (let i = 0; i < key.length; i++) {
			current = current[key[i]];
		}
		return current;
	} else if (typeof rowKey === 'function') {
		return rowKey.call(null, row);
	}
};

/**
 * 
 */
export const walkTreeNode = (root, cb, opts = {}) => {
	const {
		childrenKey = 'children',
		lazyKey = 'hasChildren',
		level: baseLevel = 0
	} = opts;

	const isNil = (array) => !(Array.isArray(array) && array.length);

	function _walker(parent, children, level) {
		cb(parent, children, level);
		children.forEach(item => {
			if (item[lazyKey]) {
				cb(item, null, level + 1);
				return;
			}
			const $children = item[childrenKey];
			if (!isNil($children)) {
				_walker(item, $children, level + 1);
			}
		});
	}

	root.forEach(item => {
		if (item[lazyKey]) {
			cb(item, null, baseLevel);
			return;
		}
		const children = item[childrenKey];
		if (!isNil(children)) {
			_walker(item, children, baseLevel);
		}
	});
};

/**
 * 
 */
export const getKeysMap = (array = [], rowKey) => {
	const arrayMap = {};
	array.forEach((row, index) => {
		arrayMap[getRowIdentity(row, rowKey)] = { row, index };
	});
	return arrayMap;
};

/**
 * 
 */
export const getColumnById = (table, columnId) => {
	let column = null;
	table.columns.forEach(item => {
		if (item.id === columnId) {
			column = item;
		}
	});
	return column;
};

/**
 * 
 */
export const getColumnByKey = (table, columnKey) => {
	let column = null;
	for (let i = 0; i < table.columns.length; i++) {
		const item = table.columns[i];
		if (item.columnKey === columnKey) {
			column = item;
			break;
		}
	}
	return column;
};


/**
 * 
 */
export const getColumnByCell = (table, cell) => {
	const matches = (cell.className || '').match(/vc-table_[^\s]+/gm);
	if (matches) {
		return getColumnById(table, matches[0]);
	}
	return null;
};

/**
 * 
 */
export const getCell = (event) => {
	let cell = event.target;

	while (cell && cell.tagName.toUpperCase() !== 'HTML') {
		if (cell.tagName.toUpperCase() === 'TD') {
			return cell;
		}
		cell = cell.parentNode;
	}

	return null;
};

export const Mixins = (cls, ...list) => {
	cls.prototype.onReady = cls.prototype.onReady ? [cls.prototype.onReady] : [];
	for (let _cl of list) {
		for (let key of Object.getOwnPropertyNames(_cl.prototype)) {
			if (key === 'onReady') {
				cls.prototype[key].push(_cl.prototype[key]);
			} else {
				cls.prototype[key] = _cl.prototype[key];
			}
		}
	}
	return cls;
};