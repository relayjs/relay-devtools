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
import { shallowArraysEqual } from '../util/objCompare';

import '../css/RecordInspector.less';

export class RecordInspector extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { id } = this.props;

    this.state = {
      path: [{ id, name: id }],
      typeMapping: {},
      pathOpened: {},
    };

    this.navigateToPath = this.navigateToPath.bind(this);
    this.openOrClosePath = this.openOrClosePath.bind(this);
    this.getType = this.getType.bind(this);
  }

  getChildContext() {
    return {
      navigateToPath: this.navigateToPath,
      openOrClosePath: this.openOrClosePath,
      getType: this.getType,
    };
  }

  getType(id) {
    const { typeMapping } = this.state;
    return typeMapping[id];
  }

  openOrClosePath(path) {
    const stringified = stringifyPath(path);
    const pathOpened = Object.assign({}, this.state.pathOpened, {
      [stringified]: !this.state.pathOpened[stringified],
    });

    this.setState({
      pathOpened,
    });
  }

  componentWillReceiveProps({ id }) {
    this.setState({
      path: [{ id, name: id }],
    });
  }

  navigateToPath(path) {
    this.setState({
      path,
    });
  }

  // Overridable method
  renderRecordFields(path) {
    const { pathOpened } = this.state;
    return <RecordFields path={path} pathOpened={pathOpened} />;
  }

  renderNav() {
    const { path } = this.state;

    const makePathElement = ({ id, name }, i) => {
      const handler = () => {
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

    return (
      <div className="inspector-nav">
        {path.map(makePathElement)}
      </div>
    );
  }

  renderTag() {
    const { tag } = this.props;
    if (!tag) {
      return null;
    }

    return (
      <div className="tag">
        {tag}
      </div>
    );
  }

  renderToolbar() {
    return this.renderTag();
  }

  render() {
    const { id } = this.props;
    const { path } = this.state;

    if (!id) {
      return <div className="placeholder">Select a record to display</div>;
    }

    const expand = () => {
      this.navigateToPath(path.slice(0, path.length - 1));
    };

    const ellipsis =
      path.length > 1
        ? <div className="ellipsis" onClick={expand}>
            …
          </div>
        : null;

    return (
      <div className="record-inspector">
        <div className="toolbar">
          {this.renderToolbar()}
        </div>
        {this.renderNav()}
        <div className="root-header">
          {ellipsis}
          <br />
          <span className="link-desc">
            {this.getType(id)}
          </span>
        </div>
        {this.renderRecordFields(path)}
      </div>
    );
  }
}

export default class LatestRecordInspector extends RecordInspector {
  constructor(props, context) {
    super(props, context);

    const { id, environment } = this.props;
    this.recordSubscribers = {};
    this.fetchedRecords = {};
    this.subscribeForRecord = this.subscribeForRecord.bind(this);
    this.unsubscribeFromRecord = this.unsubscribeFromRecord.bind(this);
    this.refetch = this.refetch.bind(this);
    this.fetchRecord = this.fetchRecord.bind(this);

    this.fetch({ id, environment });

    const { API } = context;
    API.onChange({ environment, callback: this.refetch });
  }

  renderToolbar() {
    return null;
  }

  getChildContext() {
    return Object.assign(
      {
        subscribeForRecord: this.subscribeForRecord,
        unsubscribeFromRecord: this.unsubscribeFromRecord,
      },
      super.getChildContext(),
    );
  }

  fetch(props) {
    const { API } = this.context;
    API.getAllRecordDescriptions(props).then(res => {
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
    const { API } = this.context;

    API.getRecord({ environment, id }).then(record => {
      const callbacks = this.recordSubscribers[id] || [];
      this.fetchedRecords[id] = record;

      callbacks.forEach(cb => cb(record));
    });
  }

  subscribeForRecord(id, callback) {
    const { recordSubscribers, fetchedRecords } = this;
    if (!recordSubscribers[id]) {
      recordSubscribers[id] = [callback];
      this.fetchRecord(id);
    } else {
      recordSubscribers[id].push(callback);
      return callback(fetchedRecords[id]);
    }
  }

  unsubscribeFromRecord(id, callback) {
    const { recordSubscribers } = this;
    if (recordSubscribers[id]) {
      recordSubscribers[id] = recordSubscribers[id].filter(
        cb => cb !== callback,
      );
    }
    if (!recordSubscribers[id].length) {
      delete recordSubscribers[id];
    }
  }

  componentWillReceiveProps(props) {
    const { id, environment } = props;
    const { API } = this.context;
    if (this.props.id === id && this.props.environment === environment) {
      return;
    }

    if (this.props.environment !== environment) {
      API.stopObservingChange(this.props);
      API.onChange({ environment, callback: this.refetch });
    }

    super.componentWillReceiveProps(props);
    this.setState({
      fetchedRecords: {},
    });
  }

  componentWillUnmount() {
    const { API } = this.context;
    API.stopObservingChange(this.props);
  }

  renderRecordFields(path) {
    const { pathOpened } = this.state;
    return <LatestRecordFields path={path} pathOpened={pathOpened} />;
  }
}

const DIFF_VIEW_MODE_PERSIST_KEY = 'RELAY_DEVTOOLS_DIFF_VIEW_MODE';
export class SnapshotRecordInspector extends RecordInspector {
  constructor(props, context) {
    super(props, context);

    this.state.splitView = Boolean(
      window.localStorage.getItem(DIFF_VIEW_MODE_PERSIST_KEY),
    );
    this.switchViewMode = this.switchViewMode.bind(this);
  }

  switchViewMode() {
    const newState = !this.state.splitView;
    this.setState({
      splitView: newState,
    });
    window.localStorage.setItem(DIFF_VIEW_MODE_PERSIST_KEY, newState);
  }

  renderToolbar() {
    const { tag } = this.props;

    if (tag !== 'Changed') {
      return super.renderToolbar();
    }

    const { splitView } = this.state;
    const toolbarEl = super.renderToolbar();
    const onClick = this.switchViewMode;
    const viewModeButtons = (
      <div className="button-group view-mode-buttons">
        <button className="unified" disabled={!splitView} onClick={onClick}>
          Unified
        </button>
        <button className="split" disabled={splitView} onClick={onClick}>
          Split
        </button>
      </div>
    );
    return [viewModeButtons, toolbarEl];
  }

  renderRecordFields(path) {
    const { snapshotBefore, snapshotAfter } = this.props;
    const { splitView, pathOpened } = this.state;

    if (splitView) {
      return (
        <div className="snapshot-record-inspector">
          <div className="before record-inspector">
            <RecordFields
              path={path}
              pathOpened={pathOpened}
              snapshot={snapshotBefore}
              otherSnapshot={snapshotAfter}
            />
          </div>
          <div className="after record-inspector">
            <RecordFields
              path={path}
              pathOpened={pathOpened}
              snapshot={snapshotAfter}
              otherSnapshot={snapshotBefore}
            />
          </div>
        </div>
      );
    }

    return (
      <InlineDiffRecordFields
        path={path}
        pathOpened={pathOpened}
        snapshot={snapshotAfter}
        otherSnapshot={snapshotBefore}
      />
    );
  }

  getType(id) {
    const { snapshotBefore, snapshotAfter } = this.props;
    const record = snapshotBefore[id] || snapshotAfter[id];
    return record.__typename;
  }
}

const NON_EXISTENT = {};

class RecordFields extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      record: null,
      previousRecord: null,
    };

    this.isPathOpened = this.isPathOpened.bind(this);
  }

  componentDidMount() {
    this.loadFromSnapshot(this.props);
  }

  componentWillReceiveProps(props) {
    this.loadFromSnapshot(props);
  }

  loadFromSnapshot({ path, snapshot, otherSnapshot }) {
    if (!snapshot) {
      return;
    }

    const { id } = path[path.length - 1];
    const record = snapshot[id];
    const previousRecord = otherSnapshot[id];

    this.setState({
      record,
      previousRecord,
    });
  }

  shouldAnimate() {
    return false;
  }

  getSelfClass() {
    return RecordFields;
  }

  isPathOpened(path) {
    return this.props.pathOpened[stringifyPath(path)];
  }

  getChildContext() {
    return {
      isPathOpened: this.isPathOpened,
    };
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
    const { path } = this.props;

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
    const newPath = [...path, { id: key }];

    return (
      <li key={key}>
        <Collapsable header={header} path={newPath}>
          <ul>
            {array.map((el, i) => this.renderChild(el, prev[i], i))}
          </ul>
        </Collapsable>
      </li>
    );
  }

  renderRefs(refs, prev, key) {
    const { getType } = this.context;
    const { path, snapshot, otherSnapshot, pathOpened } = this.props;

    const children = refs.map((ref, i) => {
      const name = `${key}[${i}]`;
      const newPath = [...path, { id: ref, name }];
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
    const { path, snapshot, otherSnapshot, pathOpened } = this.props;

    const newPath = [...path, { id: ref, name: key }];
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
          <ul>
            {this.renderObject(child, prev)}
          </ul>
        </li>
      );
    }

    return this.renderScalar(child, prev, key);
  }

  render() {
    const { record, previousRecord } = this.state;

    if (!record) {
      return null;
    }

    return (
      <ul>
        {this.renderObject(record, previousRecord)}
      </ul>
    );
  }
}

