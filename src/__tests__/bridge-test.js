/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

describe('Bridge', () => {
  let Bridge;

  beforeEach(() => {
    Bridge = require('src/bridge').default;
  });

  it('should shutdown properly', () => {
    const wall = {
      listen: jest.fn(() => () => {}),
      sendAll: jest.fn(),
    };
    const bridge = new Bridge(wall);

    // Check that we're wired up correctly.
    bridge.send('init');
    jest.runAllTimers();
    expect(wall.sendAll).toHaveBeenCalledWith([
      { event: 'init', payload: undefined },
    ]);

    // Should flush pending messages and then shut down.
    wall.sendAll.mockClear();
    bridge.send('update', '1');
    bridge.send('update', '2');
    bridge.shutdown();
    jest.runAllTimers();
    expect(wall.sendAll).toHaveBeenCalledWith([
      { event: 'update', payload: '1' },
      { event: 'update', payload: '2' },
      { event: 'shutdown', payload: undefined },
    ]);

    // Verify that the Bridge doesn't send messages after shutdown.
    spyOn(console, 'warn');
    wall.sendAll.mockClear();
    bridge.send('should not send');
    jest.runAllTimers();
    expect(wall.sendAll).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      'Cannot send message "should not send" through a Bridge that has been shutdown.'
    );
  });
});
