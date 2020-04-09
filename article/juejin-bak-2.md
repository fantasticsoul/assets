[react-control-center tutorial 1] `cc.startup`

> 注：本教程针对的有一定react基础知识的用户，如无任何react只是了解或者开发经验，可以先通过`create-react-app`快速跑起来一个应用并结合官网的知识介绍，再来阅读此文, 对于react开发者可以运行起来quick-start项目做更深的了解
>##### quick-start demo: https://github.com/fantasticsoul/rcc-simple-demo
---
#### startup,让我们把cc启动起来
* cc的启动非常容易，且对第三方包依赖极少，目前仅仅依赖了`co`和`uuid`,react15和16均能够使用
>cc和redux最大的不同之一就是，redux需要在你的顶层App组件之外包裹一个`Provider`组件，用于全局注入和管理`redux`的上下文context，对于cc来说只需要在你定义好cc的启动脚本，然后在你的代码入口文件的第一行里引用改脚本，就可以完成cc的启动工作了，所以使用cc并不会对你现有的代码造成任何入侵，你可以渐进式的在已有项目里局部使用cc，尝试cc的有趣且强大的功能
>>后续会放出and-design-pro的cc版本，改动的代码不超过100行，就完美将其状态管理框架redux迁移到cc
* cc支持两种启动方式
> cc支持以模块化的方式和非模块的方式启动起来，如果以非模块的方式启动，cc的store只会有两个内建的模块存在，即`$$global`和`$$default`模块，如果以模块化的方式启动，则需要用户显示的划分好模块并作为配置参数交个cc启动让cc按照用户的规划理念启动起来。
> 启动起来之后：
>- cc将cc的store绑定到了window.sss下。
>- cc将cc的顶层api绑定到window.cc下。
>- cc将cc的上下文管理对象绑定到window.ccc下和window.CC_CONTEXT下 <br/>
> 用户可以在console里通过sss可以查看当前状态树的最新状态，通过cc直接调用cc提供给开发者的顶层api与各个cc组件产生有趣的互动，这是cc让用户能够体会到cc的强大和有趣的入口之一。

```
/**-----------------[引入cc启动脚本，让整个项目能够使用cc的所有接口]--------*/
/**  code in index.js */
import './startup-cc';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

/**-----------------[不写入任何参数，直接运行cc启动]-----------------------*/
/**  code in  startup-cc.js */
import cc from 'react-control-center';
cc.startup();
```
* 以上示例里，我们调用了`cc.startup()`，启动了cc，在正式介绍cc的各种启动方式和区别之前，我们先来了解一下`startup`函数的签名介绍
> cc.startup(startupOption?:StartupOption);
>- @param `StartupOption.isModuleMode` 是否以模块化方式启动cc，默认是false，cc强烈建议用户设置此项为true，方便用户定义更多的模块
>- @param `StartupOption.store` 为cc配置store
>- @param `StartupOption.reducer` 为cc配置reducer，reducer是一堆按模块划分的函数集合，可以是普通函数、生成器函数、async函数，每一cc实例上都可以通过this.$$dispatch派发action对象调用reducer里的函数，修改响应模块里的值
>- @param `StartupOption.computed` 为cc配置computed，这里配置的是模块级别的computed，在cc实例里通过this.$$moduleComputed取到计算后的值
>- @param `StartupOption.init` 为cc配置init，通常是需要从后端获取后再次赋值给store才需要配置此项
>- @param `StartupOption.sharedToGlobalMapping` 为cc配置sharedToGlobalMapping，用户需要把一些模块的值映射到$$global模块时，需要配置此项
>- @param `StartupOption.moduleSingleClass` 为cc配置`moduleSingleClass`，标记哪些模块只能注册生成一个ccClass，默认cc允许一个模块注册生成多个`cc类`，`moduleSingleClass`是一个对象，key为`moduleName`，值为布尔值，true就表示这个模块只允许注册一个`cc类` <br />
> 大家可以先对这些这些参数有个印象，阅读后面的讲解再逐步理解透这里面每一个参数的具体作用
* 不管是模块话启动还是非模块启动，对于cc来说都存在这模块的概念
> 非模块化启动，cc会内置两个模块`$$default`、`$$global`<br/>
> 一个模块一定包含`state`，`reducer`、`init`、`computed`是可选项，根据用户的实际情况考虑是否配置