class LatestRecordFields extends RecordFields {
  constructor(props) {
    super(props);

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
    if (
      this.props.id !== nextProps.id ||
      this.props.environment !== nextProps.environment ||
      this.props.pathOpened !== nextProps.pathOpened
    ) {
      return true;
    }

    return this.state.record !== nextState.record;
  }

  shouldAnimate() {
    const { record, previousRecord } = this.state;
    return previousRecord ? previousRecord.__id === record.__id : false;
  }

  onNewRecord(record) {
    this.setState({
      record,
      previousRecord: this.state.record,
    });
  }

  getSelfClass() {
    return LatestRecordFields;
  }
}

class InlineDiffRecordFields extends RecordFields {
  getSelfClass() {
    return InlineDiffRecordFields;
  }

  renderScalar(value, prev, key) {
    const different = value !== prev;

    const valueHeader =
      value !== NON_EXISTENT ? <Header keyName={key} value={value} /> : null;

    const prevHeader =
      prev !== NON_EXISTENT ? <Header keyName={key} value={prev} /> : null;

    if (!different) {
      return (
        <li key={key}>
          {valueHeader}
        </li>
      );
    }

    return (
      <li className="changed" key={key}>
        <div className="header-before">
          {prevHeader}
        </div>
        <div className="header-after">
          {valueHeader}
        </div>
      </li>
    );
  }
}

