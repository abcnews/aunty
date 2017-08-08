# {{projectName}}

A project generated from [aunty](https://github.com/abcnews/aunty)'s `preact-story` template.


## Odyssey

Oddysey must be available on the page before the main story component is loaded.

You can see this happening at the bottom of `src/index.js`:

```javascript
// Load when Odyssey is ready
if (window.__ODYSSEY__) {
    render();
} else {
    window.addEventListener('odyssey:api', () => {
        render();
    });
}
```


## Hot Reload

Hot reload is enabled by default on the development server. Your 'app' should be separated into the `src/index.js` loader
and the actual app in `src/components/app.js`.

If you want to see how hot reload is set up, have a look in `src/index.js` and you'll see something like this:

```javascript
if (process.env.NODE_ENV !== 'production' && module.hot) {
    let renderFunction = render;
    render = () => {
        try {
            renderFunction();
        } catch (e) {
            const ErrorBox = require('./error-box');
            root = Preact.render(<ErrorBox error={e} />, element, root);
        }
    };

    module.hot.accept('./components/app', () => {
        setTimeout(render);
    });
}
```

This just means that when `NODE_ENV` is 'development' the app will always be listening for changes and when it detects
a new build (a change to `./components/app` or its dependencies) it will automatically require in the new code.

If there was an error when compiling you will see an error box instead of your app. Once you fix the error it will vanish
and your app will be back.

If you need to hot reload a file outside of the `./components/app` dependency structure then you will have to add a separate `module.hot.accept` handler.


## Using React components with Preact

This template comes with [`preact-compat`](https://www.npmjs.com/package/preact-compat) so any React components should
Just Work™.


## Authors

- {{authorName}} ([{{authorEmail}}](mailto:{{authorEmail}}))
