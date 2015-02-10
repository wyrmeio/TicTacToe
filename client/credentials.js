/**
 * Created by idris on 6/2/15.
 */


if (Meteor.isClient) {
    Template.playerName.helpers({
        players: function () {
            return Players.find({$and: [{name: {$ne: Session.get('name')}}, {inGame: false}]});
        },
        myName: function () {
            return Session.get('name');
        }
    });

    Template.playerName.events({

        'click .invite': function () {

            Players.update({_id: this._id}, {$set: {inGame: true}});
            Players.update({_id: Session.get('id')}, {$set: {inGame: true}});

            Rooms.insert({player1: this._id, player2: Session.get('id'), turn: "X"}, function (error, id) {

                Session.set('roomId', id);
                Session.set('turn', "X");
                var i;
                if (Cells.find({roomId: id}).count() === 0) {
                    for (i = 0; i <= 8; i = ++i) {
                        Cells.insert({cellNo: "" + i, roomId: id});
                    }
                }
            });

            //  Session.set('cellStatus','cellOn');
            Session.set('game', true);
        }

    });

    Template.playerInput.events({
        'submit .proceed': function (event) {
            event.preventDefault();
            var text = event.target.text.value;

            if(Players.find({name:text}).count()===0) {
                Players.insert({name: text, inGame: false}, function (error, id) {
                    Session.set('id', id);

                    Rooms.find({$or: [{player1: Session.get('id')}, {player2: Session.get('id')}]}).observeChanges({
                        added: function (newDoc, oldDoc) {

                            if (Rooms.find({$or: [{player1: Session.get('id')}, {player2: Session.get('id')}]}).count() === 1) {
                                Session.set('turn', "O");
                                Session.set('game', true);
                                Session.set('roomId', newDoc);
                                console.log(Session.get('roomId'));
                            }
                        },
                        removed:function(id){

                            if(id===Session.get('roomId')){
                                alert('Sorry. Your opponent left !');
                                location.reload();
                            }

                        }

                    });
                });
                Session.set('name', text);
            }
            else{
                alert("Name already taken! Try another one..");
            }
        }
    });

    Template.room.helpers({

        name: function () {

            return (Session.get('id') != undefined);
        }

    });


    Template.body.helpers({

        game: function () {
            return (Session.get('game') != undefined);
        }
    });


}
