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

            Blaze.render(Template.board,Node.body );
        }

    });

    Template.playerInput.events({
        'submit .proceed': function(event){
            event.preventDefault();
            var text = event.target.text.value;
            Players.insert({name: text,inGame:false},function(error,id){
                Session.set('id', id);
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

}
