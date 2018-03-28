/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import PropTypes from 'prop-types';
import AnimateOnChange from 'react-animate-on-change';
import Header from './Header';
import Collapsable from './Collapsable';
import {shallowArraysEqual} from '../../util/objCompare';

export const NON_EXISTENT = {};

export default class RecordFields extends React.Component {
  loadFromSnapshot() {
    const {path, snapshot, otherSnapshot} = this.props;
    const {id} = path[path.length - 1];

    if (!snapshot) {
      return {
        record: this.props.fetchedRecords[id],
        previousRecord: this.previousRecord,
      };
    }
    const record = snapshot[id];
    const previousRecord = otherSnapshot[id];

    return {
      record,
      previousRecord,
    };
  }

  shouldAnimate() {
    return false;
  }

  getSelfClass() {
    return RecordFields;
  }

  isPathOpened = path => {
    return this.props.pathOpened[stringifyPath(path)];
  };

  getChildContext() {
    return {
      isPathOpened: this.isPathOpened,
    };
  }

  makeFocusButtonHandler(id, name) {
    const {path} = this.props;
    const {navigateToPath} = this.context;
    return e => {
      e.stopPropagation();
      navigateToPath([...path, {id, name}]);
    };
  }

  renderObject(object, prevObject) {
    const rendered = [];
    const deemphasized = [];

    Object.keys(object).forEach(key => {
      const prevExists =
        prevObject &&
        prevObject !== NON_EXISTENT &&
        typeof prevObject === 'object';

      const prev = prevExists ? prevObject[key] : NON_EXISTENT;

      const el = this.renderChild(object[key], prev, key);
      if (key.startsWith('__')) {
        deemphasized.push(el);
      } else {
        rendered.push(el);
      }
    });

    return [...rendered, ...deemphasized];
  }

  renderArray(array, prev, key) {
    const {path} = this.props;

    const different = !shallowArraysEqual(array, prev);
    const animate = this.shouldAnimate() && different;
    const additionalClasses = different ? 'diff' : '';
    const header = (
      <AnimateOnChange
        baseClassName={'header-container ' + additionalClasses}
        animationClassName="header-container--updated"
        animate={animate}>
        <Header keyName={key} summary={`${array.length} elements`} />
      </AnimateOnChange>
    );
    const newPath = [...path, {id: key}];

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <ul>{array.map((el, i) => this.renderChild(el, prev[i], i))}</ul>
        </Collapsable>
      </li>
    );
  }

  renderRefs(refs, prev, key) {
    const {getType} = this.context;
    const {path, snapshot, otherSnapshot, pathOpened} = this.props;

    const children = refs.map((ref, i) => {
      const name = `${key}[${i}]`;
      const newPath = [...path, {id: ref, name}];
      const clickHandler = this.makeFocusButtonHandler(ref, name);
      const summary = ref.startsWith('client:') ? null : ref;

      const different = !(Array.isArray(prev) && ref === prev[i]);
      const animate = this.shouldAnimate() && different;
      const additionalClasses = different ? 'diff' : '';
      const header = (
        <AnimateOnChange
          baseClassName={'header-container ' + additionalClasses}
          animationClassName="header-container--updated"
          animate={animate}>
          <Header
            keyName="edge"
            focusHandler={clickHandler}
            value={getType(ref)}
            summary={summary}
            isLink={true}
          />
        </AnimateOnChange>
      );
      const Fields = this.getSelfClass();

      return (
        <li key={i}>
          <Collapsable header={header} path={newPath}>
            <Fields
              path={newPath}
              pathOpened={pathOpened}
              getType={getType}
              snapshot={snapshot}
              otherSnapshot={otherSnapshot}
            />
          </Collapsable>
        </li>
      );
    });

    const different = !shallowArraysEqual(refs, prev);
    const animate = this.shouldAnimate() && different;
    const additionalClasses = different ? 'diff' : '';
    const header = (
      <AnimateOnChange
        baseClassName={'header-container ' + additionalClasses}
        animationClassName="header-container--updated"
        animate={animate}>
        <Header keyName={key} summary={`${refs.length} elements`} />
      </AnimateOnChange>
    );
    const newPath = [...path, {id: key, name: key}];

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <ul>{children}</ul>
        </Collapsable>
      </li>
    );
  }

  renderRef(ref, prev, key) {
    const {getType} = this.context;
    const {path, snapshot, otherSnapshot, pathOpened} = this.props;

    const newPath = [...path, {id: ref, name: key}];
    const clickHandler = this.makeFocusButtonHandler(ref, key);
    const summary = ref.startsWith('client:') ? null : ref;

    const different = ref !== prev;
    const animate = this.shouldAnimate() && different;
    const additionalClasses = different ? 'diff' : '';
    const header = (
      <AnimateOnChange
        baseClassName={'header-container ' + additionalClasses}
        animationClassName="header-container--updated"
        animate={animate}>
        <Header
          keyName={key}
          focusHandler={clickHandler}
          value={getType(ref)}
          summary={summary}
          isLink={true}
        />
      </AnimateOnChange>
    );
    const Fields = this.getSelfClass();

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <Fields
            path={newPath}
            pathOpened={pathOpened}
            getType={getType}
            snapshot={snapshot}
            otherSnapshot={otherSnapshot}
          />
        </Collapsable>
      </li>
    );
  }

  // Overridable method
  renderScalar(value, prev, key) {
    const different = value !== prev;
    const animate = this.shouldAnimate() && different;
    const additionalClasses = different ? 'diff' : '';

    return (
      <li key={key}>
        <AnimateOnChange
          baseClassName={'header-container ' + additionalClasses}
          animationClassName="header-container--updated"
          animate={animate}>
          <Header keyName={key} value={value} />
        </AnimateOnChange>
      </li>
    );
  }

  renderChild(child, prev, key) {
    if (Array.isArray(child)) {
      const prevExists = prev !== NON_EXISTENT && Array.isArray(prev);
      const prevArray = prevExists ? prev : NON_EXISTENT;
      return this.renderArray(child, prevArray, key);
    }

    if (child !== null && typeof child === 'object') {
      if (child.__ref) {
        const prevExists =
          prev !== NON_EXISTENT &&
          prev &&
          typeof prev === 'object' &&
          prev.__ref;
        const prevRef = prevExists ? prev.__ref : NON_EXISTENT;
        return this.renderRef(child.__ref, prevRef, key);
      }

      if (child.__refs) {
        const prevExists =
          prev !== NON_EXISTENT &&
          prev &&
          typeof prev === 'object' &&
          prev.__refs;
        const prevRefs = prevExists ? prev.__refs : NON_EXISTENT;
        return this.renderRefs(child.__refs, prevRefs, key);
      }

      return (
        <li key={key}>
          <Header keyName={key} />
          <ul>{this.renderObject(child, prev)}</ul>
        </li>
      );
    }

    return this.renderScalar(child, prev, key);
  }

  render() {
    const {record, previousRecord} = this.loadFromSnapshot();

    if (!record) {
      return null;
    }

    return <ul>{this.renderObject(record, previousRecord)}</ul>;
  }
}

RecordFields.contextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
};

RecordFields.childContextTypes = {
  isPathOpened: PropTypes.func,
};

export function stringifyPath(path) {
  return path.map(e => e.id).join('/');
}
