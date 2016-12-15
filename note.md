* 排序逻辑:
按住(需要控制1秒后才执行逻辑, 如1秒内释放了, 则逻辑不执行, 并将初始值重置), 拖动开始的cell当前对应的component放大1.2倍, 并且cell当前对应的component坐标移动, 中心点与当前按住坐标一致
移动, 拖动开始的cell当前对应的component坐标移动, 中心点与当前移动坐标一致
比较当前拖动停留在上面的cell下标顺序, 和当前初始的cell(一开始为拖动开始的cell, 经过停留的cell后, 值变更为该停留的cell)下标顺序, 得到拖动的逻辑方向(从下往上移动, 从上往下移动, 水平移动)
根据拖动的逻辑方向, 以及触发停留在上面的cell, 计算得出哪些cell(顺序下标)需要执行动画
cell执行动画, 需要注意的是, 从下往上时, 执行动画的cell向后移1位, 但行尾的cell需要特殊处理(左下斜移至下一行的行首)
cell执行动画, 需要注意的是, 从上往下时, 执行动画的cell向前移1位, 但行首的cell需要特殊处理(右上斜移至上一行的行首)
cell执行动画, 需要注意的是, 水平时, 当前初始的cell和当前拖动停留在上面的cell位置互换
释放, 拖动开始的cell执行动画, 最终位置为当前拖动停留在上面的cell的位置

* 删除逻辑:
选择的当前cell进行删除, 并且执行排序逻辑中的从上往下拖动的逻辑, 停留项下标直接指定为当前cells的最后一项的下标

* 新增逻辑:
新增一项在当前cells末尾

* 发现问题:
0. 在更新数据源state, 重新触发render前, 将实例中每个cell对应的ref等信息缓存列表清空总是失败,
每次总是恢复到初始化时的旧数据源对应的缓存列表, 但ref的回调函数中的日志输出时却没有问题.
解决办法, 在ref回调函数中判断遍历到最后一项时, 再对该缓存列表进行处理

1. TouchStart -> TouchMove -> TouchEnd事件顺序触发, 在某些情况下并非是期望的顺序, 需要根据情况自行加变量判断处理

2. 通过设置state来变更列表的数据源时(例如, 当前数据源是[1, 2, 3], 下一个state是[2, 1, 3]),
有时(android每次都)会报错或者出现最终UI渲染异常的情况(但检查state及render方法却没有发现异常, 推测可能是diff算法比较后, native实现的处理有隐藏bug导致),
解决办法, 在设置下一个state之前, 设置中间state为空列表(中间state数据源是[]), 即可神奇的解决该问题

3. PanResponder与Touchable系列的View的事件冲突, 默认情况下父容器加入了PanResponder, 子View为Touchable系列的View时将不会触发事件,
解决办法, 手动控制onStartShouldSetPanResponder, onMoveShouldSetPanResponder
```js
onStartShouldSetPanResponder: (e, gestureState) => {
    //for android, fix the weird conflict between PanRespander and ScrollView
    return this.state.sortable
},
onMoveShouldSetPanResponder: (e, gestureState) => {
    //for ios/android, fix the conflict between PanRespander and TouchableView
    var x = gestureState.dx;
    var y = gestureState.dy;
    if (x != 0 && y != 0) {
        return true;
    }
    return false;
},
```

