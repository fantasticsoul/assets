
cc.startup(
    {
        isModuleMode: true,//声明cc以模块化的方式启动，这样cc就允许在默认的$$default、$$global模块之外，定义更多的模块了
        store: {//模块化下，store的第一层key表示模块名称
            $$default: {
                name: 'this name come from $$default state',
            },
            foo: {//声明一个新的foo模块
                name: 'this name come from foo state',
            }
        },
        //reducer对象的key表示的是reducer各个模块的名称，我们可以默认和store模块同名
        reducer: {
            //我们为$$default定义一个方法吧，这个方法可以是普通函数，也可以是async函数，或者generator函数
            $$default: {
                async changeName({ payload: name }) {
                    return { name };
                },
            },
            //我们来定义一个新的reducer module名为foo，
            foo: {
                async changeName({ payload: name }) {
                    //为了证明调用了foo，我们加个前缀f
                    return { name: `f${name}` };
                },
            }
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
        const name = e.currentTarget.value;
        //this.setState({ name: e.currentTarget.value });

        //让我们换一种写法来改变状态，this.$$dispatch(action:Action);
        //module表示要去修改那个state module的数据，
        //reducerModule表示使用哪个recuder module下的函数map
        //type表示使用函数map下的函数名为type值的函数去执行
        //payload就是要传递的数据啦
        //  this.$$dispatch({module:'$$default',reducerModule:'$$default',type:'changeName',payload:name});

        //因为我们的当前实例就是属于$$default模块，目标reducer module也和$$default重名的,所以可以简写为
        //  this.$$dispatch({type:'changeName',payload:name});

        //再换一种方式写$$dispatch, this.$$dispatch(typeDescriptor:string, payload:any)
        //this.$$dispatch('changeName', name);
        //等同于写, typeDescriptor字符串形如 (stateModuleName)/(reducerModuleName)/(functionName)
        //  this.$$dispatch('$$default/$$default/changeName', name);

        //基于typeDescriptor写法，如果我们想用foo reducer module的changeName方法去修改 $$default state module的值该怎么写呢?
        //  this.$$dispatch('$$default/foo/changeName', name);
        //因为实例属于$$default模块，所以我们可以省略写模块名，只写recuder模块名
        //typeDescriptor字符串形如 /(reducerModuleName)/(functionName), 此时注意哦第一个斜杠不能少
        //  this.$$dispatch('/foo/changeName', name);

        //如果我们少了第一个斜杠表示什么呢？
        //此时 typeDescriptor字符串形如 (stateModule and reducerModuleName)/(functionName),
        //既表示state module，也表示reducer module了，所以如果你规划reducer的模块时候，刻意和state模块保持一致命名，就可以这样写了
        //  this.$$dispatch('foo/changeName', name);
        //现在我们这样写，看到console报错了，因为这种写法现在表示目标state module是foo，用foo reducer module下的changeName去生成新的片段状态
        //我们现在去定义foo模块吧，

        //让都以Hello为输入注册成为了不同的cc组件各自修改自己所属模块的数据，但是都要foo reducer的changeName方法
        this.$$dispatch('/foo/changeName', name);
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

//以Hello为基础组件，再注册一个属于foo模块cc组件吧
//我们发现输入input框没有任何变化，因为CcHello1的实例读取的$$default模块的数据哦,我们再来注册一个cc组件属于foo模块
//注意哦，我们在CcHello1的input框里输入值，却改变了CcHello2，
//是因为 'foo/changeName' 描述的是目标state module是foo，用foo reducer的changeName方法
const CcHello2 = cc.register('Hello2', { module: 'foo', sharedStateKeys: '*', globalStateKeys: '*' })(Hello);

class App extends React.Component {
    render() {
        return (
            <div>
                <CcHello1 />
                <CcHello2 />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));