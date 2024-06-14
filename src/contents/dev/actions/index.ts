import { render } from '../Button';
import { Action, RenderAction } from './base.ts';
import { listAction } from './list-action.ts';

const actions: Action[] = [
  listAction,
];

function inject(target: Element, index: number, actions: Array<RenderAction> | RenderAction) {
  const div = document.createElement('div');
  div.className = '__inject_from_plugin';
  target.appendChild(div);
  const props = (Array.isArray(actions) ? actions : [actions])
    .map(({ name, execute }) => ({
      name,
      onClick: () => execute(index),
    }));
  render(div, { actions: props });
}

export function process(path: string, searchParams: string) {
  actions.forEach(async action => {
    if (action.isTarget(path, new URLSearchParams(searchParams))) {
      await action.wait();
      if (!action.renderActions || (Array.isArray(action.renderActions) && !action.renderActions.length)) {
        return;
      }
      const containers = document.querySelectorAll(action.injectTarget);
      if (containers.length === 0) {
        return;
      }
      containers.forEach((container, index) =>
        inject(container, index, action.renderActions));
    }
  });
}
