const Loader = {
    getRootElement() {
        return document.querySelector('[data-{{projectName}}-root]');
    },

    getAssetPath() {
        const element = Loader.getRootElement();

        if (element.hasAttribute('data-asset-path')) {
            return element.getAttribute('data-asset-path');
        } else {
            return '';
        }
    }
}

module.exports = Loader;
