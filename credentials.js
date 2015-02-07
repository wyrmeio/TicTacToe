/**
 * Created by idris on 6/2/15.
 */

/*

*/
if(Meteor.isClient) {
    Template.playerName.helpers({
        players: function() {
            return Players.find({$and:[{name: {$ne: Session.get('name')}},{inGame:false}]});
        },
        myName: function() {
            return Session.get('name');
        }
    });

    Template.playerName.events({

        'click .invite':function(){

            Players.update({_id:this._id},{$set:{inGame:true}});
            Players.update({_id:Session.get('id')},{$set:{inGame:true}});
            turn=0;
            Rooms.insert({player1: this._id,player2:Session.get('id')},function(error,id){

                Session.set('roomId',id);
                var i;
                if (Cells.find({roomId:id}).count() === 0)
                {
                    for (i  = 0; i <= 8; i = ++i) {
                        Cells.insert({ _id: "" + i,roomId:id});
                    }

                }

               /* Cells.find({roomId:id}).observe({

                    changed: function(){
                        if(turn % 2 === 0)
                            Session.set('cellStatus','cellOn');
                        else
                            Session.set('cellStatus','cellOff');
                    }
                });*/

            });

          //  Session.set('cellStatus','cellOn');
            Session.set('game',true);

            //Blaze.render(Template.board,Node.body );
        }

    });

    Template.playerInput.events({
        'submit .proceed': function(event){
            event.preventDefault();
            var text = event.target.text.value;
            Players.insert({name: text,inGame:false},function(error,id){
                Session.set('id', id);

                Rooms.find().observe({
                    added: function(newDoc,oldDoc) {
                        turn=1;
                      //  Session.set('cellStatus','cellOff');
                        Session.set('game',true);
                        Session.set('roomId',newDoc._id);
                        console.log(Session.get('roomId'));


                    }
                });
            });
            Session.set('name', text);
            //console.log(Session.get('id'));
        }
    });

    Template.room.helpers({

        name: function(){

            if (Session.get('id')!=undefined)
                return true;
            else
                return false;

        }

    });



        Template.body.helpers({

            game: function () {
                if (Session.get('game')!=undefined)
                    return true;
                else
                    return false;
            }
    });






}
