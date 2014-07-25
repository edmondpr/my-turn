var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "list",
        "users"				: "list",
        "users/page/:page"	: "list",
        "users/add"         : "addUser",
        "users/:id"         : "userDetails",
        "about"             : "about"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

	list: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var userList = new UserCollection();
        userList.fetch({success: function(){
            $("#content").html(new UserListView({model: userList, page: p}).el);	
        }});	
        this.headerView.selectMenuItem('home-menu');
    },

    userDetails: function (id) {
        var user = new User({_id: id});
        user.fetch({success: function(){
            $("#content").html(new UserView({model: user}).el);
        }});
        this.headerView.selectMenuItem();
    },

	addUser: function() {
        var user = new User();
        $('#content').html(new UserView({model: user}).el);
        this.headerView.selectMenuItem('add-menu');
	  },

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

utils.loadTemplate(['HomeView', 'HeaderView', 'UserView', 'UserListItemView', 'AboutView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});