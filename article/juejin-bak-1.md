# C_C welcom to cc world
>### quick-start demo: https://github.com/fantasticsoul/rcc-simple-demo

## 简介
* 硝烟四起
>众所周知，react本身只是非常优雅的解决了视图层渲染工作，但是随着应用越来越大，庞大的react组件群体之间状态相互其实并不是孤立的，需要一个方案管理把这些状态集中管理起来，从而将model和view的边界划分得更加清楚，针对于此，facebook官方对于react状态管理给了一个flux架构并有一套自己的实现，但是社区里并不满足于此，基于对flux的理解各个第三方做着给出了的自己的解决方案，状态管理框架的战争从此拉开序幕，随着redux横空出世，大家默默接受了redux的 dispatch action、hit reducer、comibine new state、render new view的理念，在redux世界里，组件需要关心的状态变化都由props注入进来，connect作为中间的桥梁将react组件与redux关联起来，通过mapStateToProps将redux里定义好的state映射到组件的props上，以此达到让react组件订阅它需要关心的state变化的目的。
* 一统天下
>随着redux生态逐渐完善，大家默认的把redux当做了react状态管理的首选解决方案，所以redux已经在react状态管理框架里一统天下，通过github star发现，另一个流行的状态管理框架mobx页已经锁定第二的位置，用另一种思路来给大家展示原来状态可以这么管理，状态管理的格局似乎基本已经洗牌完成，可是作为redux重度使用者的我并不满足与此，觉得在redux世界里，通过props层层穿透数据，通过provider包裹整个react app应用，只是解决了状态的流动问题，而组件的通信任然非常间接与尴尬，依靠redux来完成不是不可以，只是对比vue，任然觉得少了些什么......
* why cc
>react-control-center并不是简单的立足于状态管理，而是想为你提供更多的有趣玩法，因为现有的状态管理解决方案已经非常成熟（但是在某些场景未必真的好用），所以cc从一开始设计就让其api对现有的组件入侵非常之小，你可以在redux项目里局部使用cc来把玩cc的状态管理思路，可以从一个组件开始，慢慢在开始渐进式的修改到其他地方，仅仅使用一个register函数，将你的react类注册为cc类，那么从cc类生成的cc实例，将给你带来以下新的特性、新的概念、新的思路。
>>1 所有cc实例都拥有 **emit** 和 **on** 的能力，无论组件间嵌套关系多复杂，实现组件间通信将会是如此轻松。
>>>实际上实例还拥有更精准的emitIdentity, emitWith, onIdentity方法，让用户基于更精准的力度去发射或者接收。<br/>
emitIdentity(eventName:string, identity:string, ...args), 第一位参数是事件名，第二位参数是认证串，剩余参数是on的handler函数的实际接收参数，当很多相同组件(如以CcClass:BookItem生成了多个CcInstance)订阅了同一个事件，但是你只希望通知其中一个触发handler调用时，emitIdentity就能派上用场了。<br/>
onIdentity(eventName:string, identity:string, hancler:function),监听emitIdentity发射的事件。<br/>
emitWith(eventName:string, option?:{module?:string, ccClassKey?:string, identity?:string})从一个更精准的角度来发射事件,寻找指定模块下，指定cc类名的，指定identity的监控函数去触发执行，具体过程这里先略过，先看下面关于模块和cc类的介绍，在回过头来理解这里更容易。<br/>
off(eventName:string, option?:{module?:string, ccClassKey?:string, identity?:string}),取消监听。<br/>
这些函数在cc的顶层api里都有暴露，当你的cc app运行起来之后，你可以打开console,输入cc并回车，你会发现这些函数已经全部绑定在window.cc对象下了，你可以直接调用他们来完成快速验证哦，而非通过ccInstance去触发^_^
```
import cc from 'react-control-center';
import React,{Component, Fragment} from 'react';

@cc.register('Foo')
class Foo extends Component{
    componentDidMount(){
        this.$$on('fooSignal',(signal, from)=>{
            this.setState({signal, from});
        });
        //cc是不允许一个cc实例里对同一个事件名监听多次的，这里fooSignal监听了两次，cc会默认使用最新的监听函数，所以上面个监听变成了无效的监听
        this.$$on('fooSignal',(signal, from)=>{
            this.setState({signal, from:`--${from}--`});
        });
        this.$$on('fooSignalWithIdentity', 'xxx_id_wow',()=>{
            this.setState({signal, from});
        })
    }
}
@cc.register('Bar')
class Bar extends Component{
    render(){
        <div>
            <button onClick={()=>this.$$emit('fooSignal', 'hello', 'Bar')}>emit</button>
            <button onClick={()=>this.$$emit('fooSignal', 'xxx_id_wow', hello', 'Bar')}>emitIdentity</button>
            <button onClick={()=>this.$$off('fooSignal')}>off event fooSignal</button>
        </div>
    }
}
```
---
>>2 所有cc实例都可以针对自己的state的任意key定义 **computed** 函数，cc会在key的值发生变化自动计算新的computed值并缓存起来，在实例里定义的computed会收集到实例的refComputed对象里。
```
import cc from 'react-control-center';
import React,{Component, Fragment} from 'react';

@cc.register('Foo')
class Foo extends Component{
    constructor(props, context){
        super(props, context);
        this.state = {woo:'woo cc!'};
    }
    $$computed(){
        return {
            wow(wow){
                return `computed wow ${wow}`;
            }
        }
    }
    componentDidMount(){
        this.$$on('fooSignal',(signal, from)=>{
            this.setState({signal, from});
        });
    }
    changeWow = (e)=>{
        this.setState({wow: e.currentTarget.value});
    }
    render(){
        return (
            <div>
                <span>{this.state.wow}</span>
                <span>{this.$$refComputed.wow}</span>
                <input value={this.state.wow} onChange={this.changeWow}/>
            </div>
        );
    }
}
```
---
>>3 注册为cc类的时候，为该cc类设定了一个该cc类所属的 **模块** ，并通过sharedStateKeys声明关心该模块里哪些key（可以是任意的key，也可以是这个模块的所有key）的变化,则由改cc类产生的cc实例共同监听着这些key对应值的变化，任何一个cc实例改变了这些sharedStateKeys里的值，其他cc实例都能感知到它的变化并自动被cc触发渲染。
```
import cc from 'react-control-center';
import React,{Component, Fragment} from 'react';

class Foo extends Component{
    render(){
        return <div>any jsx fragment here</div>
    }
}

//将Foo注册为一个共享FooOfM1模块所有key变化的cc类FooOfM1
const FooOfM1 = cc.register('FooOfM1', {module:'M1', sharedStateKeys:'all'})(Foo);
//将Foo注册为一个共享FooOfM2模块key1和key2变化的cc类FooOfM2
const FooOfM2 = cc.register('FooOfM2', {module:'M2',sharedStateKeys:['key1','key2']})(Foo);
//将Foo注册为一个共享FooOfM2模块key1和key2变化,且共享global模块g1变化的cc类FooOfM2G
const FooOfM2G = cc.register('FooOfM2', {module:'M2',sharedStateKeys:['key1','key2','key3'],globalStateKeys:['g1']})(Foo);
//不设定任何参数，只写cc类名，cc会把Foo注册为一个属于default模块的cc类
const JustWantToOwnCcAbility = cc.register('JustWantToOwnCcAbility')(Foo);

//cc同时也为register提供简写函数
//const FooOfM2G = cc.r('FooOfM2',{m:'M2',s:['key1','key2','key3'],g:['g1']})(Foo})
```
---
>>4 注意在3里我们提到一个概念 **模块**，对于cc来说一个完整的模块包括以下属性：state、reducer、init、computed，这些参数都是调用cc.startup时注入，注意，cc虽然不需要用户像redux那样要给顶层App组件包裹一层&lt;Provider/&gt;但是要求用户在app入口文件的第一句话那里触发cc.startup 让整个cc运行起来，store、reducer、init、computed就是cc.startup需要的参数<br/>


