/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import AnimateOnChange from 'react-animate-on-change';

import {NON_EXISTENT} from './constants';
import Header from './Header';
import Collapsable from './Collapsable';
import {shallowArraysEqual} from '../../util/objCompare';
import {stringifyPath} from '../../util/stringifyPath';
import ContaineredRecordFields from '../../containers/LatestRecordFields';

export default class LatestRecordFields extends React.Component<$FlowFixMe> {
  // previousRecordId;
  // previousPath;
  // $FlowFixMe
  constructor(props) {
    super();
    // const {path} = props;
    // const {id} = path[path.length - 1];
    // $FlowFixMe
    this.state = {
      externalData: null,
      // lastId: id,
    };
  }
  // $FlowFixMe
  previousRecordId;

  // static getDerivedStateFromProps(props, state) {
  //   // const {path} = props;
  //   // const {id} = path[path.length - 1];
  //   if (props.path !== state.prevPath) {
  //     const {id} = props;
  //     return {
  //       externalData: null,
  //       prevPath: id,
  //     };
  //   }
  //
  //   // Return null to indicate no change to state.
  //   return null;
  // }

  componentDidMount() {
    // this.setState({externalData: true}, () => {
    const {path} = this.props;
    const {id} = path[path.length - 1];
    this.previousRecordId = id;
    this.props.loadRecord(id);
    // });
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.state.externalData === null) {
  //     const {path} = this.props;
  //     const {id} = path[path.length - 1];

  //     if (
  //       this.props.fetchedRecords === null ||
  //       !this.props.fetchedRecords?.byId[id]
  //     ) {
  //       // console.log(this.props.fetchedRecords?.byId[this.props.id]);
  //       // this.props.loadRecord(id);
  //       // this.previousRecordId = id;
  //       this.setState({externalData: true}, () => {
  //         // const {path} = this.props;
  //         // const {id} = path[path.length - 1];
  //         this.previousRecordId = id;
  //         this.props.loadRecord(id);
  //       });
  //     }
  //   }
  // }

  // componentDidUpdate(prevProps) {
  //   if (!this.fetchedRecords) {
  //     const {path} = this.props;
  //     const {id} = path[path.length - 1];
  //     this.props.loadRecord(id);
  //     this.previousRecordId = id;
  //   }
  // }

  // componentWillReceiveProps(props) {
  //   console.log('componentWillReceiveProps', props);
  //   const {path} = props;
  //   const {id} = path[path.length - 1];
  //   this.previousRecord = props.fetchedRecords.byId[id];
  //   this.props.loadRecord(id);
  // }

  // Due to how "changed" animations are built, it is important to only update
  // this component if something actually changed.
  // Otherwise we are risking to cancel an animation in flight because
  // this.previousRecord is overwritten unecessarily.
  // Ideally we track changes on individual field level.
  // shouldComponentUpdate(nextProps) {
  // if (
  //   nextProps.fetchedRecords.allIds[
  //     nextProps.fetchedRecords.allIds.length - 1
  //   ].__id !== this.props.selectedRecordId
  // ) {
  //   return true;
  // }
  // const {path} = nextProps;
  // const {id} = path[path.length - 1];
  // console.log(id, path, nextProps, this.props);
  // if (nextProps.selectedRecordId !== this.props.selectedRecordId) {
  //   this.previousRecordId = nextProps.selectedRecordId;
  // }
  // if (
  //   nextProps.selectedRecordId &&
  //   nextProps.selectedRecordId !== this.props.selectedRecordId &&
  //   // (!nextProps.fetchedRecords ||
  //   (nextProps.fetchedRecords &&
  //     Array.isArray(nextProps.fetchedRecords.allIds) &&
  //     nextProps.fetchedRecords.allIds.find(
  //       recordId => recordId === nextProps.selectedRecordId,
  //     ))
  // ) {
  //   console.log(
  //     'shouldComponentUpdate, selectedRecordId',
  //     nextProps.selectedRecordId,
  //   );
  //   return true;
  // }
  // else if (nextProps.typeMapping !== this.props.typeMapping) {
  //   return true;
  // } else if (nextProps.pathOpened !== this.props.pathOpened) {
  //   console.log('shouldComponentUpdate, pathOpened', nextProps.pathOpened);
  //   return true;
  // }
  // else if (nextProps.path !== this.props.path) {
  //   console.log('shouldComponentUpdate, path', nextProps.pathOpened);
  //   return true;
  // }

  // return false;
  // }

  // $FlowFixMe
  componentDidUpdate(prevProps, prevState) {
    const {path} = this.props;
    const {id} = path[path.length - 1];
    if (
      this.props.fetchedRecords === null ||
      !this.props.fetchedRecords?.byId[id]
    ) {
      this.props.loadRecord(id, true);
      this.previousRecordId = id;
    }
  }
  // if (
  //   this.previousRecordId !== this.props.selectedRecordId ||
  //   (prevProps.selectedRecordId !== this.props.selectedRecordId &&
  //     this.props.fetchedRecords &&
  //     !this.props.fetchedRecords.byId[this.props.selectedRecordId]) ||
  //   prevProps.path !== this.props.path
  // ) {

  // const {path} = this.props;
  // const {id} = path[path.length - 1];
  // console.log(id, path, prevProps, this.props);
  // if (
  //   this.props.selectedRecordId &&
  //   this.props.selectedRecordId !== prevProps.selectedRecordId &&
  //   (!this.props.fetchedRecords ||
  //     (this.props.fetchedRecords &&
  //       Array.isArray(this.props.fetchedRecords.allIds) &&
  //       !this.props.fetchedRecords.allIds.find(recordId => recordId === id)))
  // ) {
  //   console.log('selectedRecordId componentDidUpdate updating');
  //   this.props.loadRecord(id, true);
  // }
  // else if (prevProps.typeMapping !== this.props.typeMapping) {
  //   return true;
  // }
  // else if (prevProps.pathOpened !== this.props.pathOpened) {
  //   return true;
  // }
  // else if (prevProps.path !== this.props.path) {
  //   if (
  //     this.props.fetchedRecords &&
  //     Array.isArray(this.props.fetchedRecords.allIds) &&
  //     this.props.fetchedRecords.allIds.find(recordId => recordId !== id)
  //   ) {
  //     console.log('his.props.path componentDidUpdate updating');
  //     this.props.loadRecord(id, true);
  //   }
  // }
  // }

  loadFromSnapshot() {
    const {path, snapshot} = this.props;
    const {id} = path[path.length - 1];

    if (!snapshot) {
      const record = this.props?.fetchedRecords?.byId?.[id];
      return {
        record,
        previousRecordId: this.previousRecordId,
      };
    }
    const record = snapshot[id];
    const previousRecordId = id;

    return {
      record,
      previousRecordId,
    };
  }

  shouldAnimate() {
    const {path, fetchedRecords} = this.props;
    const {id} = path[path.length - 1];
    const record = fetchedRecords.byId[id];
    const {previousRecordId} = this;
    return previousRecordId ? previousRecordId === record.__id : false;
  }

  getSelfClass() {
    return ContaineredRecordFields;
  }
  isPathOpened = (path: $FlowFixMe) => {
    return this.props.pathOpened[stringifyPath(path)];
  };

  getChildContext() {
    return {
      isPathOpened: this.isPathOpened,
    };
  }

  makeFocusButtonHandler(id: $FlowFixMe, name: $FlowFixMe) {
    const {path} = this.props;
    const {navigateToPath} = this.context;
    return (e: $FlowFixMe) => {
      e.stopPropagation();
      navigateToPath([...path, {id, name}]);
    };
  }

  renderObject(object: $FlowFixMe, prevObject: $FlowFixMe) {
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

  renderArray(array: $FlowFixMe, prev: $FlowFixMe, key: $FlowFixMe) {
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

  renderRefs(refs: $FlowFixMe, prev: $FlowFixMe, key: $FlowFixMe) {
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

  renderRef(ref: $FlowFixMe, prev: $FlowFixMe, key: $FlowFixMe) {
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
  renderScalar(value: $FlowFixMe, prev: $FlowFixMe, key: $FlowFixMe) {
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

  renderChild(child: $FlowFixMe, prev: $FlowFixMe, key: $FlowFixMe) {
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
    const {record, previousRecordId} = this.loadFromSnapshot();

    if (!record) {
      return null;
    }

    return <ul>{this.renderObject(record, previousRecordId)}</ul>;
  }
}

LatestRecordFields.contextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
};

LatestRecordFields.childContextTypes = {
  isPathOpened: PropTypes.func,
};
