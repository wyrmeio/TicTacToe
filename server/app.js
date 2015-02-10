/**
 * Created by idris on 10/2/15.
 */

var currentPlayer, gameSummary, getWinner;


Cells = new Meteor.Collection('cells');
Players = new Meteor.Collection('players');
Rooms = new Meteor.Collection('rooms');

gameSummary = function (roomId) {
    var cell, combo, key, pickedCells, pickedWinningCombo, val, winners, winningCombos, _i, _j, _len, _len1, _name, _ref;
    winningCombos = [
        ['0', '1', '2'],
        ['3', '4', '5'],
        ['6', '7', '8'],
        ['0', '3', '6'],
        ['1', '4', '7'],
        ['2', '5', '8'],
        ['0', '4', '8'],
        ['2', '4', '6']
    ];
    pickedCells = {};
    _ref = Cells.find({roomId: roomId}).fetch();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (cell.type != null) {
            if (pickedCells[_name = cell.type] == null) {
                pickedCells[_name] = [];
            }
            pickedCells[cell.type].push(cell.cellNo);
        }
    }
    winners = {};
    for (key in pickedCells) {
        val = pickedCells[key];
        for (_j = 0, _len1 = winningCombos.length; _j < _len1; _j++) {
            combo = winningCombos[_j];
            pickedWinningCombo = _.all(combo, function (comboItem) {
                return _.contains(pickedCells[key], comboItem);
            });
            if (pickedWinningCombo) {
                winners[key] = true;
                winners.winningCells = combo;
            }
        }
    }
    return winners;
};

/*
 * server only block -- should be in a a 'server' folder
 */


if (Meteor.isServer) {
    Meteor.methods({
        'restartGame': function (roomId,turn) {
            Rooms.update({_id:roomId},{$set:{turn:turn}});
            return Cells.update({roomId: roomId}, {$unset: {type: true, winning: true}}, {multi: true});
        },
        'updateWinningCells': function (roomId) {
            if (gameSummary(roomId).winningCells != null) {
                return Cells.update({$and: [{cellNo: {$in: gameSummary(roomId).winningCells}}, {roomId: roomId}]}, {$set: {winning: true}}, {multi: true});
            }
        }
    });

    Meteor.startup(function () {

    });
}
