const ns = require('util-news-selectors');

const storyEl = document.querySelector(ns('story'));
const okEl = document.createElement('div');

okEl.className = '{{projectName}}-ok';
okEl.innerHTML = '<pre>{{projectName}} OK!</pre>';
storyEl.appendChild(okEl);
