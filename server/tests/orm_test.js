'use strict';

/**
 * ORM integration tests
 *
 * These tests run entirely against an in-memory SQLite database so they
 * require no external MySQL server.  Run with:
 *
 *   cd server && npm test
 */

const assert = require('assert');
const modelsModule = require('../models');
const db = require('../utils/db');
const dealerdb = require('../utils/dealerdb');

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(description, condition) {
    if (condition) {
        console.log('  ✓', description);
        passed++;
    } else {
        console.error('  ✗', description);
        failed++;
    }
}

function promisify(fn, ...args) {
    return new Promise((resolve) => fn(...args, resolve));
}

// ──────────────────────────────────────────────────────────────────────────────
// Setup – in-memory SQLite
// ──────────────────────────────────────────────────────────────────────────────

async function setup() {
    db.init({ dialect: 'sqlite', STORAGE: ':memory:' });
    await modelsModule.getInstance().sync({ force: true });
    console.log('Database synced (SQLite in-memory)\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

async function testAccounts() {
    console.log('── Accounts ──');

    // Create account
    const created = await promisify(db.create_account.bind(db), 'testuser', 'testpass');
    ok('create_account returns true', created === true);

    // Duplicate should fail
    const dup = await promisify(db.create_account.bind(db), 'testuser', 'testpass');
    ok('duplicate create_account returns false', dup === false);

    // Account should exist
    const exists = await promisify(db.is_account_exist.bind(db), 'testuser');
    ok('is_account_exist returns true for existing account', exists === true);

    // Non-existent account
    const noExists = await promisify(db.is_account_exist.bind(db), 'nobody');
    ok('is_account_exist returns false for missing account', noExists === false);

    // Auth with correct password
    const info = await promisify(db.get_account_info.bind(db), 'testuser', 'testpass');
    ok('get_account_info returns row on valid credentials', info != null && info.account === 'testuser');

    // Auth with wrong password
    const badInfo = await promisify(db.get_account_info.bind(db), 'testuser', 'wrongpass');
    ok('get_account_info returns null on wrong password', badInfo === null);
}

async function testUsers() {
    console.log('\n── Users ──');

    const created = await promisify(db.create_user.bind(db), 'testuser', 'Alice', 1000, 10, 0, null);
    ok('create_user returns true', created === true);

    // Exists
    const exists = await promisify(db.is_user_exist.bind(db), 'testuser');
    ok('is_user_exist true after create', exists === true);

    // Get user data
    const data = await promisify(db.get_user_data.bind(db), 'testuser');
    ok('get_user_data returns row', data != null);
    ok('get_user_data name is decoded', data.name === 'Alice');
    ok('get_user_data coins correct', data.coins === 1000);
    ok('get_user_data gems correct', data.gems === 10);

    const userId = data.userid;

    // Get by userid
    const dataById = await promisify(db.get_user_data_by_userid.bind(db), userId);
    ok('get_user_data_by_userid returns row', dataById != null);
    ok('get_user_data_by_userid name is decoded', dataById.name === 'Alice');

    // Gems
    await promisify(db.add_user_gems.bind(db), userId, 5);
    const gemsRow = await promisify(db.get_gems.bind(db), 'testuser');
    ok('add_user_gems increases gems', gemsRow != null && gemsRow.gems === 15);

    await promisify(db.cost_gems.bind(db), userId, 3);
    const gemsRow2 = await promisify(db.get_gems.bind(db), 'testuser');
    ok('cost_gems decreases gems', gemsRow2 != null && gemsRow2.gems === 12);

    // History
    const history = [{ round: 1, result: 'win' }];
    await promisify(db.update_user_history.bind(db), userId, history);
    const hist = await promisify(db.get_user_history.bind(db), userId);
    ok('update/get_user_history round-trips JSON', JSON.stringify(hist) === JSON.stringify(history));

    // Room ID
    await promisify(db.set_room_id_of_user.bind(db), userId, 'ROOM01');
    const roomId = await promisify(db.get_room_id_of_user.bind(db), userId);
    ok('set/get_room_id_of_user', roomId === 'ROOM01');

    await promisify(db.set_room_id_of_user.bind(db), userId, null);
    const noRoom = await promisify(db.get_room_id_of_user.bind(db), userId);
    ok('set_room_id_of_user(null) clears room', noRoom === null);
}

async function testRooms() {
    console.log('\n── Rooms ──');

    const uuid = await promisify(db.create_room.bind(db), 'ROOM01', { turns: 8 }, '127.0.0.1', 9000, 1700000000);
    ok('create_room returns uuid', typeof uuid === 'string' && uuid.length > 0);

    const exists = await promisify(db.is_room_exist.bind(db), 'ROOM01');
    ok('is_room_exist true after create', exists === true);

    const fetchedUuid = await promisify(db.get_room_uuid.bind(db), 'ROOM01');
    ok('get_room_uuid returns uuid', fetchedUuid === uuid);

    const roomData = await promisify(db.get_room_data.bind(db), 'ROOM01');
    ok('get_room_data returns row', roomData != null);
    ok('get_room_data ip correct', roomData.ip === '127.0.0.1');

    // Seat info
    await promisify(db.update_seat_info.bind(db), 'ROOM01', 0, 1, 'http://img', 'Alice');
    const roomData2 = await promisify(db.get_room_data.bind(db), 'ROOM01');
    ok('update_seat_info stores user_id0', roomData2.user_id0 === 1);
    ok('update_seat_info decodes user_name0', roomData2.user_name0 === 'Alice');

    // Num of turns
    await promisify(db.update_num_of_turns.bind(db), 'ROOM01', 4);
    const roomData3 = await promisify(db.get_room_data.bind(db), 'ROOM01');
    ok('update_num_of_turns updates correctly', roomData3.num_of_turns === 4);

    // Room address
    await new Promise((resolve) => {
        db.get_room_addr('ROOM01', (ok_flag, ip, port) => {
            ok('get_room_addr returns ok=true', ok_flag === true);
            ok('get_room_addr ip correct', ip === '127.0.0.1');
            ok('get_room_addr port correct', port === 9000);
            resolve();
        });
    });

    // Delete
    await promisify(db.delete_room.bind(db), 'ROOM01');
    const notExists = await promisify(db.is_room_exist.bind(db), 'ROOM01');
    ok('delete_room removes room', notExists === false);
}

async function testGames() {
    console.log('\n── Games ──');

    // Need a room first
    const uuid = await promisify(db.create_room.bind(db), 'GROOM1', {}, '127.0.0.1', 9000, 1700000000);

    const gameIdx = await promisify(db.create_game.bind(db), uuid, 1, JSON.stringify({ mode: 'xlch' }));
    ok('create_game returns index', gameIdx != null);

    await promisify(db.update_game_action_records.bind(db), uuid, 1, JSON.stringify([1, 2, 3]));

    const result = { scores: [10, -5, -5, 0] };
    await promisify(db.update_game_result.bind(db), uuid, 1, result);

    // Archive
    await promisify(db.archive_games.bind(db), uuid);

    const games = await promisify(db.get_games_of_room.bind(db), uuid);
    ok('archive_games moves game to archive', Array.isArray(games) && games.length === 1);

    const detail = await promisify(db.get_detail_of_game.bind(db), uuid, 1);
    ok('get_detail_of_game returns base_info', detail != null && detail.base_info != null);
    ok('get_detail_of_game returns action_records', detail.action_records != null);
}

async function testMessages() {
    console.log('\n── Messages ──');

    await modelsModule.models.Message.create({ type: 'notice', msg: 'Hello World', version: '1.0' });

    const msg = await promisify(db.get_message.bind(db), 'notice', null);
    ok('get_message returns row', msg != null && msg.msg === 'Hello World');

    // Same version – should not be returned
    const msgSameVer = await promisify(db.get_message.bind(db), 'notice', '1.0');
    ok('get_message skips matching version', msgSameVer === null);

    // Different version – should be returned
    const msgDiffVer = await promisify(db.get_message.bind(db), 'notice', '0.9');
    ok('get_message returns row for different version', msgDiffVer != null);
}

async function testDealerdb() {
    console.log('\n── Dealerdb ──');

    dealerdb.init({ dialect: 'sqlite', STORAGE: ':memory:' });
    // Sync the dealer models
    const seq = modelsModule.getInstance();
    await seq.sync({ force: false }); // models already synced, ensure dealer tables present

    const created = await dealerdb.create_dealer('dealer1', 'dpass', 'Dealer One', '', 1);
    ok('create_dealer returns true', created === true);

    const dup = await dealerdb.create_dealer('dealer1', 'dpass2', 'Dup', '', 1);
    ok('duplicate dealer returns false', dup === false);

    // Check account (correct password)
    const authRow = await dealerdb.check_account('dealer1', 'dpass');
    ok('check_account returns row on valid creds', authRow != null && authRow.account === 'dealer1');

    // Wrong password
    const badAuth = await dealerdb.check_account('dealer1', 'wrongpass');
    ok('check_account returns null on wrong password', badAuth === null);

    // Token
    await dealerdb.update_token('dealer1', 'mytoken123');
    const tokenRow = await dealerdb.get_dealer_by_token('mytoken123');
    ok('update_token and get_dealer_by_token work', tokenRow != null && tokenRow.account === 'dealer1');

    // Gems
    await dealerdb.add_dealer_gems('dealer1', 100);
    const dealer = await dealerdb.get_dealer_by_account('dealer1');
    ok('add_dealer_gems increases gems', dealer != null && dealer.gems === 100);

    const decOk = await dealerdb.dec_dealer_gems('dealer1', 30);
    ok('dec_dealer_gems returns true', decOk === true);
    const dealer2 = await dealerdb.get_dealer_by_account('dealer1');
    ok('dec_dealer_gems decreases gems', dealer2.gems === 70);

    // Score
    await dealerdb.add_dealer_score('dealer1', 50);
    const dealer3 = await dealerdb.get_dealer_by_account('dealer1');
    ok('add_dealer_score increases score', dealer3.score === 50);

    // Notices
    await dealerdb.insert_notice('Test Notice', 'Some content', 1, Date.now() - 1000, -1);
    const notices = await dealerdb.get_notice();
    ok('insert_notice and get_notice work', Array.isArray(notices) && notices.length >= 1);

    // Rates
    await modelsModule.models.Rate.create({ id: 1, rate1: 10, rate2: 20, rate3: 30 });
    const rates = await dealerdb.get_rates();
    ok('get_rates returns row', rates != null && rates.rate1 === 10);
    await dealerdb.update_rates(15, 25, 35);
    const rates2 = await dealerdb.get_rates();
    ok('update_rates persists', rates2.rate1 === 15);
}

// ──────────────────────────────────────────────────────────────────────────────
// Runner
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
    try {
        await setup();
        await testAccounts();
        await testUsers();
        await testRooms();
        await testGames();
        await testMessages();
        await testDealerdb();
    } catch (err) {
        console.error('\nUnexpected error during tests:', err);
        process.exit(1);
    }

    console.log(`\n══ Results: ${passed} passed, ${failed} failed ══`);
    process.exit(failed > 0 ? 1 : 0);
}

main();
