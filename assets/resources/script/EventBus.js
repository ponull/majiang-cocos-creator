/**
 * EventBus - 全局事件总线
 * 
 * 提供跨模块的事件通信机制，替代直接引用全局对象的紧耦合方式。
 * 各模块通过事件总线进行通信，降低模块间的依赖关系。
 * 
 * 用法：
 *   var EventBus = require('EventBus');
 *   
 *   // 监听事件
 *   EventBus.on('eventName', callback, target);
 *   
 *   // 触发事件
 *   EventBus.emit('eventName', data);
 *   
 *   // 取消监听
 *   EventBus.off('eventName', callback, target);
 */

var EventBus = {
    _listeners: {},
    
    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     * @param {object} target - 回调函数的this上下文（可选）
     */
    on: function(event, callback, target) {
        if (!event || !callback) {
            console.warn('EventBus.on: event and callback are required');
            return;
        }
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push({
            callback: callback,
            target: target || null
        });
    },
    
    /**
     * 注册一次性事件监听器（触发一次后自动移除）
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     * @param {object} target - 回调函数的this上下文（可选）
     */
    once: function(event, callback, target) {
        var self = this;
        var wrapper = function(data) {
            callback.call(target, data);
            self.off(event, wrapper, target);
        };
        this.on(event, wrapper, target);
    },
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据（可选）
     */
    emit: function(event, data) {
        var listeners = this._listeners[event];
        if (!listeners || listeners.length === 0) {
            return;
        }
        // 复制一份避免在回调中修改数组导致问题
        var list = listeners.slice();
        for (var i = 0; i < list.length; i++) {
            var listener = list[i];
            if (listener.target) {
                listener.callback.call(listener.target, data);
            } else {
                listener.callback(data);
            }
        }
    },
    
    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     * @param {object} target - 回调函数的this上下文（可选）
     */
    off: function(event, callback, target) {
        var listeners = this._listeners[event];
        if (!listeners) {
            return;
        }
        target = target || null;
        for (var i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].callback === callback && listeners[i].target === target) {
                listeners.splice(i, 1);
            }
        }
        if (listeners.length === 0) {
            delete this._listeners[event];
        }
    },
    
    /**
     * 移除指定target的所有事件监听器
     * @param {object} target - 目标对象
     */
    offTarget: function(target) {
        if (!target) return;
        for (var event in this._listeners) {
            var listeners = this._listeners[event];
            for (var i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].target === target) {
                    listeners.splice(i, 1);
                }
            }
            if (listeners.length === 0) {
                delete this._listeners[event];
            }
        }
    },
    
    /**
     * 移除所有事件监听器
     */
    offAll: function() {
        this._listeners = {};
    }
};

module.exports = EventBus;
