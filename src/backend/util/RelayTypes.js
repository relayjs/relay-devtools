/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type Disposable = {
  dispose(): void,
};

// Supports legacy SubscribeFunction definitions. Do not use in new code.
export type LegacyObserver<-T> = {|
  +onCompleted?: ?() => void,
  +onError?: ?(error: Error) => void,
  +onNext?: ?(data: T) => void,
|};
