'use strict';

const { Sequelize, DataTypes } = require('sequelize');

let sequelize = null;

/**
 * Initialize Sequelize with the provided config.
 * config must have:
 *   dialect: 'mysql' | 'sqlite' | 'postgres' | 'mariadb' | 'mssql'
 *
 * For MySQL/MariaDB/Postgres:
 *   HOST, USER, PSWD, DB, PORT
 * For SQLite:
 *   STORAGE (file path, or ':memory:')
 */
function init(config) {
    if (config.dialect === 'sqlite') {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: config.STORAGE || ':memory:',
            logging: false,
        });
    } else {
        sequelize = new Sequelize(config.DB, config.USER, config.PSWD, {
            host: config.HOST,
            port: config.PORT || 3306,
            dialect: config.dialect || 'mysql',
            logging: false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        });
    }

    defineModels();
    return sequelize;
}

function getInstance() {
    if (!sequelize) {
        throw new Error('Database not initialized. Call models.init(config) first.');
    }
    return sequelize;
}

const models = {};

function defineModels() {
    models.Account = sequelize.define('Account', {
        account: { type: DataTypes.STRING(255), primaryKey: true, allowNull: false },
        password: { type: DataTypes.STRING(255), allowNull: false },
    }, {
        tableName: 't_accounts',
        timestamps: false,
    });

    models.User = sequelize.define('User', {
        userid: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        account: { type: DataTypes.STRING(64), allowNull: false, unique: true, defaultValue: '' },
        name: { type: DataTypes.STRING(32), allowNull: true },
        sex: { type: DataTypes.INTEGER(1), allowNull: true },
        headimg: { type: DataTypes.STRING(256), allowNull: true },
        lv: { type: DataTypes.SMALLINT, allowNull: true, defaultValue: 1 },
        exp: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        coins: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        gems: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        roomid: { type: DataTypes.STRING(8), allowNull: true },
        history: { type: DataTypes.STRING(4096), allowNull: true, defaultValue: '' },
    }, {
        tableName: 't_users',
        timestamps: false,
    });

    models.Room = sequelize.define('Room', {
        uuid: { type: DataTypes.CHAR(20), primaryKey: true, allowNull: false },
        id: { type: DataTypes.CHAR(8), allowNull: false, unique: true },
        base_info: { type: DataTypes.STRING(256), allowNull: false, defaultValue: '0' },
        create_time: { type: DataTypes.INTEGER, allowNull: false },
        num_of_turns: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        next_button: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        user_id0: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_icon0: { type: DataTypes.STRING(128), defaultValue: '' },
        user_name0: { type: DataTypes.STRING(32), defaultValue: '' },
        user_score0: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_id1: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_icon1: { type: DataTypes.STRING(128), defaultValue: '' },
        user_name1: { type: DataTypes.STRING(32), defaultValue: '' },
        user_score1: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_id2: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_icon2: { type: DataTypes.STRING(128), defaultValue: '' },
        user_name2: { type: DataTypes.STRING(32), defaultValue: '' },
        user_score2: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_id3: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_icon3: { type: DataTypes.STRING(128), defaultValue: '' },
        user_name3: { type: DataTypes.STRING(32), defaultValue: '' },
        user_score3: { type: DataTypes.INTEGER, defaultValue: 0 },
        ip: { type: DataTypes.STRING(16), allowNull: true },
        port: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    }, {
        tableName: 't_rooms',
        timestamps: false,
    });

    models.Game = sequelize.define('Game', {
        room_uuid: { type: DataTypes.CHAR(20), allowNull: false, primaryKey: true },
        game_index: { type: DataTypes.SMALLINT, allowNull: false, primaryKey: true },
        base_info: { type: DataTypes.STRING(1024), allowNull: false },
        create_time: { type: DataTypes.INTEGER, allowNull: false },
        snapshots: { type: DataTypes.CHAR(255), allowNull: true },
        action_records: { type: DataTypes.STRING(2048), allowNull: true },
        result: { type: DataTypes.CHAR(255), allowNull: true },
    }, {
        tableName: 't_games',
        timestamps: false,
    });

    models.GameArchive = sequelize.define('GameArchive', {
        room_uuid: { type: DataTypes.CHAR(20), allowNull: false, primaryKey: true },
        game_index: { type: DataTypes.SMALLINT, allowNull: false, primaryKey: true },
        base_info: { type: DataTypes.STRING(1024), allowNull: false },
        create_time: { type: DataTypes.INTEGER, allowNull: false },
        snapshots: { type: DataTypes.CHAR(255), allowNull: true },
        action_records: { type: DataTypes.STRING(2048), allowNull: true },
        result: { type: DataTypes.CHAR(255), allowNull: true },
    }, {
        tableName: 't_games_archive',
        timestamps: false,
    });

    models.Message = sequelize.define('Message', {
        type: { type: DataTypes.STRING(32), primaryKey: true, allowNull: false },
        msg: { type: DataTypes.STRING(1024), allowNull: false },
        version: { type: DataTypes.STRING(32), allowNull: false },
    }, {
        tableName: 't_message',
        timestamps: false,
    });

    models.Dealer = sequelize.define('Dealer', {
        account: { type: DataTypes.STRING(64), primaryKey: true, allowNull: false },
        password: { type: DataTypes.STRING(255), allowNull: false },
        name: { type: DataTypes.STRING(64), allowNull: true },
        parent: { type: DataTypes.STRING(64), allowNull: true },
        create_time: { type: DataTypes.BIGINT, allowNull: true },
        privilege_level: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        gems: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        score: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        all_gems: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        all_score: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        all_subs: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        token: { type: DataTypes.STRING(255), allowNull: true },
    }, {
        tableName: 't_dealers',
        timestamps: false,
    });

    models.DealerKpi = sequelize.define('DealerKpi', {
        account: { type: DataTypes.STRING(64), allowNull: false, primaryKey: true },
        year: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
        month: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
        gems: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        score: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        subs: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    }, {
        tableName: 't_dealers_kpi',
        timestamps: false,
    });

    models.DealerNotice = sequelize.define('DealerNotice', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING(255), allowNull: true },
        content: { type: DataTypes.TEXT, allowNull: true },
        level: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        act_time: { type: DataTypes.BIGINT, allowNull: true },
        end_time: { type: DataTypes.BIGINT, allowNull: true },
    }, {
        tableName: 't_dealers_notice',
        timestamps: false,
    });

    models.DealerGoods = sequelize.define('DealerGoods', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        goods_name: { type: DataTypes.STRING(128), allowNull: true },
        goods_type: { type: DataTypes.INTEGER, allowNull: true },
        goods_num: { type: DataTypes.INTEGER, allowNull: true },
        goods_price: { type: DataTypes.INTEGER, allowNull: true },
        price_type: { type: DataTypes.INTEGER, allowNull: true },
        state: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
        act_time: { type: DataTypes.BIGINT, allowNull: true },
        end_time: { type: DataTypes.BIGINT, allowNull: true },
    }, {
        tableName: 't_dealers_goods',
        timestamps: false,
    });

    models.Bill = sequelize.define('Bill', {
        orderid: { type: DataTypes.BIGINT, primaryKey: true },
        operator: { type: DataTypes.STRING(64), allowNull: true },
        target: { type: DataTypes.STRING(64), allowNull: true },
        num: { type: DataTypes.INTEGER, allowNull: true },
        time: { type: DataTypes.BIGINT, allowNull: true },
        note: { type: DataTypes.STRING(255), allowNull: true },
    }, {
        tableName: 't_bills',
        timestamps: false,
    });

    models.BuyGoodsLog = sequelize.define('BuyGoodsLog', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        account: { type: DataTypes.STRING(64), allowNull: true },
        goods_type: { type: DataTypes.INTEGER, allowNull: true },
        goods_num: { type: DataTypes.INTEGER, allowNull: true },
        goods_price: { type: DataTypes.INTEGER, allowNull: true },
        price_type: { type: DataTypes.INTEGER, allowNull: true },
        time: { type: DataTypes.BIGINT, allowNull: true },
    }, {
        tableName: 't_buy_goods_log',
        timestamps: false,
    });

    models.Rate = sequelize.define('Rate', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        rate1: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        rate2: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        rate3: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    }, {
        tableName: 't_rates',
        timestamps: false,
    });
}

module.exports = {
    init,
    getInstance,
    get models() { return models; },
};
