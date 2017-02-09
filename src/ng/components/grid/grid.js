import RootComponent from '../root.component';

export class Grid extends RootComponent {
	constructor($element, $transclude, serviceFactory) {
		super('data', 'selection', 'sort', 'group', 'pivot', 'edit');

		this.$element = $element;
		this.$transclude = $transclude;
		this.serviceFactory = model => serviceFactory.service(model);
	}

	onInit() {
		const model = this.model;
		const service = this.serviceFactory(model);

		let template = null;
		let templateScope = null;

		this.$transclude((clone, scope) => {
			template = clone;
			templateScope = scope;

			this.$element.append(clone);
		});

		template.remove();
		templateScope.$destroy();

		model.selectionChanged.on(e => {
			if (e.changes.hasOwnProperty('items')) {
				this.onSelectionChanged({
					$event: {
						state: model.selection(),
						changes: e.changes
					}
				});
			}
		});

		// TODO: batch invalidate ?
		// TODO: rebind on triggers changed
		model.data()
			.triggers
			.forEach(name =>
				model[name + 'Changed']
					.watch(e => service.invalidate(name, e.changes)));
	}
}

Grid.$inject = ['$element', '$transclude', 'qgrid'];

/**
 * By convention all binding should be named in camelCase like: modelname + [P]ropertyname
 */
export default {
	transclude: true,
	templateUrl: 'qgrid.grid.tpl.html',
	controller: Grid,
	controllerAs: '$grid',
	bindings: {
		model: '<',
		dataRows: '<rows',
		dataColumns: '<columns',
		dataPipe: '<pipe',
		selectionItems: '<selection',
		selectionMode: '<',
		onSelectionChanged: '&',
		groupBy: '<',
		pivotBy: '<',
		sortBy: '<',
		sortMode: '@',
		editMode: '@'
	}
};