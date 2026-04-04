'use strict';

const { Op, QueryTypes } = require('sequelize');
const { randomUUID } = require('crypto');
const modelsModule = require('../models');
const crypto = require('./crypto');

function nop() {}

exports.init = function (config) {
    modelsModule.init(config);
};

// Low-level raw query (kept for backward compatibility)
exports.query = function (sql, callback) {
    callback = callback || nop;
    modelsModule.getInstance().query(sql, { type: QueryTypes.RAW })
        .then(([rows, meta]) => callback(null, rows, meta))
        .catch(err => callback(err, null, null));
};

// ─── Accounts ────────────────────────────────────────────────────────────────

exports.is_account_exist = function (account, callback) {
    callback = callback || nop;
    if (account == null) { callback(false); return; }

    modelsModule.models.Account.findOne({ where: { account } })
        .then(row => callback(row != null))
        .catch(err => { console.error(err); callback(false); });
};

exports.create_account = function (account, password, callback) {
    callback = callback || nop;
    if (account == null || password == null) { callback(false); return; }

    const psw = crypto.hashPassword(password);
    modelsModule.models.Account.create({ account, password: psw })
        .then(() => callback(true))
        .catch(err => {
            if (err.name === 'SequelizeUniqueConstraintError') { callback(false); return; }
            console.error(err);
            callback(false);
        });
};

exports.get_account_info = function (account, password, callback) {
    callback = callback || nop;
    if (account == null) { callback(null); return; }

    modelsModule.models.Account.findOne({ where: { account } })
        .then(row => {
            if (!row) { callback(null); return; }
            if (password != null) {
                if (!crypto.verifyPassword(password, row.password)) { callback(null); return; }
            }
            callback(row.toJSON());
        })
        .catch(err => { console.error(err); callback(null); });
};

// ─── Users ────────────────────────────────────────────────────────────────────

exports.is_user_exist = function (account, callback) {
    callback = callback || nop;
    if (account == null) { callback(false); return; }

    modelsModule.models.User.findOne({ where: { account }, attributes: ['userid'] })
        .then(row => callback(row != null))
        .catch(err => { console.error(err); callback(false); });
};

exports.get_user_data = function (account, callback) {
    callback = callback || nop;
    if (account == null) { callback(null); return; }

    modelsModule.models.User.findOne({
        where: { account },
        attributes: ['userid', 'account', 'name', 'lv', 'exp', 'coins', 'gems', 'roomid', 'sex'],
    }).then(row => {
        if (!row) { callback(null); return; }
        const data = row.toJSON();
        data.name = crypto.fromBase64(data.name || '');
        callback(data);
    }).catch(err => { console.error(err); callback(null); });
};

exports.get_user_data_by_userid = function (userid, callback) {
    callback = callback || nop;
    if (userid == null) { callback(null); return; }

    modelsModule.models.User.findOne({
        where: { userid },
        attributes: ['userid', 'account', 'name', 'lv', 'exp', 'coins', 'gems', 'roomid', 'sex'],
    }).then(row => {
        if (!row) { callback(null); return; }
        const data = row.toJSON();
        data.name = crypto.fromBase64(data.name || '');
        callback(data);
    }).catch(err => { console.error(err); callback(null); });
};

exports.add_user_gems = function (userid, gems, callback) {
    callback = callback || nop;
    if (userid == null) { callback(false); return; }

    modelsModule.models.User.findOne({ where: { userid } })
        .then(row => {
            if (!row) { callback(false); return; }
            return row.increment('gems', { by: Number(gems) }).then(() => callback(true));
        })
        .catch(err => { console.error(err); callback(false); });
};

exports.get_gems = function (account, callback) {
    callback = callback || nop;
    if (account == null) { callback(null); return; }

    modelsModule.models.User.findOne({ where: { account }, attributes: ['gems'] })
        .then(row => callback(row ? row.toJSON() : null))
        .catch(err => { console.error(err); callback(null); });
};

exports.get_user_history = function (userId, callback) {
    callback = callback || nop;
    if (userId == null) { callback(null); return; }

    modelsModule.models.User.findOne({ where: { userid: userId }, attributes: ['history'] })
        .then(row => {
            if (!row || !row.history) { callback(null); return; }
            try {
                callback(JSON.parse(row.history));
            } catch (e) {
                callback(null);
            }
        })
        .catch(err => { console.error(err); callback(null); });
};

exports.update_user_history = function (userId, history, callback) {
    callback = callback || nop;
    if (userId == null || history == null) { callback(false); return; }

    const historyStr = JSON.stringify(history);
    modelsModule.models.User.update(
        { roomid: null, history: historyStr },
        { where: { userid: userId } }
    ).then(([affected]) => callback(affected > 0))
     .catch(err => { console.error(err); callback(false); });
};

