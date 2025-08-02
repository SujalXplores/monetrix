import { createRoot } from 'react-dom/client';

export function renderReactComponent(
  component: React.ReactElement,
  dom: HTMLElement,
) {
  const root = createRoot(dom);
  return {
    render: () => {
      root.render(component);
    },
    unmount: () => {
      root.unmount();
    },
  };
}
