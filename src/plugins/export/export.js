import PluginComponent from '../plugin.component';
import {EXPORT_NAME} from '../definition';
import {Command} from '@grid/core/infrastructure';
import {TemplatePath} from '@grid/core/template';
import {Csv} from '@grid/core/export/csv';
import {download} from '@grid/core/services/download';

TemplatePath
	.register(EXPORT_NAME, () => {
		return {
			model: 'export',
			resource: 'content'
		};
	});

const Plugin = PluginComponent('export');
class Export extends Plugin {
	constructor() {
		super(...arguments);
		this.csv = new Command({
			canExecute: () => this.type === 'csv',
			execute: () => {
				const csv = new Csv();
				const data = csv.write(this.rows, this.columns);
				download(this.id, data, `text/${this.type}`);
			}
		});
	}

	get id() {
		return this.model.grid().id;
	}

	get rows() {
		return this.model.data().rows;
	}

	get columns() {
		return this.model.data().columns;
	}
}

export default Export.component({
	controller: Export,
	controllerAs: '$export',
	bindings: {
		'type': '@'
	}
});