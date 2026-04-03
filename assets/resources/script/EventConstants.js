/**
 * EventConstants - 事件常量定义模块
 * 
 * 将所有跨模块使用的事件名称集中管理，避免硬编码字符串，
 * 便于维护和重构。
 */

var EventConstants = {
    // 网络事件
    NET: {
        CONNECTED: 'net_connected',
        DISCONNECTED: 'net_disconnected',
        RECONNECTING: 'net_reconnecting',
        LOGIN_RESULT: 'login_result',
        LOGIN_FINISHED: 'login_finished',
    },
    
    // 用户事件
    USER: {
        AUTH_SUCCESS: 'user_auth_success',
        AUTH_FAILED: 'user_auth_failed',
        LOGIN_SUCCESS: 'user_login_success',
        CREATED: 'user_created',
        STATE_CHANGED: 'user_state_push',
        NEW_USER: 'new_user_comes_push',
        READY: 'user_ready_push',
    },
    
    // 游戏事件
    GAME: {
        HOLDS: 'game_holds',
        BEGIN: 'game_begin',
        SYNC: 'game_sync',
        CHUPAI: 'game_chupai',
        MOPAI: 'game_mopai',
        ACTION: 'game_action',
        OVER: 'game_over',
        END: 'game_end',
        HUPAI: 'hupai',
        NUM_OF_GAMES: 'game_num',
        DINGQUE: 'game_dingque',
        DINGQUE_FINISH: 'game_dingque_finish',
        DINGQUE_NOTIFY: 'game_dingque_notify',
        HUAN_SAN_ZHANG: 'game_huansanzhang',
        HUAN_SAN_ZHANG_FINISH: 'game_huansanzhang_finish',
        HUAN_SAN_ZHANG_NOTIFY: 'game_huansanzhang_notify',
    },
    
    // 游戏操作事件
    ACTION: {
        PENG: 'peng_notify',
        GANG: 'gang_notify',
        PENG_PUSH: 'peng_push',
        GANG_PUSH: 'gang_push',
        HU: 'hu',
        GUO: 'guo',
    },
    
    // 房间事件
    ROOM: {
        CREATED: 'room_created',
        ENTERED: 'room_entered',
        EXITED: 'exit_notify_push',
        EXIT_RESULT: 'exit_result',
        DISSOLVED: 'dispress_push',
        DISSOLVE_REQUEST: 'dissolve_notice_push',
        DISSOLVE_CANCEL: 'dissolve_cancel_push',
    },
    
    // 聊天事件
    CHAT: {
        TEXT: 'chat_push',
        QUICK: 'quick_chat_push',
        VOICE: 'voice_msg_push',
        EMOJI: 'emoji_push',
    },
    
    // UI事件
    UI: {
        LOADING_PROGRESS: 'loading_progress',
        LOADING_COMPLETE: 'loading_complete',
        SHOW_DIALOG: 'show_dialog',
        HIDE_DIALOG: 'hide_dialog',
    },
};

module.exports = EventConstants;
