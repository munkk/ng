import View from 'core/view/view';
import Command from 'core/infrastructure/command';
import Shortcut from 'core/infrastructure/shortcut';
import Navigation from 'core/navigation/navigation';
import {GRID_PREFIX} from 'core/definition';


export default class NavigationView extends View {
	constructor(model, markup, apply) {
		super(model);
		this.markup = markup;
		this.model = model;
		this.document = this.markup.document;
		const shortcut = new Shortcut(this.document, apply);
		const navigation = new Navigation(model);
		shortcut.register('navigation', navigation.commands);


		this.blur = new Command({
			execute: (row, column) => {
				this.rows[row].cells[column].classList.remove(`${GRID_PREFIX}-focus`);
			},
			canExecute: (row, column) => {
				return this.rows.length > row
					&& this.rows[row].cells.length > column;
			}
		});
		this.focus = new Command({
			execute: (row, column) => {
				const cell = this.rows[row].cells[column];
				cell.classList.add(`${GRID_PREFIX}-focus`);
			},
			canExecute: (row, column) => {
				return this.rows.length > row
					&& this.rows[row].cells.length > column;
			}
		});
		this.scrollTo = new Command({
			execute: (cell) => {
				this.scroll(markup.body, cell);
			}
		});

		model.navigationChanged.watch(e => {
			const nav = model.navigation();
			const newRow = nav.row == -1 ? 0 : nav.row;
			const newColumn = nav.column == -1 ? 0 : nav.column;
			const oldRow = e && e.changes.hasOwnProperty('row') ? e.changes.row.oldValue : newRow;
			const oldColumn = e && e.changes.hasOwnProperty('column') ? e.changes.column.oldValue : newColumn;

			if (this.blur.canExecute(newRow, newColumn) && oldRow > -1 && oldColumn > -1) {
				this.blur.execute(oldRow, oldColumn);
			}
			if (this.focus.canExecute(newRow, newColumn)) {
				this.focus.execute(newRow, newColumn);
				this.scrollTo.execute(this.rows[newRow].cells[newColumn]);
			}
		});

		model.viewChanged.watch(() => {
			model.navigation({
				column: -1,
				row: -1
			});
		});
	}

	get rows() {
		return this.markup.body.rows;
	}

	scroll(container, target) {
		const outer = container;
		target = target.getBoundingClientRect();
		container = container.getBoundingClientRect();

		if (container.left > target.left
			|| container.left > target.right
			|| container.right < target.left
			|| container.right < target.right) {
			outer.scrollLeft = target.left - container.left + this.model.layout().scroll.left;
		}
		if (container.top > target.top
			|| container.top > target.bottom
			|| container.bottom < target.top
			|| container.bottom < target.bottom) {
			if (container.top < target.top
				|| container.bottom < target.bottom) {
				outer.scrollTop = target.height + this.model.layout().scroll.top;
			} else if (container.top > target.top
				|| container.top > target.bottom) {
				outer.scrollTop = target.top - container.top + this.model.layout().scroll.top;
			}

		}
	}

}