const Preact = require('preact');

const element = document.querySelector('[data-{{projectName}}-root]');

let render = () => {
    let App = require('./components/app');
    Preact.render(<App />, element, element.lastChild);
};

// Do some hot reload magic with errors
if (process.env.NODE_ENV !== 'production' && module.hot) {
    // Wrap the actual renderer in an error trap
    let renderFunction = render;
    render = () => {
        try {
            renderFunction();
        } catch (e) {
            // Render the error to the screen in place of the actual app
            const ErrorBox = require('./error-box');
            Preact.render(<ErrorBox error={e} />, element, element.lastChild);
        }
    };

    // If a new app build is detected try rendering it
    module.hot.accept('./components/app', () => {
        setTimeout(render);
    });
}

// Optionally change this to wait for Odyssey
render();