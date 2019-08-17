/****
 * react-control-center是什么？
 * react-control-center是一个专门为react定制的，更加智能更加强大却更简单的状态管理框架
 * 
 * github: https://github.com/fantasticsoul/react-control-center
 * cc化的antd-pro实例: https://github.com/fantasticsoul/rcc-antd-pro
 * 快速开始: https://github.com/fantasticsoul/rcc-simple-demo
 */

//这真的只是一个普通的Hello
class Hello extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'normol component',
        };
    }
    changeName = (e) => {
        this.setState({ name: e.currentTarget.value });
    }
    render() {
        const { name } = this.state;
        return (
            <div style={{ borderBottom: '3px solid green', marginTop: '6px' }}>
                hello,
                my name is <span>{name}</span>,
                <hr />
                <input value={name} onChange={this.changeName} />
                <hr />
            </div>
        )
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <Hello />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));