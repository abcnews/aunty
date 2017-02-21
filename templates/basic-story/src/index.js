const rootEl = document.querySelector('[data-{{projectName}}-root]');
const appEl = document.createElement('div');

appEl.className = '{{projectName}}';
appEl.innerHTML = '<pre>{{projectName}} OK!</pre>';
rootEl.appendChild(appEl);
