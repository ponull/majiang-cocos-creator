var EventBus = require('EventBus');

/**
 * Global - 全局状态管理模块
 * 
 * 管理全局应用状态，通过EventBus发出状态变更事件，
 * 使得其他模块可以响应状态变化而不需要直接引用Global。
 */
var Global = cc.Class({
    extends: cc.Component,
    statics: {
        isstarted: false,
        netinited: false,
        userguid: 0,
        nickname: "",
        money: 0,
        lv: 0,
        roomId: 0,
        
        /**
         * 更新状态并触发事件
         * @param {string} key - 状态键名
         * @param {*} value - 新值
         */
        setState: function(key, value) {
            var oldValue = this[key];
            if (oldValue !== value) {
                this[key] = value;
                EventBus.emit('global_state_changed', {
                    key: key,
                    oldValue: oldValue,
                    newValue: value
                });
            }
        },
        
        /**
         * 重置所有状态
         */
        reset: function() {
            this.isstarted = false;
            this.netinited = false;
            this.userguid = 0;
            this.nickname = "";
            this.money = 0;
            this.lv = 0;
            this.roomId = 0;
        }
    },
});