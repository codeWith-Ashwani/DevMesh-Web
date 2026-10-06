import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class PageErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="page-wrap space-y-4"><h1 className="page-title">This page could not open.</h1><p role="alert" className="text-sm text-[#A5B4CE]">Try reloading the page. You can also return to your overview.</p><div className="flex gap-3"><button className="btn-secondary px-4 py-2" onClick={() => window.location.reload()}>Reload page</button><Link className="btn-primary px-4 py-2" to="/">Back to overview</Link></div></div>;
  }
}
