/****
 * react-control-center是什么？
 * react-control-center是一个专门为react定制的，更加智能更加强大却更简单的状态管理框架
 */

//启动cc，声明一个store, 注意哦，这里我们示意非模块化的方式启动，
//这种方式，只能使用cc内置的两个store模块,$$default 和 $$global
cc.startup(
    {
        isModuleMode: true,//声明cc以模块化的方式启动，这样cc就允许在默认的$$default、$$global模块之外，定义更多的模块了
        store: {//模块化下，store的第一层key表示模块名称
            $$default: {
                name: 'this name come from $$default state',
                address: 'BJ',
                hobby: 'watching film',
            },
            foo: {//声明一个新的foo模块
                name: 'this name come from foo state',
                //我们来多个几个属性
                address: 'SH',
                hobby: 'coding',
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
                changeHobby({ payload }) {
                    //$$domDispatch的payload可以解构出来的key如下
                    const { event, value, dataset } = payload;
                    return { hobby: value }
                },
                //reducer function里一定要返回一个新的片段state吗？可以不用哦，可以调用其他的reducer方法，
                // 所以一个reducer方法时可以组合其他多个reducer方法,且本身不返回任何值的哦
                clearName() {
                    return { name: '' };
                },
                clearAddress() {
                    return { address: '' };
                },
                clearHobby() {
                    return { hobby: '' };
                },
                async clearAll({ dispatch }) {
                    //一个一个清除, 注意这里的dispatch默认自带的module是触发$$dispatch时的那个实例所指定的module
                    //await dispatch('/foo/clearName');
                    //await dispatch('/foo/clearAddress');
                    //await dispatch('/foo/clearHobby');

                    //一起执行
                    Promise.all([
                        dispatch('/foo/clearName'),
                        dispatch('/foo/clearAddress'),
                        dispatch('/foo/clearHobby'),
                    ]);
                }
            }
        },
        //这里配置一个错误处理函数，简单的将所有的cc错误打印一下
        errorHandler: err => console.log(err),
    }
);

function changeAddress(address, suffix) {
    return { address: `${address}${suffix}` }
}

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
    changeAddress = (e) => {
        const address = e.currentTarget.value;
        //这里我们不走$$dispatch, 直接使用$$effect吧, this.$$effect(module:string, userFn:Function, ...args)
        //同样userFn可以是普通函数，生成器函数，async函数哦
        //this.$$effect(this.cc.ccState.module, changeAddress, address, 'e');

        //$$effect第一位参数必须指定module，如果我总是想改变当前实例所属的module的state呢,$$invoke来满足你
        this.$$invoke(changeAddress, address, 'e');
    }
    render() {
        const { name, address, hobby } = this.state;
        return (
            <div style={{ borderBottom: '3px solid green', marginTop: '6px' }}>
                hello,
            my name is <span>{name}</span>,
            my address is <span>{address}</span>,
            my hobby is <span>{hobby}</span>,
             <hr />
                <input value={name} onChange={this.changeName} />
                <input value={address} onChange={this.changeAddress} />
                {/* 这里我们直接使用$$domDispatch哦 */}
                {/* data-cct表示type */}
                {/* data-ccm表示module，不指定的话就默认为当前实例所属的module */}
                {/* data-ccrm表示reducder module，不指定的话等同于当前实例的module */}
                <input data-cct="changeHobby" data-ccrm="foo" value={hobby} onChange={this.$$domDispatch} />
                <button data-cct="clearAll" data-ccrm="foo" onClick={this.$$domDispatch}>清除所有</button>
                <hr />
            </div>
        )
    }
}
//注册为cc组件，不声明属于任何模块，cc默认该组件属于$$default模块，当然
//设定sharedStateKeys为*,表示共享所属模块的所有key变化（这里指的就是$$default罗）
//设定globalStateKeys为*，表示共享$$global模块的所有key变化
const CcHello1 = cc.register('Hello1', { module: '$$default', sharedStateKeys: '*', globalStateKeys: '*' })(Hello);

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