#!/usr/bin/env node

import importLocal from 'import-local';
import npmlog from 'npmlog';
import core from '../lib/index.js'

if (importLocal(import.meta.url)) {
	console.log('Using local version of this package');
    npmlog.info('cli','正在使用 coo 本地版本');
} else {
	core();
}