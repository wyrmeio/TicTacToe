/**
 * Created by idris on 6/2/15.
 */

/*

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
            Players.insert({name: text, inGame: false}, function (error, id) {
                Session.set('id', id);

                /*Tracker.autorun(function (){
                    var doc=Rooms.find({$or:[{player1:Session.get('id')},{player2:Session.get('id')}]});
                    if(doc.count()===1) {
                        Session.set('turn', "O");
                        //  Session.set('cellStatus','cellOff');
                        Session.set('game', true);
                        Session.set('roomId', doc._id);
                        console.log(Session.get('roomId'));
                    }
                });*/

                Rooms.find({$or:[{player1:Session.get('id')},{player2:Session.get('id')}]}).observeChanges({
                    added: function (newDoc, oldDoc) {
                        //{$or:[{player1:Session.get('id')},{player2:Session.get('id')}]}
                        if(Rooms.find({$or:[{player1:Session.get('id')},{player2:Session.get('id')}]}).count()===1) {
                            Session.set('turn', "O");
                            //  Session.set('cellStatus','cellOff');
                            Session.set('game', true);
                            Session.set('roomId', newDoc);
                            console.log(Session.get('roomId'));
                        }
                    }
                });
            });
            Session.set('name', text);

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
