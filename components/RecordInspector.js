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
import API from '../api';

import '../css/RecordInspector.less';

export default class RecordInspector extends React.Component {
  constructor(props) {
    super(props);

    const { id, environment } = this.props;
    this.state = {
      path: [{ id, name: id }],
      typeMapping: {},
      pathOpened: {},
    };

    this.recordSubscribers = {};
    this.fetchedRecords = {};

    this.navigateToPath = this.navigateToPath.bind(this);
    this.isPathOpened = this.isPathOpened.bind(this);
    this.openOrClosePath = this.openOrClosePath.bind(this);
    this.getType = this.getType.bind(this);
    this.subscribeForRecord = this.subscribeForRecord.bind(this);
    this.unsubscribeFromRecord = this.unsubscribeFromRecord.bind(this);
    this.refetch = this.refetch.bind(this);
    this.fetchRecord = this.fetchRecord.bind(this);

    this.fetch({ id, environment });

    API.onChange({ environment, callback: this.refetch });
  }

  getChildContext() {
    return {
      navigateToPath: this.navigateToPath,
      isPathOpened: this.isPathOpened,
      openOrClosePath: this.openOrClosePath,
      getType: this.getType,
      subscribeForRecord: this.subscribeForRecord,
      unsubscribeFromRecord: this.unsubscribeFromRecord,
    };
  }

  fetch(props) {
    API.getAllRecordDescriptions(props).then((res, err) => {
      if (err) {
        throw err;
      }

      const typeMapping = {};
      res.forEach(({ id, type }) => (typeMapping[id] = type));
      this.setState({
        typeMapping,
      });
    });
  }

  refetch() {
    this.fetch(this.props);
    Object.keys(this.recordSubscribers).forEach(this.fetchRecord);
  }

  fetchRecord(id) {
    const { environment } = this.props;

    API.getRecord({ environment, id }).then((record, err) => {
      if (err) {
        throw err;
      }

      const callbacks = this.recordSubscribers[id] || [];
      this.fetchedRecords[id] = record;

      callbacks.forEach(cb => cb(record));
    });
  }

  subscribeForRecord(id, callback) {
    const {
      recordSubscribers,
      fetchedRecords,
    } = this;
    if (!recordSubscribers[id]) {
      recordSubscribers[id] = [ callback ];
      this.fetchRecord(id);
    } else {
      recordSubscribers[id].push(callback);
      callback(fetchedRecords[id]);
    }
  }

  unsubscribeFromRecord(id, callback) {
    const { recordSubscribers } = this;
    if (recordSubscribers[id]) {
      recordSubscribers[id] =
        recordSubscribers[id].filter(cb => cb === callback);
    }
    if (!recordSubscribers[id].length) {
      delete recordSubscribers[id];
    }
  }

  getType(id) {
    const { typeMapping } = this.state;
    return typeMapping[id];
  }

  _stringifyPath(path) {
    return path.map(e => e.id).join('/');
  }

  isPathOpened(path) {
    return this.state.pathOpened[this._stringifyPath(path)];
  }

  openOrClosePath(path) {
    const stringified = this._stringifyPath(path);
    const pathOpened = Object.assign({}, this.state.pathOpened, {
      [stringified]: !this.state.pathOpened[stringified],
    });

    this.setState({
      pathOpened,
    });
  }

  componentWillReceiveProps({ id, environment }) {
    if (this.props.id === id && this.props.environment === environment) {
      return;
    }

    if (this.props.environment !== environment) {
      API.stopObservingChange(this.props);
      API.onChange({ environment, callback: this.refetch });
    }

    this.setState({
      path: [{ id, name: id }],
      fetchedRecords: {},
    });
  }

  navigateToPath(path) {
    this.setState({
      path,
    });
  }

  render() {
    const { environment, id } = this.props;
    const { path, typeMapping } = this.state;

    if (!id) {
      return <div className="placeholder">Select a record to display</div>;
    }

    const makePathElement = ({ id, name }, i) => {
      const handler = e => {
        this.setState({
          path: path.slice(0, i + 1),
        });
      };

      return (
        <a key={id} onClick={handler}>
          {name}
        </a>
      );
    };

    const expand = () => {
      this.navigateToPath(path.slice(0, path.length - 1));
    };

    const ellipsis =
      path.length > 1
        ? <div className="ellipsis" onClick={expand}>
            {' '}…{' '}
          </div>
        : null;

    return (
      <div className="record-inspector">
        <div className="nav">
          {path.map(makePathElement)}
        </div>
        <div className="root-header">
          {ellipsis}
          <br />
          <span className="link-desc">
            {this.getType(id)}
          </span>
        </div>
        <RecordFields path={path} />
      </div>
    );
  }
}

