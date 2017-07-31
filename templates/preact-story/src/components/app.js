/** @jsx Preact.h */
const Preact = require('preact');

const HTML = require('./html');

const styles = require('./app.scss');

class App extends Preact.Component {
    render() {
        return (
            <div className={styles.wrapper}>
                <h1>It works!</h1>
                <HTML html='<blockquote>You can render HTML extracted from the article content...</blockquote>' />
            </div>
        );
    }
}

module.exports = App;
