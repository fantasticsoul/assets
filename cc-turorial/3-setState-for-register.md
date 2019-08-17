```
/****
 * @param {string} ccClassKey cc类的名称，你可以使用多个cc类名注册同一个react类，但是不能用同一个cc类名注册多个react类
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {object} registerOption 注册的可选参数
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.module] 声明当前cc类属于哪个模块，默认是`$$default`模块
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {Array<string>|string} [registerOption.sharedStateKeys] 
 * 声明当前cc类的哪些key的变化将共享到它所属的模块,同时也意味着它观察着所属模块的这些key的值变化
 * 默认是一个空数组，意味着当前cc类state任意key的值发送变化都不会影响它所属模块的state
 * 加入你定义它为['foo', 'bar'], 当一个cc类的实例改变了foo和bar的值
 * 将会影响到其他任何cc类的sharedStateKeys包含了foo和bar其中任意一个key的cc实例的视图变化，
 * 同样其他通过设定`sharedStateKeys`共享了foo和bar变化的任意一个cc实例如果改变了foo或者bar，都会剩下的其他cc实例，
 * 你可以设定它为`*`，表示当前cc类观察他所属的模块的整个state所有key的值变化
 * 注意，sharedStateKeys里的key必须是在所属模块里存在的key。
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {Array<string>|string} [registerOption.globalStateKeys] 
 * 声明当前cc类关注哪些global state的key值变化，
 * 默认是个空数组，意味着global state任意的key值变化都不会影响当前cc类，当前cc类也不会改变global state的任何key值，
 * 注意，globalStateKeys写的key必须在globa state里有明确的声明，
 * 假如你的global state形如{gColor:'red', gWidth:200},
 * 你定义的 globalStateKeys是['gColor']，
 * 当你当前cc实例发送了一个状态对象给cc形如{gColor:'blue', otherKey:'whatever'},
 * global state的gColor值将被改变，同时其他cc类如果它的globalStateKeys包含了gColor，它们的实例也会读取到最新的gColor值并触发渲染
 * 你也可以定义globalStateKeys为'*'，意味着当前cc类观察整个global模块的变化
 * ============   !!!!!!  ============
 * 注意key命名重复问题，因为一个cc实例的state是由global state、模块state、自身state合成而来，
 * 所以cc不允许sharedStateKeys和globalStateKeys有重复的元素
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {object} [registerOption.stateToPropMapping] { (moduleName/keyName)/(alias), ...}
 * 如果你不喜欢模块state被合成到当前cc实例的state对象里，你可以定义stateToPropMapping，
 * 意味着你可以在cc实例中通过'this.$$propState'里获得所属模块的state
 * 例如，你定义stateToPropMapping为：{'moudleA/foo':'foo', 'moudleB/bar':'bar'}
 * 现在你可以想一下代码所示一样获得foo和bar的值了
 * ```
 *    const {foo, bar} = this.$$propState;
 * ```
 * ============   !!!!!!  ============
 * 注意，因为任意foo和bar的key值发送变化都会影响当前cc类的实例渲染新的视图，
 * 所以这里将依偎着你可以用此方式来达到一个cc类要观察任意多个模块状态变化的目的，
 * 如果模块moudleA和模块moudleB的state存在key命名重复，你可以定义'stateToPropMapping为'：
 * {'moudleA/foo':'foo', 'moudleA/bar':'moudleA_bar','moudleB/bar':'bar'}
 * 现在你可以像一下一样从两个模块里获得foo和bar的值了
 * ```
 *    const {foo, moudleA_bar, bar} = this.$$propState;
 * ```
 * 如果你想观察模块moudleA和模块moudleB它们各自的整个state变化，
 * 同时你可以确认它们state里没有相同名字的key存在，
 * 你可以定义'stateToPropMapping'形如: {'moudleA/*':'', 'moudleB/*':''}
 * 现在你可以从'this.$$propState'里拿到两个模块的任意key了，
 * ============   !!!!!!  ============
 * 避免多个模块的key命名重复的方法是，定义'registerOption.isPropStateModuleMode'为true,
 * 这时你可以像以下一样获得模块state了，从解构出来的模块名里你可以获取到任意state值了^_^
 * ```
 *    const {moudleA, moudleB} = this.$$propState;
 * ```
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {object} [registerOption.isPropStateModuleMode] 默认是false，参见上面怎么用它
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.reducerModule] 默认和'registerOption.module'相等
 * 如果你在cc实例中调用实例api'$$dispatch'时不指定'module'和'reducerModule',如以下代码一样
 * ```
 *    this.$$dispatch({type:'doStaff', payload:{foo:1, bar:2}});
 *    // 或者另一种等价的调用方式
 *    this.$$dispatch('doStaff', {foo:1, bar:2});
 * ```
 * cc将查找当前cc类的'reducerModule'模块下的名字为'doStaff'的函数去执行，
 * 并将去改变当前cc类的模块的state
 * 所以如果当前cc类module是M1，如果你总想使用reducer的R1模块下的函数去生成新的state去改变M1的state，
 * 你不必写类似以下的代码，
 * ```
 *    this.$$dispatch({module:'M1', reducerModule:'R1', type:'doStaff', payload:{foo:1, bar:2}});
 *    // or 
 *    this.$$dispatch('M1/R1/doStaff', {foo:1, bar:2});
 * ```
 直接就可以写成
 * ```
 *    this.$$dispatch({type:'doStaff', payload:{foo:1, bar:2}});
 *    // or 
 *    this.$$dispatch('doStaff', {foo:1, bar:2});
 * ```
 * ============   !!!!!!  ============
 * 当你真的是想改变其他模块的state，或者使用其他recuer模块的方法，
 * 你才需要显示的指定module和reducerModule值，
 * ```
 *    this.$$dispatch({module:'M2', reducerModule:'R2', type:'doStaff', payload:{foo:1, bar:2}});
 * ```
 * 如果你不指定，cc默认就是当前cc类的默认module和reducerModule值
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.extendInputClass] 是否直接继承传入的react类，默认是true
 * cc默认使用反向继承的策略来包裹你传入的react类，这以为你在cc实例可以通过'this.'直接呼叫任意cc实例方法，
 * 但是很多时候用户不希望自己的react类被这样入侵，或者你的遗留项目用那种多个装饰器的react类，
 * 你想把它迁移到cc并让它仍然正常运行，你可以设置'registerOption.extendInputClass'为false，
 * cc将会使用属性代理策略来包裹你传入的react类，在这种策略下，
 * 所有的cc实例方法只能通过'this.props.'来获取了，代码会如下所示：
 * ```
 *    @cc.register('BasicForms',{
 *      stateToPropMapping: {'form/regularFormSubmitting': 'submitting'},
 *      extendInputClass: false 
 *    })
 *    @Form.create()
 *    export default class BasicForms extends PureComponent {
 *      componentDidMount()=>{
 *        this.props.$$dispatch('form/getInitData');
 *      }
 *      render(){
 *        const {submitting} = this.props.$$propState;
 *      }
 *    }
 * ```
 * 跟多的细节可以参考cc化的antd-pro项目的此组件 https://github.com/fantasticsoul/rcc-antd-pro/blob/master/src/routes/Forms/BasicForm.js
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.isSingle] 该cc类是否只能实例化一次，默认是false
 * 如果你只允许当前cc类被实例化一次，这意味着至多只有一个该cc类的实例能存在
 * 你可以设置'registerOption.isSingle'为true，这有点类似java编码里的单例模式了^_^
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.asyncLifecycleHook] 是否是cc类的生命周期函数异步化，默认是false
 * 我们可以在cc类里定义这些生命周期函数'$$beforeSetState'、'$$afterSetState'、'$$beforeBroadcastState',
 * 他们默认是同步运行的,如果你设置'registerOption.isSingle'为true，
 * cc将会提供给这些生命周期函数next句柄放在他们参数列表的第二位，
 *  * ============   !!!!!!  ============
 * 你必须调用next，否则当前cc实例的渲染动作将会被永远阻塞，不会触发新的渲染
 * ```
 * $$beforeSetState(executeContext, next){
 *   //例如这里如果忘了写'next()'调用next, 将会阻塞该cc实例的'reactSetState'和'broadcastState'等操作~_~
 * }
 * ```
 */
```