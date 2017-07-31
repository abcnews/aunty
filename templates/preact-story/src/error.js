/** @jsx Preact.h */
const Preact = require('preact');

class Error extends Preact.Component {
    render() {
        const { error } = this.props;

        return (
            <div
                style={{
                    background: '#900',
                    color: 'white',
                    padding: '20px',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    zIndex: 1000
                }}>
                <pre>
                    {error.stack}
                </pre>
            </div>
        );
    }
}

module.exports = Error;