![](https://user-gold-cdn.xitu.io/2019/1/16/16855a7571b98b79?w=493&h=343&f=png&s=14846)
>> - store是一个object对象，store里的各个key就表示模块名，对应的值就是各个模块对应的state，一个cc实例除了setState方法能够触发修改state，还可以通过dispatch方法派发action对象去修改state，此时具体的数据合成逻辑就体现在下面要说的reducer里了
>> - recuder是一个object对象，recuder里的各个key表示reducer的模块名，通常用户可以定义和state的模块名保持一致，但是可以定义另外的模块名，所以这里的模块指的是reducerModuel,不强求用户定义时和stateModule保持一致，stateModule对应的值一个普通的json对象，key为函数名，值为处理函数，即处理旧state并合成新state的方法，cc支持函数为普通函数、生成器函数、async函数。<br/>
>>> 上面提到了dispatch函数需要传递一个action对象，一个标准的action必须包含type、payload 2个属性，表示cc要去查recuder里某个模块下type映射函数去修改某个模块的state，具体是什么模块的type映射函数和什么模块对应的state，参见action剩余的两个可缺省的属性module和reducerModule的设定规则，注意，这里再一次提到了reducerModule，以下规则就体现了为什么cc允许reducer模块名可以自由定义：<br/>
不指定module和reducerModule的话，cc去查reducer里当前cc实例所属模块下的type映射函数去修改当前cc实例所属模块的state。<br/>
指定了module，而不指定reducerModule的话，cc去查reducer里module下的type映射函数去修改module模块的state。<br/>
不指定module，指定reducerModule的话，cc去查reducer里reducerModule下type映射函数去修改当前触发dispatch函数的cc实例所属的module模块的state。
指定了module，同时也指定了reducerModule的话，cc去查reducer里reducerModule下type映射函数去修改module模块的state。<br/>
之所以这样设计是因为考虑到让用户可以自由选择reducer的模块描述方式，因为对于cc来说，dispatch派发的action只是为了准确找到reducer里的处理函数，而reducer的模块定义并不需要强制和state保持一致给了用户更多的选择去划分reducer的领域
>> - init是一个object对象，key是模块名，严格对应stateModule，值是一个函数，如果用户为某个模块定义了init函数表示用户希望有机会再次初始化某个模块的state，通常是异步请求后端来的数据重新赋值给模块对应的state<br/>
>> - computed是一个object对象，key是模块名，严格对应stateModule，值是一个moduleComputedObject,moduleComputedObject的key指的就是某个module的某个key，value就是为这个key定义的计算函数，函数的第一为参数就是key的原始值，cc实例里通过moduleComputed对象取到计算后的新值，特别地，为global模块定义的moduleComputedObject对象，在cc实例里通过globalComputed对象取到计算后的新值
```
//code in index.js
import api from '@foo/bar/api';

cc.startup({
    isModuleMode:true,//表示cc以模块化方式启动，默认是false，cc鼓励用户使用模块化管理状态，更容易划分领域的边界
    store:{
        $$global{//$$global是cc的内置模块，用户如果没有显式的定义，cc会自动注入一个，只不过是一个不包含任何key的对象
            themeColor:'pink',
        },
        m1:{
            name:'zzk',
            age:30,
            books:[],
            error:'',
        },
        m2:{
            wow:'wow',
            signal:'haha',
        }
    },
    reducer:{
        m1:{
            //state表示调用dispatch的cc实例对应的state，moduleState只描述的是cc实例所属的模块的state，更多的解释看下面的4 5 6 7 8这些点。
            //特别的注意，如果该方法是因为某个reducer的函数里调用的dispatch函数而被触发调用的，此时的state始终指的是最初的那个在cc实例里触发dispatch时那个cc实例的state，而moduleState始终指向的是指定的module的的state！！！
            changeName:function({payload,state,moduleState,dispatch}){
                const newName = payload;
                dispatch({module:'m2',type:'changeSignal',payload:'wow!dispatch in reducer function block'});
                return {name:newName};
            },
            //支持生成器函数
            changeAge:function*({payload,state,moduleState,dispatch}){
                const newAge = payload;
                const result = yield api.verifyAge(newAge);
                if(result.error)return({error:result.error});
                else return {name:newName};
            },
            //支持async
            changeAge:async function({payload:{pageIndex,pageSize}}){
                const books = yield api.getBooks(pageIndex, pageSize);
                return {books};
            }
        },
        m2:{
            changeSignal:function({payload:signal,dispatch}){
                //注意m1/changeName里指定了修改m2模块的数据，其实这里可以一次性return {signal, wow:'just show reducerModule'}来修改数据，
                //但是故意的调用dispatch找whatever/generateWow来触发修改m2的wow值，是为了演示显示的指定reducerModule的作用
                dispatch({module:'m2',reducerModule:'whatever',type:'generateWow',payload:'just show reducerModule'})
                return {signal};
            }
        },
        whatever:{//一个刻意和stateModule没有保持一致的reducerModule
            generateWow:function({payload:wow}){
               return {wow};
            }
        },
        $$global:{//为global模块指定reducer函数
            changeThemeColor:function({payload:themeColor}){
                return {themeColor}
            }
        }
    },
    init:{
        $$global:setState=>{//为global模块指定state的初始化函数
            api.getThemeColor().then(themeColor=>{
                setState({themeColor})
            }).catch(err=>console.log(err))
        }
    },
    computed:{
        m1:{
            name(name){//reverse name
                return name.split('').reverse().join('');
            }
        }
    }
})

```
---
>>4 注意第3点里，注册一个react类到某个模块里成为cc类时，sharedStateKeys可以是这个模块里的任意key，因为cc允许注册不同的react类到同一个模块，例如模块M里拥有5个key为f1、f2、f3、f4、f5, ccClass1通过sharedStateKeys观察模块M的f1、f2, ccClass2通过sharedStateKeys观察模块M的f2、f3、f4，当ccClass1的某个实例改变了f2的值，那么ccClass1的其他实例和ccClass2的所有实例都能感知到f2的变化并被cc触发渲染。<br/>
>>5 cc有一个内建的global模块，所有的ccClass都天生的拥有观察global模块key值变化的能力，注册成为cc类时通过globalStateKeys观察模块global里的任意key。<br/>
>>6 所有cc实例上可以通过prop ccOption设定storedStateKeys,表示该实例上的这些key是需要被cc存储的，这样在该cc实例销毁然后再次挂载回来的时候，cc可以把这些key的值恢复回来。<br/>
>>7 一个cc实例的state的key除了上面所提到的global、 shared、stored这三种类型,剩下的一种key就是默认的temporary类型了，这种key对应的值随着组件销毁就丢失了，再次挂载cc实例时会读取state里的默认值。<br/>
>>8 结合4 5 6 7来看，cc实例里的state是由cc类上申明的sharedStateKeys、globalStateKeys，和cc实例里ccOption申明的storedStateKeys对应的值，再加上剩下的默认的temporaryStateKeys对应的值合并得出来。<br/>



![](https://user-gold-cdn.xitu.io/2019/1/16/168559cf0123ae69?w=1379&h=816&f=png&s=197933)
>>9 和react实例一样，触发cc实例render方法，依然是经典的setState方法，以及上面提到的dispatch定位reducer方法去修改，除了这两种cc还有更多自由的选择，如invoke,effect,xeffect允许用户直接调用自己定义的函数去修改state，同reducer函数一样，可以是普通函数、generator函数、async函数。<br/>
这样的方式让用户有了更多的选择去触发修改state，cc并不强制用户使用哪一种方式，让用户自己摸索和组合更多的最佳实践
>>>invoke一定是修改当前cc实例的state，只需要传入第一位参数为具体的用户自定义执行函数，剩余的其他参数都是执行函数需要的参数。<br/>
>>>effect允许用户修改其他模块的state，第一位参数是moduleName,第二位参数为具体的用户自定义执行函数，剩余的其他参数都是执行函数需要的参数。<br/>
>>>xeffect和effect一样，允许用户修改其他模块的state，第一位参数是moduleName,第二位参数为具体的用户自定义执行函数，剩余的其他参数都是执行函数需要的参数，和effect不一样的地方是xeffect调用的执行函数的参数列表，第一位是cc注入的ExecuteContext对象，里面包含了module, state, moduleState, xeffect,剩下的参数才对应的是是用户调用xeffect是除第一第二位参数以外的其他参数
```
import React,{Component, Fragment} from 'react';
import cc from 'react-control-center';

function* loginFn(changedBy, p1, p2 ,p3){
    return {changedBy, p1:p1+'--tail', p2:'head--'+p2 ,p3}
}

function* forInvoke(changedBy, p1, p2 ,p3){
    const result = yield loginFn(changedBy, p1, p2 ,p3);
    return result;
}
function* forEffect(changedBy, p1, p2 ,p3){
    const result = yield loginFn(changedBy, p1, p2 ,p3);
    return result;
}
function* forXeffect({module, state, moduleState, xeffect}, changedBy, p1, p2 ,p3){
    const result = yield loginFn(changedBy, p1, p2 ,p3);
    return result;
}

@cc.register('Foo')
class Foo extends Component{
     constructor(props, context){
        super(props, context);
        this.state = {changedBy:'none', p1:'', p2:'' ,p3:''};
    }
    render(){
        const {changedBy, p1, p2, p3} = this.state;
        //注，该cc类模块没有显式的声明模块，会被cc当做$$default模块的cc类
        return (
            <Fragment>
                <div>changedBy {changedBy}</div>
                <div>p1 {p1} p2 {p2} p3 {p3}</div>
                <button onClick={()=>this.$$invoke(forInvoke, 11,22,33)}>invoke</button>
                <button onClick={()=>this.$$effect('$$default',forEffect, 11,22,33)}>effect</button>
                <button onClick={()=>this.$$xeffect('$$default',forXeffect, 11,22,33)}>xeffect</button>
            </Fragment>
        );
    }
}
```
>>10 cc定位的容器型组件的状态管理，通常情况一些组件和model非常的有业务关系或者从属关系，我们会把这些react类注册为某个moudle的cc类，观察这个模块中的状态变化，但是有些组件例如一个Workpace类的确需要观察很多模块的状态变化，不算是某个模块对应的视图组件，此时除了用上面说的sharedToGlobalMapping功能，将需要观察各个模块的部分状态映射到global里，然后注册Workpace时为其设定globalStateKeys,就能达到观察多个模块的状态变化的目的之外，cc还提供另一种思路，注册Workpace时设定stateToPropMapping,就可以观察恩义模块的任意key的值变化,和sharedToGlobalMapping不同之处在于，stateToPropMapping要从this.$$propState里取值，sharedToGlobalMapping是从this.state取值，当然stateToPropMapping不需要模块主动的将某些key映射到global里，就能达到跨模块观察状态变化的目录，cc鼓励用户精确对状态归类，并探索最佳组合和最佳实践
```
// these code written in https://github.com/fantasticsoul/rcc-simple-demo/tree/master/src/cc-use-case/WatchMultiModule
// you can update the rcc-simple-demo lastest version, and run it, then switch tab watch-multi-module, you will see what happen
import React from 'react';
import cc from 'react-control-center';

class WatchMultiModule extends React.Component {
  render() {
    console.log('%c@@@ WatchMultiModule', 'color:green; border:1px solid green;');
    console.log(`type cc.setState('todo',{todoList:[{id:Date.now()+'_1',type:'todo',content:'nono'},{id:Date.now()+'_2',type:'todo',content:'nono'}]}) in console`);

    const { gbc, alias_content, counter_result, todoList } = this.$$propState;
    return (
      <div style={{width:'100%',height:'600px', border:'1px solid darkred'}}>
        <div>open your console</div>
        <div>type and then enter to see what happen <span style={{paddingLeft:'28px',color:'red'}}>cc.setState&#40;'counter',&#123;result &#58;  888&#125; &#41;</span></div>
        <div>type and then enter to see what happen <span style={{paddingLeft:'28px',color:'red'}}>cc.setGlobalState&#40; &#123;content:'wowowo'&#125; &#41;;</span></div>
        <div>{gbc}</div>
        <div>{alias_content}</div>
        <div>{counter_result}</div>
        <div>{todoList.length}</div>
      </div>
    );
  }
}

const stateToPropMapping = {
  '$$global/borderColor': 'gbc',
  '$$global/content': 'alias_content',
  'counter/result': 'counter_result',
  'todo/todoList': 'todoList',
};

//two way to declare watching multi module cc class
export default cc.connect('WatchMultiModule', stateToPropMapping)(WatchMultiModule);
//export default cc.register('WatchMultiModule', {stateToPropMapping})(WatchMultiModule);
```

>### github地址：https://github.com/fantasticsoul/react-control-center
---
>### gitee地址：https://gitee.com/nick_zhong/react-control-center
---
>### quick-start demo: https://github.com/fantasticsoul/rcc-simple-demo

期待大家试用并给出修改意见，真心希望能够亲爱你的能够感受的cc的魅力和强大，因为作为redux使用者的我（3年了快），不管是用了原生的redux还是dva封装后的redux，个人都觉得没有cc使用那么的爽快......先从示例项目开始体验吧^_^,期待着你和我有一样的感受