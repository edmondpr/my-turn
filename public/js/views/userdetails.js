window.UserView = Backbone.View.extend({

    initialize: function () {
        this.render();
        if ($('.nav-collapse.collapse').hasClass('in')) {
        	$('.btn.btn-navbar').click();
        }
    },

    render: function () {	
		var userObj = this.model.toJSON();	
		
		// Get persons who are already selected
		var selectedPersons = new Array();
		$.ajax({
			async: false,
			url: utils.dbUrl(),
			success: function(data) {
				$.each(data, function(){
					if (this.name != userObj.name) {
						selectedPersons = selectedPersons.concat(this.dates[0].persons);
					}
				});
			}
		});
		var allPersons = "";
		var personPresent = false;
		var credits = new Array();
		var debits = new Array();
		var creditsAndDebits = new Array();
		var balanceBefore = 0;
		var balanceAfter = 0;
		//var beginDate = utils.parseDate("09/07/2014");
		var today = new Date();
		$.ajax({
			async: false,
			url: utils.dbUrl(),
			success: function(data) {
				$.each(data, function(){
					
					// Check if someone else already offered to current model person (userObj)
					if (this.dates[0].persons.indexOf(userObj.name) >= 0) {
						personPresent = true;
					}
					
					// Get all persons except those who already offered to current person
					// and those who already offered to someone else
					if (selectedPersons.indexOf(this.name) < 0 && this.dates[0].persons.length == 0) {
						allPersons += this.name;
						allPersons += ";";	
					}
					
					if (this.name == userObj.name) {
						for (var i in this.dates) {
							/*if (utils.parseDate(this.dates[i].date) < beginDate) {
								if (this.dates[i].persons != "") {
									balanceBefore += this.dates[i].persons.length;
								}
							} else {*/
								if (this.dates[i].persons != "") {
									credits.push({type: "credit", date: this.dates[i].date, persons: this.dates[i].persons});
								}
							//}
						}

					} else {
						for (var i in this.dates) {
							if (this.dates[i].persons.indexOf(userObj.name) >= 0) {
								debits.push({type: "debit", date: this.dates[i].date, persons: this.name});
							}
						}

					}				
				});
			}			
		});	
		creditsAndDebits = credits.concat(debits);
		creditsAndDebits.sort(utils.simpleSort("date", "desc"));	
		if (personPresent) {
			allPersons = "";	
		} else {
			allPersons = allPersons.slice(0, -1);
		}
		userObj['allPersons'] = allPersons;	
		userObj['today'] = utils.formatDate(new Date());
		userObj['creditsAndDebits'] = creditsAndDebits;
        $(this.el).html(this.template(userObj));	
		
		// date
		/*$.datepicker.setDefaults(
  			$.extend(
    			{'dateFormat':'dd/mm/yy'},
   				$.datepicker.regional['it']
  			)
		);
		this.$('#date').datepicker();
		this.$('#date').datepicker("setDate", utils.formatDate(new Date()));*/
		this.$('#date').html(utils.formatDate(new Date()));
		
 		this.$('.multiselect').multiselect();
		
		this.$('#creditsAndDebits').hide();
		this.$('#btnCD').on('click', function() {
			$('#creditsAndDebits').slideToggle(); 
		});
        return this;
    },

    events: {
        "change .multiselect"   : "updateBalance",
        "click .save"   		: "beforeSave",
        "click .delete" 		: "deleteUser"
    },

    updateBalance: function (event) {
		// Save persons and balance for current date
		var modelStr = JSON.stringify(this.model);
		var modelObj = JSON.parse(modelStr);
		var persons = $("#persons").val();	
		if (persons == null) {
			persons = "";	
		}	
		var personsOld = modelObj.dates[0].persons;
		var countPersonsOld = parseInt(personsOld.length);
		var countPersonsNew = persons.length;
		var balance = parseInt(modelObj.balance) - countPersonsOld + countPersonsNew;
		var balanceColor = "#68a926";
		if (balance < 0) {
			balanceColor = "red";
		} else if (balance == 0) {
			balanceColor = "#000;"
		}		
		$(".balanceColor").css('color', balanceColor);
		$(".balance").html(balance);
    },

    beforeSave: function () {
        var self = this;
        /*var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }*/

        console.log('before save');

        this.saveUser();
        return false;
    },

    saveUser: function () {
        var self = this;
				
		// Add new combination date/persons
		var modelStr = JSON.stringify(this.model);
		var modelObj = JSON.parse(modelStr);	
		var name = $("#name").val();	
		modelObj.name = name;
		var date = $("#date").html();
		var persons = $("#persons").val();	
		var datePresent = false;
		for (var i=0; i<modelObj.dates.length; i++) {
			if (modelObj.dates[i].date == date) {
				datePresent = true;	
			} else if (modelObj.dates[i].date == "") {
				modelObj.dates.splice(i,1);	
			}
		}
		
		// Save persons and balance for current date
		var today = new Date();
		if (persons == null) {
			persons = "";	
		}		
		if (date == utils.formatDate(today)) {		
			if (!datePresent) {
				modelObj.dates.unshift({"date": date, "persons": persons});
			} else {
				var personsOld = modelObj.dates[0].persons;
				
				// Find persons to increase/decrease balance
				var idsToUpdateOld = new Array(); 
				$.ajax({
					async: false,
					url: utils.dbUrl(),
					success: function(data) {
						$.each(data, function(){
							for (var i in personsOld) {
								if (this.name == personsOld[i]) {
									idsToUpdateOld.push(this._id);
								}
							}
						});
					}
				});	
				var idsToUpdateNew = new Array(); 
				$.ajax({
					async: false,
					url: utils.dbUrl(),
					success: function(data) {
						$.each(data, function(){
							for (var i in persons) {
								if (this.name == persons[i]) {
									idsToUpdateNew.push(this._id);
								}
							}
						});
					}
				});					
				
				for (var i in idsToUpdateOld) {				
					var user = new User({_id: idsToUpdateOld[i]});
					user.fetch({async:false, success: function(){
						var balance = parseInt(user.get("balance"));
						balance++;
						user.set("balance", balance);			
						user.save();
					}});
				}			
				for (var i in idsToUpdateNew) {				
					var user = new User({_id: idsToUpdateNew[i]});
					user.fetch({async:false, success: function(){					
						var balance = parseInt(user.get("balance"));
						balance--;					
						user.set("balance", balance);			
						user.save();
					}});
				}
					
				modelObj.dates[0].persons = persons;
				modelObj.balance = $(".balance").html();
			}
		}
		this.model.set(modelObj);
		this.model.unset("multiselect");
		this.model.unset("persons");     
        this.model.save(null, {
            success: function (model) {
                window.history.back();
            },
            error: function () {
                utils.showAlert('Errore', 'Dati non salvati', 'alert-error');
            }
        });
    },

    deleteUser: function () {
        this.model.destroy({
            success: function () {
                alert('Utente cancellato con successo');
                window.history.back();
            }
        });
        return false;
    }

});