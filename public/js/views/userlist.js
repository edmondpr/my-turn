window.UserListView = Backbone.View.extend({

    initialize: function () {
        this.render();
        if ($('.nav-collapse.collapse').hasClass('in')) {
        	$('.btn.btn-navbar').click();
        }        
    },

    render: function () {
        var users = this.model.models;
        var len = users.length;

        // Order user list by balance then by name
		var usersStr = JSON.stringify(users);
		var usersObj = JSON.parse(usersStr);        
        usersObj.sort(utils.dynamicSort("balance", "name"));
        for (var i in users) {
        	users[i].set(usersObj[i]);
        }
		
		// Create today empty record for all users
		for (var i in users) {
			var modelStr = JSON.stringify(users[i]);
			var modelObj = JSON.parse(modelStr);
			var datePresent = false;
			var today = new Date();	
			for (var i=0; i<modelObj.dates.length; i++) {
				if (modelObj.dates[i].date == utils.formatDate(today)) {
					datePresent = true;	
				}
			}
			if (!datePresent) {
				modelObj.dates.unshift({"date": utils.formatDate(today), "persons": ""});
			}

			var user = new User({_id: modelObj._id});	
			user.fetch({async:false, success: function(){
				user.set(modelObj);
				user.save();
			}});			
			
		}
		
        $(this.el).html('<ul class="thumbnails"></ul>');

        for (var i = 0; i < len; i++) {
            $('.thumbnails', this.el).append(new UserListItemView({model: users[i]}).render().el);
        }

        return this;
    }
});

window.UserListItemView = Backbone.View.extend({

    tagName: "li",

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});