exports.create_user = function (account, name, coins, gems, sex, headimg, callback) {
    callback = callback || nop;
    if (account == null || name == null || coins == null || gems == null) { callback(false); return; }

    const encodedName = crypto.toBase64(name);
    modelsModule.models.User.create({ account, name: encodedName, coins, gems, sex, headimg })
        .then(() => callback(true))
        .catch(err => { console.error(err); callback(false); });
};

exports.update_user_info = function (userid, name, headimg, sex, callback) {
    callback = callback || nop;
    if (userid == null) { callback(null); return; }

    const encodedName = crypto.toBase64(name);
    modelsModule.models.User.update(
        { name: encodedName, headimg, sex },
        { where: { account: userid } }
    ).then(([affected]) => callback(affected))
     .catch(err => { console.error(err); callback(null); });
};

exports.get_user_base_info = function (userid, callback) {
    callback = callback || nop;
    if (userid == null) { callback(null); return; }

    modelsModule.models.User.findOne({
        where: { userid },
        attributes: ['name', 'sex', 'headimg'],
    }).then(row => {
        if (!row) { callback(null); return; }
        const data = row.toJSON();
        data.name = crypto.fromBase64(data.name || '');
        callback(data);
    }).catch(err => { console.error(err); callback(null); });
};

// ─── Gems / currency ─────────────────────────────────────────────────────────

exports.cost_gems = function (userid, cost, callback) {
    callback = callback || nop;
    modelsModule.models.User.findOne({ where: { userid } })
        .then(row => {
            if (!row) { callback(false); return; }
            return row.decrement('gems', { by: Number(cost) }).then(() => callback(true));
        })
        .catch(err => { console.error(err); callback(false); });
};

// ─── Room membership ─────────────────────────────────────────────────────────

exports.set_room_id_of_user = function (userId, roomId, callback) {
    callback = callback || nop;
    modelsModule.models.User.update({ roomid: roomId || null }, { where: { userid: userId } })
        .then(([affected]) => callback(affected > 0))
        .catch(err => { console.error(err); callback(false); });
};

exports.get_room_id_of_user = function (userId, callback) {
    callback = callback || nop;
    modelsModule.models.User.findOne({ where: { userid: userId }, attributes: ['roomid'] })
        .then(row => callback(row ? row.roomid : null))
        .catch(err => { console.error(err); callback(null); });
};

// ─── Rooms ────────────────────────────────────────────────────────────────────

exports.is_room_exist = function (roomId, callback) {
    callback = callback || nop;
    modelsModule.models.Room.findOne({ where: { id: roomId } })
        .then(row => callback(row != null))
        .catch(err => { console.error(err); callback(false); });
};

exports.create_room = function (roomId, conf, ip, port, create_time, callback) {
    callback = callback || nop;
    const uuid = randomUUID();
    const baseInfo = JSON.stringify(conf);
    modelsModule.models.Room.create({ uuid, id: roomId, base_info: baseInfo, ip, port, create_time })
        .then(() => callback(uuid))
        .catch(err => { console.error(err); callback(null); });
};

exports.get_room_uuid = function (roomId, callback) {
    callback = callback || nop;
    modelsModule.models.Room.findOne({ where: { id: roomId }, attributes: ['uuid'] })
        .then(row => callback(row ? row.uuid : null))
        .catch(err => { console.error(err); callback(null); });
};

exports.update_seat_info = function (roomId, seatIndex, userId, icon, name, callback) {
    callback = callback || nop;
    const encodedName = crypto.toBase64(name);
    const fields = {};
    fields[`user_id${seatIndex}`] = userId;
    fields[`user_icon${seatIndex}`] = icon;
    fields[`user_name${seatIndex}`] = encodedName;
    modelsModule.models.Room.update(fields, { where: { id: roomId } })
        .then(([affected]) => callback(affected > 0))
        .catch(err => { console.error(err); callback(false); });
};

exports.update_num_of_turns = function (roomId, numOfTurns, callback) {
    callback = callback || nop;
    modelsModule.models.Room.update({ num_of_turns: numOfTurns }, { where: { id: roomId } })
        .then(([affected]) => callback(affected > 0))
        .catch(err => { console.error(err); callback(false); });
};

exports.update_next_button = function (roomId, nextButton, callback) {
    callback = callback || nop;
    modelsModule.models.Room.update({ next_button: nextButton }, { where: { id: roomId } })
        .then(([affected]) => callback(affected > 0))
        .catch(err => { console.error(err); callback(false); });
};

