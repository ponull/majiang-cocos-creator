'use strict';

const { Op } = require('sequelize');
const crypto = require('./crypto');
const modelsModule = require('../models');

exports.init = function (config) {
    modelsModule.init(config);
};

// ─── Dealer CRUD ─────────────────────────────────────────────────────────────

exports.create_dealer = async function (account, password, name, parent, privi) {
    if (account == null || password == null) return false;

    const hashedPwd = crypto.hashPassword(password);
    try {
        await modelsModule.models.Dealer.create({
            account, password: hashedPwd, name, parent,
            create_time: Date.now(), privilege_level: privi,
        });
        await exports.update_cumulative(parent, 2, 1);
        return true;
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') return false;
        console.error(err);
        return false;
    }
};

exports.search_sub_dealers = async function (parent, start, rows) {
    if (parent == null || parent === '') return null;
    try {
        const result = await modelsModule.models.Dealer.findAll({
            where: { parent },
            attributes: ['account', 'name', 'gems', 'score', 'all_gems', 'all_score', 'all_subs'],
            offset: Number(start),
            limit: Number(rows),
        });
        return result.map(r => r.toJSON());
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.get_sub_dealer_by_account = async function (account, parent) {
    if (account == null || parent == null) return null;
    try {
        const row = await modelsModule.models.Dealer.findOne({
            where: { account, parent },
            attributes: ['account', 'name', 'gems', 'score', 'all_gems', 'all_score', 'all_subs'],
        });
        return row ? row.toJSON() : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.get_dealer_kpi = async function (account, year) {
    if (!account || !year) return null;
    try {
        const rows = await modelsModule.models.DealerKpi.findAll({ where: { account, year } });
        return rows.map(r => r.toJSON());
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.update_kpi = async function (account, year, month, type, value) {
    if (account == null) return false;

    let col;
    switch (type) {
        case 0: col = 'gems'; break;
        case 1: col = 'score'; break;
        case 2: col = 'subs'; break;
        default: return false;
    }

    try {
        const [row, created] = await modelsModule.models.DealerKpi.findOrCreate({
            where: { account, year, month },
            defaults: { account, year, month, gems: 0, score: 0, subs: 0 },
        });
        await row.increment(col, { by: Number(value) });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.get_dealer_by_account = async function (account) {
    if (account == null) return null;
    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { account } });
        return row ? row.toJSON() : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

exports.check_account = async function (account, password) {
    if (account == null || password == null) return null;
    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { account } });
        if (!row) return null;
        if (!crypto.verifyPassword(password, row.password)) return null;
        return row.toJSON();
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.get_dealer_by_token = async function (token) {
    if (token == null) return null;
    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { token } });
        return row ? row.toJSON() : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.update_token = async function (account, token) {
    if (account == null || token == null) return false;
    try {
        const [affected] = await modelsModule.models.Dealer.update(
            { token },
            { where: { account } }
        );
        return affected > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.change_decaler_pwd = async function (account, oldPwd, newPwd) {
    if (account == null || oldPwd == null || newPwd == null) return false;
    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { account } });
        if (!row) return false;
        if (!crypto.verifyPassword(oldPwd, row.password)) return false;
        row.password = crypto.hashPassword(newPwd);
        await row.save();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

// ─── User game info ───────────────────────────────────────────────────────────

exports.get_user_game_info = async function (userid) {
    if (userid == null) return null;
    try {
        const row = await modelsModule.models.User.findOne({
            where: { userid },
            attributes: ['userid', 'name', 'gems', 'headimg'],
        });
        if (!row) return null;
        const data = row.toJSON();
        data.name = Buffer.from(data.name || '', 'base64').toString();
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
};

// ─── Gems / Currency ─────────────────────────────────────────────────────────

exports.dec_dealer_gems = async function (account, gems) {
    try {
        const row = await modelsModule.models.Dealer.findOne({
            where: { account, gems: { [Op.gte]: Number(gems) } },
        });
        if (!row) return false;
        await row.decrement('gems', { by: Number(gems) });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.add_dealer_gems = async function (account, gems) {
    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { account } });
        if (!row) return false;
        await row.increment('gems', { by: Number(gems) });
        await exports.update_cumulative(account, 0, gems);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.dec_dealer_score = async function (account, score) {
    try {
        const row = await modelsModule.models.Dealer.findOne({
            where: { account, score: { [Op.gte]: Number(score) } },
        });
        if (!row) return false;
        await row.decrement('score', { by: Number(score) });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.add_dealer_score = async function (account, score) {
    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { account } });
        if (!row) return false;
        await row.increment('score', { by: Number(score) });
        await exports.update_cumulative(account, 1, score);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.add_user_gems = async function (userid, gems) {
    try {
        const row = await modelsModule.models.User.findOne({ where: { userid } });
        if (!row) return false;
        await row.increment('gems', { by: Number(gems) });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

// ─── Cumulative stats ─────────────────────────────────────────────────────────

exports.update_cumulative = async function (account, type, value) {
    if (account == null) return false;

    let col;
    switch (type) {
        case 0: col = 'all_gems'; break;
        case 1: col = 'all_score'; break;
        case 2: col = 'all_subs'; break;
        default: return false;
    }

    try {
        const row = await modelsModule.models.Dealer.findOne({ where: { account } });
        if (!row) return false;
        await row.increment(col, { by: Number(value) });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

// ─── Bills ────────────────────────────────────────────────────────────────────

exports.add_bill_record = async function (orderid, operator, target, num, time, note) {
    try {
        const row = await modelsModule.models.Bill.create({ orderid, operator, target, num, time, note });
        return row != null;
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') return false;
        console.error(err);
        return false;
    }
};

// ─── Rates ────────────────────────────────────────────────────────────────────

exports.get_rates = async function () {
    try {
        const row = await modelsModule.models.Rate.findOne();
        return row ? row.toJSON() : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.update_rates = async function (rate1, rate2, rate3) {
    try {
        const [affected] = await modelsModule.models.Rate.update(
            { rate1, rate2, rate3 },
            { where: { id: 1 } }
        );
        return affected > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
};

// ─── Notices ──────────────────────────────────────────────────────────────────

exports.get_notice = async function () {
    const now = Date.now();
    try {
        const rows = await modelsModule.models.DealerNotice.findAll({
            where: {
                act_time: { [Op.lte]: now },
                end_time: { [Op.or]: [{ [Op.gt]: now }, { [Op.eq]: -1 }] },
            },
            order: [['act_time', 'DESC']],
        });
        return rows.map(r => r.toJSON());
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.get_notice_all = async function () {
    try {
        const rows = await modelsModule.models.DealerNotice.findAll({ order: [['act_time', 'DESC']] });
        return rows.length > 0 ? rows.map(r => r.toJSON()) : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.update_notice = async function (id, title, content, level, actTime, endTime) {
    try {
        const [affected] = await modelsModule.models.DealerNotice.update(
            { title, content, level, act_time: actTime, end_time: endTime },
            { where: { id } }
        );
        return affected > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.insert_notice = async function (title, content, level, actTime, endTime) {
    try {
        const row = await modelsModule.models.DealerNotice.create({
            title, content, level, act_time: actTime, end_time: endTime,
        });
        return row != null;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.delete_notice = async function (id) {
    try {
        const affected = await modelsModule.models.DealerNotice.destroy({ where: { id } });
        return affected > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
};

// ─── Goods ────────────────────────────────────────────────────────────────────

exports.get_goods = async function () {
    const now = Date.now();
    try {
        const rows = await modelsModule.models.DealerGoods.findAll({
            where: {
                act_time: { [Op.lte]: now },
                end_time: { [Op.or]: [{ [Op.gt]: now }, { [Op.eq]: -1 }] },
                state: 1,
            },
            order: [['act_time', 'DESC']],
        });
        return rows.length > 0 ? rows.map(r => r.toJSON()) : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.get_goods_id = async function (id) {
    const now = Date.now();
    try {
        const row = await modelsModule.models.DealerGoods.findOne({
            where: {
                id,
                act_time: { [Op.lte]: now },
                end_time: { [Op.or]: [{ [Op.gt]: now }, { [Op.eq]: -1 }] },
                state: 1,
            },
        });
        return row ? row.toJSON() : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

exports.get_goods_all = exports.get_goods;

exports.update_goods = async function (id, goodsName, goodsType, goodsNum, goodPrice, priceType, state, actTime, endTime) {
    try {
        const [affected] = await modelsModule.models.DealerGoods.update(
            { goods_name: goodsName, goods_type: goodsType, goods_num: goodsNum,
              goods_price: goodPrice, price_type: priceType, state, act_time: actTime, end_time: endTime },
            { where: { id } }
        );
        return affected > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.insert_goods = async function (goodsName, goodsType, goodsNum, goodPrice, priceType, state, actTime, endTime) {
    try {
        const row = await modelsModule.models.DealerGoods.create({
            goods_name: goodsName, goods_type: goodsType, goods_num: goodsNum,
            goods_price: goodPrice, price_type: priceType, state, act_time: actTime, end_time: endTime,
        });
        return row != null;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.buy_goods_log = async function (account, goodsType, goodsNum, goodPrice, priceType, time) {
    try {
        const row = await modelsModule.models.BuyGoodsLog.create({
            account, goods_type: goodsType, goods_num: goodsNum,
            goods_price: goodPrice, price_type: priceType, time,
        });
        return row != null;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.get_buy_goods_log = async function (account, start, rows) {
    if (!account || account === '') return null;
    try {
        const result = await modelsModule.models.BuyGoodsLog.findAll({
            where: { account },
            offset: Number(start),
            limit: Number(rows),
        });
        return result.map(r => r.toJSON());
    } catch (err) {
        console.error(err);
        return null;
    }
};