const NON_EXISTENT = {};
class RecordFields extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      record: null,
    };

    this.previousRecord = null;
    this.onNewRecord = this.onNewRecord.bind(this);
  }

  componentDidMount() {
    const { path } = this.props;
    const { id } = path[path.length - 1];
    this.context.subscribeForRecord(id, this.onNewRecord);
  }

  componentWillUnmount() {
    const { path } = this.props;
    const { id } = path[path.length - 1];
    this.context.unsubscribeFromRecord(id, this.onNewRecord);
  }

  componentWillReceiveProps(nextProps) {
    const { path } = this.props;
    const { id } = path[path.length - 1];
    const nextId = nextProps.path[nextProps.path.length - 1].id;

    if (id !== nextId) {
      this.context.unsubscribeFromRecord(id, this.onNewRecord);
      this.context.subscribeForRecord(nextId, this.onNewRecord);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.id !== nextProps.id || this.props.environment !== nextProps.environment) {
      return true;
    }

    return this.state.record !== nextState.record;
  }

  shouldAnimate() {
    const { previousRecord } = this;
    const { record } = this.state;
    return !!previousRecord && previousRecord.__id === record.__id;
  }

  onNewRecord(record) {
    this.previousRecord = this.state.record;
    this.setState({
      record,
    });
  }

  makeFocusButtonHandler(id, name) {
    const { path } = this.props;
    const { navigateToPath } = this.context;
    return e => {
      e.stopPropagation();
      navigateToPath([...path, { id, name }]);
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

      const prev = prevExists ?
            prevObject[key] : NON_EXISTENT;

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
    const { path } = this.props;
    const { id } = path[path.length - 1];

    const animate = this.shouldAnimate() && !shallowArraysEqual(array, prev);
    const header = (
      <AnimateOnChange baseClassName="header-container" animationClassName="header-container--updated" animate={animate}>
        <Header
          keyName={key}
          value={SKIP_VALUE}
          summary={`${array.length} elements`}
        />
      </AnimateOnChange>
    );
    const newPath = [...path, { id: key }];

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <ul>
            {array.map((el, i) => this.renderChild(el, i))}
          </ul>
        </Collapsable>
      </li>
    );
  }

  renderRefs(refs, prev, key) {
    const { getType } = this.context;
    const { path } = this.props;
    const { id, name } = path[path.length - 1];

    const children = refs.map((ref, i) => {
      const name = `${key}[${i}]`;
      const newPath = [...path, { id: ref, name }];
      const clickHandler = this.makeFocusButtonHandler(ref, name);
      const summary = ref.startsWith('client:') ? null : ref;

      const animate = this.shouldAnimate() && !(Array.isArray(prev) && ref === prev[i]);
      const header = (
        <AnimateOnChange baseClassName="header-container" animationClassName="header-container--updated" animate={animate}>
          <Header
            keyName="edge"
            focusHandler={clickHandler}
            value={getType(ref)}
            summary={summary}
            isLink={true}
          />
        </AnimateOnChange>
      );

      return (
        <li key={i}>
          <Collapsable header={header} path={newPath}>
            <RecordFields path={newPath} getType={getType} />
          </Collapsable>
        </li>
      );
    });

    const animate = this.shouldAnimate() && !shallowArraysEqual(refs, prev);
    const header = (
      <AnimateOnChange baseClassName="header-container" animationClassName="header-container--updated" animate={animate}>
        <Header
          keyName={key}
          value={SKIP_VALUE}
          summary={`${refs.length} elements`}
        />
      </AnimateOnChange>
    );
    const newPath = [...path, { id: key, name: key }];

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <ul>
            {children}
          </ul>
        </Collapsable>
      </li>
    );
  }

  renderRef(ref, prev, key) {
    const { getType } = this.context;
    const { path } = this.props;
    const { id, name } = path[path.length - 1];

    const newPath = [...path, { id: ref, name: key }];
    const clickHandler = this.makeFocusButtonHandler(ref, key);
    const summary = ref.startsWith('client:') ? null : ref;

    const animate = this.shouldAnimate() && ref !== prev;
    const header = (
      <AnimateOnChange baseClassName="header-container" animationClassName="header-container--updated" animate={animate}>
        <Header
          keyName={key}
          focusHandler={clickHandler}
          value={getType(ref)}
          summary={summary}
          isLink={true}
        />
      </AnimateOnChange>
    );

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <RecordFields path={newPath} getType={getType} />
        </Collapsable>
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
        const prevExists = prev !== NON_EXISTENT && prev && typeof prev === 'object' && prev.__ref;
        const prevRef = prevExists ? prev.__ref : NON_EXISTENT;
        return this.renderRef(child.__ref, prevRef, key);
      }

      if (child.__refs) {
        const prevExists = prev !== NON_EXISTENT && prev && typeof prev === 'object' && prev.__refs;
        const prevRefs = prevExists ? prev.__refs : NON_EXISTENT;
        return this.renderRefs(child.__refs, prevRefs, key);
      }

      return (
        <li key={key}>
          <Header keyName={key} value={SKIP_VALUE} />
          <ul>
            {this.renderObject(child, prev)}
          </ul>
        </li>
      );
    }

    const animate = this.shouldAnimate() && child !== prev;
    return (
      <li key={key}>
        <AnimateOnChange baseClassName="header-container" animationClassName="header-container--updated" animate={animate}>
          <Header keyName={key} value={child} />
        </AnimateOnChange>
      </li>
    );
  }

  render() {
    const { path } = this.props;
    const { id } = path[path.length - 1];

    const prev = this.previousRecord;
    const { record } = this.state;

    if (!record) {
      return null;
    }

    return (
      <ul>
        {this.renderObject(record, prev)}
      </ul>
    );
  }
}