class Collapsable extends React.Component {
  render() {
    const { openOrClosePath, isPathOpened } = this.context;

    const { path, children, header } = this.props;
    const opened = Boolean(isPathOpened(path));

    const flip = e => {
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

function Header(props) {
  const { keyName, focusHandler, value, summary, isLink = false } = props;

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
    typeof value === 'string'
      ? value
      : typeof value === 'undefined' ? 'undefined' : JSON.stringify(value);
  const valueSpan =
    'value' in props
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
        {valueSpan}
        {summarySpan}
      </a>
    : [valueSpan, summarySpan];

  return (
    <span className="pretty-printer-header">
      {keySpan}
      {valueAndSummary}
    </span>
  );
}

export function ObjectFields({ value }) {
  if (value === null || typeof value !== 'object') {
    return <Header value={value} />;
  }
  const obj = value;
  let header;
  let body;

  return (
    <ul>
      {Object.keys(value).map(key => {
        const subValue = obj[key];
        if (subValue === null || typeof subValue !== 'object') {
          header = <Header value={subValue} keyName={key} />;
          body = null;
        } else {
          header = <Header keyName={key} />;
          body = <ObjectFields value={subValue} />;
        }
        return (
          <li key={key}>
            {header}
            {body}
          </li>
        );
      })}
    </ul>
  );
}

function stringifyPath(path) {
  return path.map(e => e.id).join('/');
}

// In order to avoid passing down functions recursively all over the place, use
// context as a hack.
RecordInspector.childContextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  openOrClosePath: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};

LatestRecordInspector.contextTypes = {
  API: PropTypes.object,
};

RecordFields.contextTypes = {
  navigateToPath: PropTypes.func,
  getType: PropTypes.func,
  subscribeForRecord: PropTypes.func,
  unsubscribeFromRecord: PropTypes.func,
};

RecordFields.childContextTypes = {
  isPathOpened: PropTypes.func,
};

Collapsable.contextTypes = {
  isPathOpened: PropTypes.func,
  openOrClosePath: PropTypes.func,
};
