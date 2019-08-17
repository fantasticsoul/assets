/****
 * react-control-center是什么？
 * react-control-center是一个专门为react定制的，更加智能更加强大却更简单的状态管理框架
 */

var register = cc.register;

//我们启动cc，定义了store和reducer
cc.startup(
    {
        store:
        {
            name: 'this name come from $$global store'
        },
        reducer: {
            //我们为$$default定义一个方法吧
            $$default: {
                async changeName({ payload: name }) {
                    console.log(`recevie name ${name}`);
                    return { name };
                },

            },
        },
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

        //我们换一种方式来改变状态
        this.$$dispatch({ type: 'changeName', payload: e.currentTarget.value });
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

//注册为cc组件，不声明属于任何模块，cc默认该组件属于$$default模块，
//设定sharedStateKeys为*,表示共享所属模块的所有key变化（这里指的就是$$default罗）
//设定globalStateKeys为*，表示共享$$global模块的所有key变化
const CcHello1 = register('Hello', { sharedStateKeys: '*', globalStateKeys: '*'})(Hello);

class App extends React.Component {
    render() {
      return (
        <div>
          <CcHello1 />
          <CcHello1 />
          <CcHello1 />
        </div>
      );
    }
  }

  ReactDOM.render(<App />, document.getElementById('app'));