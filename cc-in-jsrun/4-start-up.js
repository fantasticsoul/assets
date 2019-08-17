/****
 * react-control-center是什么？
 * react-control-center是一个专门为react定制的，更加智能更加强大却更简单的状态管理框架
 */

//启动cc，声明一个store, 注意哦，这里我们示意非模块化的方式启动，
//这种方式，只能使用cc内置的两个store模块,$$default 和 $$global
cc.startup(
    {
        store: {
            name: 'this name come from $$default store'
        },
        //reducer对象的key表示的是reducer各个模块的名称，我们可以默认和store模块同名
        reducer: {
            //我们为$$default定义一个方法吧
            $$default: {
                async changeName({ payload: name }) {
                    return { name };
                },
            },
        },
        //这里配置一个错误处理函数，简单的将所有的cc错误打印一下
        errorHandler: err => console.log(err),
    }
);

//这真的只是一个普通的Hello
class Hello extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'normol component',
        };
    }
    changeName = (e) => {
        //this.setState({ name: e.currentTarget.value });
        this.dispatch();
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
//注册为cc组件，不声明属于任何模块，cc默认该组件属于$$default模块，当然
//设定sharedStateKeys为*,表示共享所属模块的所有key变化（这里指的就是$$default罗）
//设定globalStateKeys为*，表示共享$$global模块的所有key变化
const CcHello1 = cc.register('Hello1', { module: '$$default', sharedStateKeys: '*', globalStateKeys: '*' })(Hello);

class App extends React.Component {
    render() {
        return (
            <div>
                <CcHello1 />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));