/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

let attach;

function createEnvironment(records: Object) {
  const store = {
    __log: null,
    getSource: () => ({
      toJSON: () => records,
    }),
  };
  const environment = {
    __log: jest.fn<[Object], void>(),
    configName: 'Test Environment',
    getStore: () => store,
  };
  return { environment, store };
}

describe('EnvironmentWrapper', () => {
  beforeEach(() => {
    attach = require('src/backend/EnvironmentWrapper').attach;
  });

  it('sanitizes circular store records', () => {
    const carrier: any = { slots: [] };
    const handoffSlot = {
      __relayRscHandoffSlot: true,
      carrier,
      slotKey: 'root-slot',
    };
    carrier.slots.push({
      node: { props: { slotKey: handoffSlot } },
      slotKey: 'nested-slot',
    });
    const { environment } = createEnvironment({
      root: {
        __id: 'root',
        rsc: handoffSlot,
      },
    });
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);

    expect(() => wrapper.sendStoreRecords()).not.toThrow();

    const payload = hook.emit.mock.calls[0][1];
    expect(payload.records.root.rsc.carrier.slots[0].node.props.slotKey).toBe(
      '[Circular]'
    );
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('preserves own __proto__ properties without changing the prototype', () => {
    const record = JSON.parse('{"__id":"root","__proto__":{"value":1}}');
    const { environment } = createEnvironment({ root: record });
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);

    wrapper.sendStoreRecords();

    const clonedRecord = hook.emit.mock.calls[0][1].records.root;
    expect(Object.keys(clonedRecord)).toContain('__proto__');
    expect(clonedRecord.__proto__).toEqual({ value: 1 });
    expect(Object.getPrototypeOf(clonedRecord)).toBe(Object.prototype);
    expect(JSON.stringify(clonedRecord)).toContain('"__proto__":{"value":1}');
  });

  it('logs traversal errors and drops the affected subtree', () => {
    const error = new Error('Cannot serialize value');
    const { environment } = createEnvironment({
      broken: {
        toJSON() {
          throw error;
        },
      },
      healthy: { value: 1 },
    });
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);
    spyOn(console, 'warn');

    wrapper.sendStoreRecords();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('dropped uncloneable subtree'),
      error
    );
    expect(hook.emit.mock.calls[0][1].records).toEqual({
      broken: '[Uncloneable]',
      healthy: { value: 1 },
    });
  });

  it('falls back to empty records when the root cannot be cloned', () => {
    const error = new Error('Cannot read record');
    const records: Object = {};
    Object.defineProperty(records, 'broken', {
      enumerable: true,
      get() {
        throw error;
      },
    });
    const { environment } = createEnvironment(records);
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);
    spyOn(console, 'warn');

    wrapper.sendStoreRecords();

    expect(console.warn).toHaveBeenCalledWith(
      'makeCloneable: dropped uncloneable subtree at records["broken"]',
      error
    );
    expect(
      console.warn
    ).toHaveBeenCalledWith(
      'sendStoreRecords: unable to clone store records; emitting empty records',
      { environmentName: 'Test Environment', rendererID: 1 }
    );
    expect(hook.emit.mock.calls[0][1].records).toEqual({});
  });

  it('logs invalid root snapshots but not legitimately empty stores', () => {
    const { environment } = createEnvironment((null: any));
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 2, (environment: any), global);
    spyOn(console, 'warn');

    wrapper.sendStoreRecords();

    expect(
      console.warn
    ).toHaveBeenCalledWith(
      'sendStoreRecords: unable to clone store records; emitting empty records',
      { environmentName: 'Test Environment', rendererID: 2 }
    );
    expect(hook.emit.mock.calls[0][1].records).toEqual({});
    expect(console.warn).toHaveBeenCalledTimes(1);

    const { environment: emptyEnvironment } = createEnvironment({});
    const emptyWrapper = attach(
      (hook: any),
      3,
      (emptyEnvironment: any),
      global
    );
    emptyWrapper.sendStoreRecords();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(hook.emit.mock.calls[1][1].records).toEqual({});
  });

  it('includes the full path of nested traversal errors', () => {
    const error = new TypeError('Cannot serialize nested value');
    const broken = {
      toJSON() {
        throw error;
      },
    };
    const { environment } = createEnvironment({
      'client:root': {
        values: [broken],
        map: new Map([[broken, broken]]),
        set: new Set([broken]),
      },
    });
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);
    spyOn(console, 'warn');

    wrapper.sendStoreRecords();

    [
      'records["client:root"]["values"][0]',
      'records["client:root"]["map"][0][0]',
      'records["client:root"]["map"][0][1]',
      'records["client:root"]["set"][0]',
    ].forEach(path => {
      expect(console.warn).toHaveBeenCalledWith(
        `makeCloneable: dropped uncloneable subtree at ${path}`,
        error
      );
    });
    expect(hook.emit.mock.calls[0][1].records['client:root']).toEqual({
      values: ['[Uncloneable]'],
      map: [['[Uncloneable]', '[Uncloneable]']],
      set: ['[Uncloneable]'],
    });
  });

  it('drops values that throw during cloneability checks', () => {
    const revoked: any = Proxy.revocable({}, {});
    revoked.revoke();
    const { environment } = createEnvironment({
      broken: revoked.proxy,
      healthy: { value: 1 },
    });
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);
    spyOn(console, 'warn');

    wrapper.sendStoreRecords();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('dropped uncloneable subtree'),
      expect.anything()
    );
    expect(hook.emit.mock.calls[0][1].records).toEqual({
      healthy: { value: 1 },
    });
  });

  it('sanitizes unsupported values nested in event arrays', () => {
    const { environment } = createEnvironment({});
    const hook = { emit: jest.fn<[string, any], void>() };
    const wrapper = attach((hook: any), 1, (environment: any), global);
    wrapper.flushInitialOperations();
    hook.emit.mockClear();

    const callback = () => {};
    const firstMapKey = { key: 'first' };
    const secondMapKey = { key: 'second' };
    environment.__log({
      name: 'network.next',
      response: {
        extensions: {
          relayRscGeneration: {
            slots: [
              {
                node: { value: [callback, Symbol('symbol'), undefined] },
                slotKey: 'root-slot',
              },
            ],
          },
        },
        map: new Map([
          ['entry', { callback, value: 1 }],
          ['__proto__', { value: 2 }],
          [firstMapKey, 'first'],
          [secondMapKey, 'second'],
        ]),
        set: new Set([1, callback]),
      },
    });

    const event = hook.emit.mock.calls[0][1].data;
    expect(
      event.response.extensions.relayRscGeneration.slots[0].node.value
    ).toEqual([null, null, null]);
    expect(event.response.map).toEqual([
      ['entry', { value: 1 }],
      ['__proto__', { value: 2 }],
      [{ key: 'first' }, 'first'],
      [{ key: 'second' }, 'second'],
    ]);
    expect(event.response.set).toEqual([1, null]);
    expect(() => JSON.stringify(event)).not.toThrow();
  });
});