class Collapsable extends React.Component {
  constructor(props, context) {
    super(props, context);

    const opened = !!this.context.isPathOpened(this.props.path);
    this.state = {
      opened,
    };
  }

  render() {
    const { openOrClosePath } = this.context;

    const { path, children, header } = this.props;
    const { opened } = this.state;

    const flip = e => {
      this.setState({
        opened: !opened,
      });
      openOrClosePath(path);
      e.stopPropagation();
    };

    const childrenElements = opened ? children : null;
    return (
      <div className="collapsable">
        <a className="collapse-button" data-opened={opened} onClick={flip}>
          {header}
        </a>
        {childrenElements}
      </div>
    );
  }
}

const SKIP_VALUE = {};
function Header({ keyName, focusHandler, value, summary, isLink = false }) {
  const keyClasses =
    'key-desc' +
    (typeof keyName === 'string' && keyName.startsWith('__')
      ? ' key-deemph'
      : '');
  const keySpan =
    keyName !== undefined
      ? <span className={keyClasses}>
          {keyName}:
        </span>
      : null;
  const valueSpanClass = isLink ? 'link-desc' : `value-desc-${typeof value}`;
  const displayValue =
    typeof value === 'string' ? value : JSON.stringify(value);
  const valueSpan =
    value !== SKIP_VALUE
      ? <span className={valueSpanClass} key="value">
          {displayValue}
        </span>
      : null;
  const summarySpan = summary
    ? <span className="summary-desc" key="summary">
        {summary}
      </span>
    : null;

  const valueAndSummary = focusHandler
    ? <a className="focus-button" onClick={focusHandler}>
        {valueSpan}{summarySpan}
      </a>
    : [valueSpan, summarySpan];
  return (
    <span className="header">
      {keySpan}
      {valueAndSummary}
    </span>
  );
}

function shallowArraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

// XXX this function won't catch undefineds, dates and other special objects but it doesn't need to
function deepObjectEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === null && b !== null) {
    return false;
  }
  if (a !== null && b == null) {
    return false;
  }

  const alength = Object.keys(a).length;
  const blength = Object.keys(b).length;

  if (alength !== blength) {
    return false;
  }

  for (let key of Object.keys(a)) {
    if (Array.isArray(a[key])) {
      if (!shallowArraysEqual(a[key], b[key])) {
        return false;
      }
    } else if (typeof a[key] === 'object') {
      if (!deepObjectEqual(a[key], b[key])) {
        return false;
      }
    } else if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

// In order to avoid passing down functions recursively all over the place, use
// context as a hack.
RecordInspector.childContextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  isPathOpened: PropTypes.func,
  openOrClosePath: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};

RecordFields.contextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};

Collapsable.contextTypes = {
  isPathOpened: PropTypes.func,
  openOrClosePath: PropTypes.func,
};
