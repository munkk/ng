import Component from '../component';
import {GRID_NAME, TH_CORE_NAME} from '@grid/view/definition';
import {Vscroll} from '@grid/view/services';
import {jobLine} from '@grid/core/services';
import {viewFactory} from '@grid/core/view/view.factory';

class ViewCore extends Component {
	constructor($rootScope, $scope, $element, $timeout, grid, vscroll) {
		super();

		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.element = $element[0];
		this.$timeout = $timeout;
		this.$postLink = this.build;
		this.serviceFactory = grid.service.bind(grid);
		this.vscroll = vscroll;
	}

	build() {
		const model = this.model;
		const root = this.root;
		const table = root.table;
		const commandManager = root.commandManager;
		const gridService = this.serviceFactory(model);
		const vscroll = new Vscroll(this.vscroll, root.applyFactory());
		const selectors = {th: TH_CORE_NAME};
		const injectViewServicesTo = viewFactory(
			model,
			table,
			commandManager,
			gridService,
			vscroll,
			selectors
		);

		this.destroyView = injectViewServicesTo(this);

		// TODO: how we can avoid that?
		this.$scope.$watch(() => {
			if (model.scene().status === 'stop') {
				this.style.invalidate();
			}
		});

		this.watch(gridService);
	}

	watch(service) {
		const job = jobLine(10);
		const model = this.model;
		const triggers = model.data().triggers;

		this.using(model.selectionChanged.watch(e => {
			if (e.hasChanges('items')) {
				this.root.onSelectionChanged({
					$event: {
						state: model.selection(),
						changes: e.changes
					}
				});
			}
		}));

		job(() => service.invalidate('grid'));
		Object.keys(triggers)
			.forEach(name =>
				this.using(model[name + 'Changed']
					.watch(e => {
						const changes = Object.keys(e.changes);
						if (e.tag.behavior !== 'core' && triggers[name].find(key => changes.indexOf(key) >= 0)) {
							job(() => service.invalidate(name, e.changes));
						}
					})));
	}

	onDestroy() {
		super.onDestroy();
		this.destroyView();
	}

	templateUrl(key) {
		return `qgrid.${key}.tpl.html`;
	}

	get model() {
		return this.root.model;
	}

	get visibility() {
		return this.model.visibility();
	}

	get rows() {
		return this.model.data().rows;
	}
}

ViewCore.$inject = [
	'$rootScope',
	'$scope',
	'$element',
	'$timeout',
	'qgrid',
	'vscroll'
];

export default {
	controller: ViewCore,
	controllerAs: '$view',
	templateUrl: 'qgrid.view.tpl.html',
	require: {
		'root': `^^${GRID_NAME}`
	}
};