![](https://user-gold-cdn.xitu.io/2019/1/16/16855a7571b98b79?w=493&h=343&f=png&s=14846)

*  非模块化模式启动cc，直接启动
> 非模块方式通常适用于小规模的应用，状态划分简单，边界清晰，智能组件较少，开发时对状态的修改都比较清晰，业务上这些组件的领域分类不是很明显，例如基于react写一个表单提交（当然这只是举例，通常一个表单就不需要写成一个单页面应用了，但是如果是写一个生成通用表单的平台，为了方便维护和扩展，享受现代js开发ui带来的友好体验，开发者通常还是会选择一个ui库和状态管理库）
```
/**-----------------[引入cc启动脚本，让整个项目能够使用cc的所有接口]--------*/
/**  code in index.js */
import './startup-cc';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

/**-----------------[不写入任何参数，直接运行cc启动]-----------------------*/
/**  code in  startup-cc.js */
import cc from 'react-control-center';

// 缺省参数启动cc，cc会默认生成两个模块$$default、$$global
cc.startup();
// 在console里输入sss, 可以查看到状态树形如: {$$default:{}, $$global:{}}

```

*  非模块化模式启动cc，配置`$$global`模块和`$$default`模块启动
> 通过上面我们知道以非模块化方式启动cc时，cc会自动创建2个模块`$$default`、`$$global`,但是cc也允许用户显示的申明两个模块的值, 为`StartupOption.store`配置一个初始化的状态树<br/>
> 当用户显示的把store的key写为global或者default任意之一时，cc把store的key当做模块名，将global或者default对应的对象赋值给cc对应global模块或者default模块的状态树，其他多余的key会被cc警告用户使用模块化方式启动才能识别，但是cc只会警告用户，然后忽略这key的值启动起来
```
/**-----------------[规划模块参数启动cc]----------------------------------*/
/**  code in  startup-cc.js */
import cc from 'react-control-center';

// 通过上面我们知道以非模块化方式启动cc时，cc会自动创建2个模块$$default、$$global
// 但是cc也允许用户显示的申明两个模块的值, StartupOption.store 为cc初始化一个状态树
// 当用户显示的把store的key写为$$global或者$default任意之一时，cc把store的key当做
// 模块名，将$$global或者$$default对应的对象赋值给cc对应$$global模块或者$$default
// 模块的状态树，其他多余的key会被cc警告用户使用模块化方式启动才能识别，但是cc只会警告
// 用户，然后忽略这key的值启动起来

cc.startup({
  store:{
    $$global:{
      themeColor:'pink',
      module:'pink',
    },
    $$default:{
      foo:'foo',
      bar:'bar'
    },
    thisModuleWillBeenIgnored:{// 这对于cc来说是一个无效的模块声明
      foo:'foo',
    }
  }
});


// 如果store直接赋值一个普通对象，不包含任何名字为$$default、$$global的key，cc默认
// 将这个对象处理为$$default模块的对象
cc.startup({
  store:{
    themeColor:'pink',
    module:'pink',
  }
});
```

*  非模块化模式启动cc，配置`$$global`模块和`$$default`模块启动，为`$$global`模块配置`reducer`、`init`、`computed`
```
/**  code in  startup-cc.js */
import cc from 'react-control-center';
cc.startup({
  store:{
    $$global:{
      themeColor:'',
      module:'pink',
      bonus:0,
      recommendedLink:'',
    },
    $$default:{
      foo:'foo',
      bar:'bar'
    }
  },
  reducer:{
    $$global:{
      changeThemeColor:function* ({payload:{userId, color}}){
        // 修改主题色，用户获得积分
        const bonus = yield api.changeThemeColor({userId, color});
        return {bonus};
      },
      recoverOriginalThemeColor:async function({payload:{userId}, dispatch}){
        // 恢复最初的主题色，各一个推荐链接
        const recommendedLink = yield api.recoverOriginalThemeColor({userId});
        dispatch({reducerModule:'whatever',type:'trackUser', payload:'wow wow'});
        return {recommendedLink};
      }
    },
    // 注意此处申明了whaterver当做模块值，但是whaterver并没有在store里声明过，cc是允许用户这样做的，因为cc认为recuder可以有自己的模块划分定义，实际上当用户在cc实例里调用dispatch时，
    // 会形如this.$$dispatch({reducerModule:'whatever',type:'trackUser',payload:'cool'})这样，
    // cc会找到对应reducer模块whatever的type为trackUser的函数去执行数据修改逻辑,
    // this.$$dispatch里不指定reducerModule，默认会找Action对象里指定的module当做reducerModule，
    // Action对对象里没有指定module,会把当前cc实例所属的module当做reducerModule
    whaterver:{
      trackUser: function*(){
        // ... ...
      }
    }
  },
  init:{
    $$global:setState=>{
      api.getInitThemeColor(themeColor=>{
        setState({themeColor});
      })
    }
  },
  computed:{
    $$global:{
      themeColor(themeColor){// 当themeColor发生变化时，计算新的值，cc实例里的this.$$globalComputed.themeColor可以取到
        return {spanBorder:`2px solid ${themeColor}`, pBorder:`8px solid ${themeColor}`};
      }
    },
    $default:{
      foo(foo){// 反转foo字符串, cc实例里this.$$moduleComputed.foo可以取到改计算值
        return foo.split('').reverse().join('');
      }
    }
  }
});
```
*  模块化模式启动cc，
> 需要在StartOption显示的设定`isModuleMode`为true，其他方式和上面的非模块的方式一样，唯一不同的是cc允许你使用其他名字作为模块名了，还允许你自定义StartOption.`sharedToGlobalMapping`将某些模块里的某些key起个别名映射到`$$global`模块里.<br/>
> cc提供`sharedToGlobalMapping`是因为在cc世界里，一个cc类只能观察注册的所属模块的状态变化（即一个cc类直属于一个模块），但是所有cc类都能够观察global模块的转态变化，当cc类需要观察其他模块的某些key的状态变化时，需要那个模块先将它的这些key映射到`$$global`里，然后cc类观察映射到`$$global`里的这些key，就达到了一个`cc类`可以观察多个模块变化的目的
```
/**  code in  startup-cc.js */
import cc from 'react-control-center';
cc.startup({
  store:{
    $$global:{
      themeColor:'',
      module:'pink',
      bonus:0,
      recommendedLink:'',
    },
    $$default:{
      foo:'foo',
      bar:'bar'
    },
    foo:{
      f1:'f1',
      f2:'f2',
    },
    bar:{
      f1:'f1',
      f2:'f2',
    }
  },
  //其他配置略 .......

  // 映射时注意命名冲突
  sharedToGlobalMapping:{
    // 以下配置将foo模块的f1、f2字段映射到$$global里，因为$$global没有名字为f1、f2的字段，这里就不再起别名了
    foo:{
      f1:'f1',
      f2:'f2',
    },
    // 以下配置将bar模块的f1、f2字段映射到$$global里分别为bf1、bf2，因为$$global模块里已经存在了f1,f2，所以这里起了别名
    bar:{
      f1:'bf1',
      f2:'bf2',
    }
  }
}
```

* 以上对`startup`的解释相信不少读者一定还有疑问，因为提前提到了一些后面还会进一步详细解释的名词概念，
>- 比如配合讲解`reducer`时提到了cc实例的`$$dispatch`, 
>- 配合讲解`sharedToGlobalMapping`时，提到了观察多个模块状态变化，cc除了使用`sharedToGlobalMapping`达到观察多个模块状态变化的目的，还提供更强大的方式，注册为cc类时候声明`stateToPropMapping`，可以不用把目标观察模块的key映射到`$$global`就能够观察其他模块的状态变化，后面会做详解
>- 提到了一个`模块`可以注册多个`cc类`，整个cc世界里，`cc类`、`react类`、和`模块`的关系会如下图，大家可以先做简单了解，后面再回顾此图会理解更深

![](https://user-gold-cdn.xitu.io/2019/1/16/168559cf0123ae69?w=1379&h=816&f=png&s=197933)

#### C_C welcom to cc world
>#### quick-start demo: https://github.com/fantasticsoul/rcc-simple-demo