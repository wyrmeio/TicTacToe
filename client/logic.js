/**
 * Created by idris on 6/2/15.
 */
/*
 * this block is shared between client and server
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
 * client only block -- should be in a 'client' folder
 */

if (Meteor.isClient) {

    currentPlayer = function () {
        /*if ((Cells.find({$and: [{type: {$exists: true}}, {roomId: Session.get('roomId')}]}, {sort: {_id: 1}}).count() % 2) === 0) {
            return 'X';
        } else {
            return 'O';
        }*/

        return Session.get('turn');

    };

    getWinner = function () {
        var key, val, _ref;
        _ref = gameSummary(Session.get('roomId'));
        for (key in _ref) {
            val = _ref[key];
            if (val === true) {
                return key;
            }
        }
        return false;
    };

    Template.board.helpers({
        currentPlayer: function () {
            return currentPlayer();
        },
        winner: function () {
           // return getWinner();
            return (getWinner()===Session.get('turn'))? "Congrats!! You Won :)": "Aww!! You lose :(";
        },
        getPlayerState: function () {
            return (getWinner()===Session.get('turn') || getWinner());
        },
        getBtnState: function (){
            return (getWinner()===Session.get('turn'))? "success": "warning";
        },
        message:function () {
            var turn = Rooms.findOne({_id: Session.get('roomId')});
            return (turn.turn === Session.get('turn')) ? "Your turn. Play "+Session.get('turn') : "Please wait!";
        },
        cells: function () {
            return Cells.find({roomId: Session.get('roomId')}, {sort: {cellNo: 1}});
        },
        buttonType: function () {
            if (this.winning) {
                return 'btn-success';
            } else if (this.type != null) {
                return 'btn-primary';
            } else {
                return 'btn-default';
            }
        }
    });

    Template.board.events({
        'click .restart-game': function () {
            return Meteor.call('restartGame', Session.get('roomId'),Session.get('turn'));
        },
        'click .cell': function () {
            //  Session.set('cellStatus','cellOff');
            // turn=turn+1;

            var turn = Rooms.findOne({_id: Session.get('roomId')});
            if (turn.turn === Session.get('turn')) {

                var _ref;
                if (!((((_ref = Cells.findOne({$and: [{cellNo: this.cellNo}, {roomId: Session.get('roomId')}]})) != null ? _ref.type : void 0) != null) || getWinner())) {
                    var docid = Cells.findOne({$and: [{cellNo: this.cellNo}, {roomId: Session.get('roomId')}]});
                    Cells.update({_id: docid._id}, {$set: {type: currentPlayer()}});
                    if (gameSummary(Session.get('roomId')).winningCells != null) {
                        return Meteor.call('updateWinningCells', Session.get('roomId'));
                    }
                }
                var next=(turn.turn==="X") ? "O" : "X";
                Rooms.update({_id:Session.get('roomId')},{$set:{turn:next}});
            }
            else{
                alert("Please wait for your turn!");
            }
        }
        /*'click .leave-game':function (){
            Session.set('game',false);
            return Session.get('game');
        }*/
    });



    window.addEventListener('beforeunload', function(e) {

        console.log("window close");
        // perform cleanup
        Players.remove({_id:Session.get('id')});
        Rooms.remove({_id:Session.get('roomId')});
        var doc=Cells.find({roomId:Session.get('roomId')}).fetch();
        for(var i=0;i<doc.length;i++)
        {
            Cells.remove({_id: doc[i]._id});
        }
    });
}


