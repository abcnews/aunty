/** @jsx Preact.h */
const Preact = require('preact');

class HTML extends Preact.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div
                dangerouslySetInnerHTML={{ __html: this.props.html }}
                id={this.props.id}
                className={this.props.className || ''}
            />
        );
    }
}

module.exports = HTML;
