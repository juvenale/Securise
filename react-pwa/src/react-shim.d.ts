declare module "react" {
  const React: any;
  export default React;
}

declare module "react-dom/client" {
  export function createRoot(container: Element | DocumentFragment): { render(children: unknown): void };
}
