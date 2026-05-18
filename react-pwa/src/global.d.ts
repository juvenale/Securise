declare global {
  interface Window {
    React: any;
    ReactDOM: {
      createRoot(container: Element | DocumentFragment): { render(children: unknown): void };
    };
  }
}

export {};
