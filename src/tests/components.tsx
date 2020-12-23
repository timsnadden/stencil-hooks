import { Component, Prop, h, Host } from '@stencil/core';
import { ContextProvider } from 'dom-context';
import { useHost } from '../stencil-context';
import { withHooks, useEffect, useState, useDomContext, useDomContextState, useReducer, useMemo, useRef, useCallback } from '../stencil-hooks';
import { mockFunction } from './mockFunction';

@Component({
  tag: 'test-component',
})
export class TestComponent {
  @Prop()
  start = 10;
  provider: ContextProvider<any>;

  @Prop({ reflect: true, mutable: true })
  provided: number;

  constructor() {
    withHooks(this);
  }
  render() {
    // const [count, setCount] = [0, (...args:unknown[])=>{}];
    const [count, setCount, provider] = useDomContextState('domcontext:count', this.start);
    window['provider'] = provider;
    this.provider = provider;
    useEffect(() => {
      window['running'] = true;

      return () => (window['running'] = false);
    }, [setCount]);

    const incr = () => {
      const next = count + 1;
      setCount(next);
      window['provided'] = next;
      this.provided = next;
    };
    const decr = () => setCount(count - 1);
    return (
      <Host>
        <div>{count}</div>
        <button onClick={incr}>Plus</button>
        <slot />
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'test-child',
})
export class ChildComponent {
  constructor() {
    withHooks(this);
    // window['onStatus'] = jest.fn();
    window['renderValue'] = window['renderValue'] || mockFunction();
  }

  render() {
    const count = useDomContext('domcontext:count', { pollingMs: 100, attempts: 2 });

    // Logs every render
    window['renderValue'](count);

    return <div>{count || 'NONE'}</div>;
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'state-child',
})
export class StateChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [count, setCount] = useState(3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => setCount(count + 1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

const CountReducer = (state: number, action: 'plus' | 'minus') => {
  if (action === 'plus') {
    return state + 1;
  } else if (action === 'minus') {
    return state - 1;
  }
};

@Component({
  tag: 'reducer-child',
})
export class ReducerChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [count, dispatch] = useReducer(CountReducer, 3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => dispatch('plus')}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'domstate-child',
})
export class DomStateChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [count, setCount] = useDomContextState('example-context', 3);

    // Logs every render
    window['renderValue'](count);

    return (
      <Host>
        <div>{count || 'NONE'}</div>
        <button onClick={() => setCount(count + 1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

function fibonacci(num) {
  if (num <= 1) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
}

@Component({
  tag: 'memo-child',
})
export class MemoChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [value, setVal] = useState(12);
    const fib = useMemo(() => fibonacci(value), [value]);

    // Logs every render
    window['renderValue'](fib);

    return (
      <Host>
        <div>{fib || 'NONE'}</div>
        <button onClick={() => setVal(value + 1)}>+1</button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'ref-child',
})
export class RefChild {
  constructor() {
    window['renderValue'] = window['renderValue'] || mockFunction();
    withHooks(this);
  }

  render() {
    const [value, setValue] = useState('NONE');
    const myRef = useRef<HTMLSpanElement>(undefined);
    // Logs every render
    window['renderValue'](value);

    return (
      <Host>
        <span ref={el => (myRef.current = el)}>Span1</span>
        <div>{value}</div>
        <button onClick={() => setValue(myRef.current.innerText)}></button>
      </Host>
    );
  }

  disconnectedCallback() {}
}

@Component({
  tag: 'effect-test',
})
export class EffectTest {
  constructor() {
    window['lifecycleCalls'] = window['lifecycleCalls'] || mockFunction();
    withHooks(this);
  }
  render() {
    useEffect(() => {
      window['lifecycleCalls']('useEffect');
      return () => {
        window['lifecycleCalls']('useEffectCleanup');
      };
    }, []);

    window['lifecycleCalls']('render');

    return (
      <Host>
        <div>true</div>
      </Host>
    );
  }
  connectedCallback() {
    window['lifecycleCalls']('connectedCallback');
  }

  disconnectedCallback() {
    window['lifecycleCalls']('disconnectedCallback');
  }
}

@Component({
  tag: 'null-lifecycle-test',
})
export class NullLifecycleTest {
  constructor() {
    window['lifecycleCalls'] = window['lifecycleCalls'] || mockFunction();
    withHooks(this);
  }
  render() {
    window['lifecycleCalls']('render');

    return (
      <Host>
        <div>true</div>
      </Host>
    );
  }
  connectedCallback() {
    window['lifecycleCalls']('connectedCallback');
  }

  disconnectedCallback() {
    window['lifecycleCalls']('disconnectedCallback');
  }
}

@Component({
  tag: 'callbacks-test',
})
export class CallbacksTest {
  constructor() {
    window['mockCallback'] = window['mockCallback'] || mockFunction();
    withHooks(this);
  }
  render() {
    const [count, setCount] = useState(0);
    const triggerOn = count >= 2;

    const callback = useCallback(() => count, [triggerOn]);
    // @ts-ignore
    window['mockCallback'](callback);

    return (
      <Host>
        <div>{count}</div>
        <button onClick={() => setCount(count + 1)}></button>
      </Host>
    );
  }

  disconnectedCallback() {}
}
