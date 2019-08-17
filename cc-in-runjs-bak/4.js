
// 非模块启动cc，cc内置两个模块$$global,$$default
// 所有组件都属于$$default模块
cc.startup(
    {
        store: {
            '$$global': {
                name: 11
            },
            '$$default': {
                age: 22
            }
        },
        errorHandler: err => console.log(err),
    }
);


var a = {
    reducer: {
        //我们为$$default定义一个方法吧
        $$default: {
            async changeName({ payload: name }) {
                console.log(`recevie name ${name}`);
                //await sleep(3000);
                return { name };
            },
            
        },
        //其实reducer模块的名字可以不用和state的模块名字一样哦
        foo: {
            async changeName({ payload: name }) {
                console.log(`recevie name ${name}`);
                //await sleep(3000);
                return { name };
            }
        }
    },
}