exports.get_room_addr = function (roomId, callback) {
    callback = callback || nop;
    if (roomId == null) { callback(false, null, null); return; }

    modelsModule.models.Room.findOne({ where: { id: roomId }, attributes: ['ip', 'port'] })
        .then(row => {
            if (row) { callback(true, row.ip, row.port); }
            else { callback(false, null, null); }
        })
        .catch(err => { console.error(err); callback(false, null, null); });
};

exports.get_room_data = function (roomId, callback) {
    callback = callback || nop;
    if (roomId == null) { callback(null); return; }

    modelsModule.models.Room.findOne({ where: { id: roomId } })
        .then(row => {
            if (!row) { callback(null); return; }
            const data = row.toJSON();
            data.user_name0 = crypto.fromBase64(data.user_name0 || '');
            data.user_name1 = crypto.fromBase64(data.user_name1 || '');
            data.user_name2 = crypto.fromBase64(data.user_name2 || '');
            data.user_name3 = crypto.fromBase64(data.user_name3 || '');
            callback(data);
        })
        .catch(err => { console.error(err); callback(null); });
};

exports.delete_room = function (roomId, callback) {
    callback = callback || nop;
    if (roomId == null) { callback(false); return; }

    modelsModule.models.Room.destroy({ where: { id: roomId } })
        .then(affected => callback(affected > 0))
        .catch(err => { console.error(err); callback(false); });
};

// ─── Games ────────────────────────────────────────────────────────────────────

exports.create_game = function (room_uuid, index, base_info, callback) {
    callback = callback || nop;
    const create_time = Math.floor(Date.now() / 1000);
    modelsModule.models.Game.create({ room_uuid, game_index: index, base_info, create_time })
        .then(row => callback(row ? row.game_index : null))
        .catch(err => { console.error(err); callback(null); });
};

exports.delete_games = function (room_uuid, callback) {
    callback = callback || nop;
    if (room_uuid == null) { callback(false); return; }

    modelsModule.models.Game.destroy({ where: { room_uuid } })
        .then(affected => callback(affected >= 0))
        .catch(err => { console.error(err); callback(false); });
};

exports.archive_games = function (room_uuid, callback) {
    callback = callback || nop;
    if (room_uuid == null) { callback(false); return; }

    modelsModule.models.Game.findAll({ where: { room_uuid } })
        .then(async rows => {
            if (rows.length === 0) {
                await exports._deleteGamesAsync(room_uuid);
                callback(true);
                return;
            }
            const data = rows.map(r => r.toJSON());
            await modelsModule.models.GameArchive.bulkCreate(data, { ignoreDuplicates: true });
            await exports._deleteGamesAsync(room_uuid);
            callback(true);
        })
        .catch(err => { console.error(err); callback(false); });
};

exports._deleteGamesAsync = function (room_uuid) {
    return modelsModule.models.Game.destroy({ where: { room_uuid } });
};

exports.update_game_action_records = function (room_uuid, index, actions, callback) {
    callback = callback || nop;
    modelsModule.models.Game.update(
        { action_records: actions },
        { where: { room_uuid, game_index: index } }
    ).then(([affected]) => callback(affected > 0))
     .catch(err => { console.error(err); callback(false); });
};

exports.update_game_result = function (room_uuid, index, result, callback) {
    callback = callback || nop;
    if (room_uuid == null) { callback(false); return; }

    const resultStr = JSON.stringify(result);
    modelsModule.models.Game.update(
        { result: resultStr },
        { where: { room_uuid, game_index: index } }
    ).then(([affected]) => callback(affected > 0))
     .catch(err => { console.error(err); callback(false); });
};

// ─── Game history (archive) ───────────────────────────────────────────────────

exports.get_games_of_room = function (room_uuid, callback) {
    callback = callback || nop;
    if (room_uuid == null) { callback(null); return; }

    modelsModule.models.GameArchive.findAll({
        where: { room_uuid },
        attributes: ['game_index', 'create_time', 'result'],
    }).then(rows => callback(rows.length > 0 ? rows.map(r => r.toJSON()) : null))
      .catch(err => { console.error(err); callback(null); });
};

exports.get_detail_of_game = function (room_uuid, index, callback) {
    callback = callback || nop;
    if (room_uuid == null || index == null) { callback(null); return; }

    modelsModule.models.GameArchive.findOne({
        where: { room_uuid, game_index: index },
        attributes: ['base_info', 'action_records'],
    }).then(row => callback(row ? row.toJSON() : null))
      .catch(err => { console.error(err); callback(null); });
};

// ─── Messages ─────────────────────────────────────────────────────────────────

exports.get_message = function (type, version, callback) {
    callback = callback || nop;
    const where = { type };
    if (version && version !== 'null') {
        where.version = { [Op.ne]: version };
    }
    modelsModule.models.Message.findOne({ where })
        .then(row => callback(row ? row.toJSON() : null))
        .catch(err => { console.error(err); callback(null); });
};
