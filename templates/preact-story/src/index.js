/** @jsx Preact.h */
const Preact = require('preact');
const domready = require('domready');

const element = require('./loader').getRootElement();

let root;
let render = () => {
    let App = require('./components/app');
    root = Preact.render(<App />, element, root);
};

// Do some hot reload magic with errors
if (process.env.NODE_ENV !== 'production' && module.hot) {
    let renderFunction = render;
    render = () => {
        try {
            renderFunction();
        } catch (e) {
            console.error(e);
            const { Error } = require('./error');
            root = Preact.render(<Error error={e} />, element, root);
        }
    };

    module.hot.accept('./components/app', () => {
        setTimeout(render);
    });
}

domready(render);
