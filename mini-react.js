(function () {
  const hookState = new Map();
  const effects = [];
  let currentId = "";
  let hookIndex = 0;
  let rootElement = null;
  let rootContainer = null;
  let renderQueued = false;

  function createElement(type, props, ...children) {
    return { type, props: props || {}, children: children.flat() };
  }

  function hookBucket() {
    if (!hookState.has(currentId)) hookState.set(currentId, []);
    return hookState.get(currentId);
  }

  function useState(initialValue) {
    const id = currentId;
    const bucket = hookBucket();
    const index = hookIndex++;
    if (bucket[index] === undefined) {
      bucket[index] = typeof initialValue === "function" ? initialValue() : initialValue;
    }
    const setState = (nextValue) => {
      const current = hookState.get(id);
      const previous = current[index];
      current[index] = typeof nextValue === "function" ? nextValue(previous) : nextValue;
      scheduleRender();
    };
    return [bucket[index], setState];
  }

  function depsChanged(previous, next) {
    if (!previous || !next || previous.length !== next.length) return true;
    return next.some((value, index) => !Object.is(value, previous[index]));
  }

  function useMemo(factory, deps) {
    const bucket = hookBucket();
    const index = hookIndex++;
    const memo = bucket[index];
    if (!memo || depsChanged(memo.deps, deps)) {
      bucket[index] = { deps, value: factory() };
    }
    return bucket[index].value;
  }

  function useEffect(callback, deps) {
    const bucket = hookBucket();
    const index = hookIndex++;
    const previous = bucket[index];
    if (depsChanged(previous && previous.deps, deps)) {
      effects.push(() => {
        if (previous && typeof previous.cleanup === "function") previous.cleanup();
        const cleanup = callback();
        bucket[index] = { deps, cleanup };
      });
    }
  }

  function setProps(node, props) {
    Object.entries(props || {}).forEach(([name, value]) => {
      if (name === "children" || value === false || value === null || value === undefined) return;
      if (name === "className") {
        node.setAttribute("class", value);
      } else if (name === "style" && typeof value === "object") {
        Object.assign(node.style, value);
      } else if (name.startsWith("on") && typeof value === "function") {
        node.addEventListener(name.slice(2).toLowerCase(), value);
      } else if (name === "disabled") {
        node.disabled = Boolean(value);
      } else if (name === "value") {
        node.value = value;
      } else {
        node.setAttribute(name, value);
      }
    });
  }

  function renderNode(element, path) {
    if (element === null || element === undefined || element === false || element === true) {
      return document.createTextNode("");
    }
    if (typeof element === "string" || typeof element === "number") {
      return document.createTextNode(String(element));
    }
    if (Array.isArray(element)) {
      const fragment = document.createDocumentFragment();
      element.forEach((child, index) => fragment.appendChild(renderNode(child, `${path}.${index}`)));
      return fragment;
    }
    if (typeof element.type === "function") {
      const previousId = currentId;
      const previousIndex = hookIndex;
      currentId = `${path}:${element.type.name || "Component"}`;
      hookIndex = 0;
      const output = element.type({ ...(element.props || {}), children: element.children });
      currentId = previousId;
      hookIndex = previousIndex;
      return renderNode(output, `${path}.r`);
    }
    const node = document.createElement(element.type);
    setProps(node, element.props);
    element.children.forEach((child, index) => node.appendChild(renderNode(child, `${path}.${index}`)));
    if (element.props && element.props.value !== undefined) node.value = element.props.value;
    return node;
  }

  function render() {
    if (!rootContainer || !rootElement) return;
    // Save focus before wiping the DOM
    const active = document.activeElement;
    let refocus = null;
    if (active && rootContainer.contains(active)) {
      refocus = {
        placeholder: active.getAttribute("placeholder"),
        selStart: active.selectionStart,
        selEnd: active.selectionEnd,
      };
    }
    effects.length = 0;
    rootContainer.replaceChildren(renderNode(rootElement, "0"));
    const pending = effects.splice(0);
    pending.forEach((run) => run());
    // Restore focus after render
    if (refocus && refocus.placeholder) {
      const el = rootContainer.querySelector(`[placeholder="${refocus.placeholder}"]`);
      if (el) {
        el.focus();
        if (refocus.selStart !== null && el.setSelectionRange) {
          try { el.setSelectionRange(refocus.selStart, refocus.selEnd); } catch (e) {}
        }
      }
    }
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }

  window.React = { createElement, useEffect, useMemo, useState };
  window.ReactDOM = {
    createRoot(container) {
      rootContainer = container;
      return {
        render(element) {
          rootElement = element;
          render();
        }
      };
    }
  };
})();
