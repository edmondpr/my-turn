window.utils = {

    // Asynchronously load templates located in separate .html files
    loadTemplate: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                alert(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },

    dbUrl: function() {
        var url = "/users";
        if (window.location.href.indexOf("localhost") >= 0) {
            url = "/mongodb/users";
        }
        return url;
    },

    displayValidationErrors: function (messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
        this.showAlert('Warning!', 'Fix validation errors and try again', 'alert-warning');
    },

    addValidationError: function (field, message) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.addClass('error');
        $('.help-inline', controlGroup).html(message);
    },

    removeValidationError: function (field) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.removeClass('error');
        $('.help-inline', controlGroup).html('');
    },

    showAlert: function(title, text, klass) {
        $('.alert').removeClass("alert-error alert-warning alert-success alert-info");
        $('.alert').addClass(klass);
        $('.alert').html('<strong>' + title + '</strong> ' + text);
        $('.alert').show();
    },

    hideAlert: function() {
        $('.alert').hide();
    },
	
	pad: function(value, width, padchar) {
		while (value.length < width) {
			value = padchar + value + "";
		}
		return value;
	},	
	
	formatDate: function(d) {
		var curr_date = d.getDate();
		curr_date += "";
		var curr_month = d.getMonth() + 1;
		curr_month += "";
		var curr_year = d.getFullYear();		
		return (utils.pad(curr_date,2,"0") + "/" + utils.pad(curr_month,2,"0") + "/" + curr_year);
	},	
	
	parseDate: function(d) {
	    var parts = d.split('/');
	    return new Date(parts[2], parts[1]-1, parts[0]);
	},  
    
    simpleSort: function(property, order) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            if (order == "asc") {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            } else if (order == "desc") {
                var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
            }
            return result * sortOrder;
        }
    },

    dynamicSort: function(c1, c2) {
        var firstBy = (function() {
            function e(f) {
                f.thenBy = t;
                return f;
            } 
            function t(y,x){
                x = this;
                return e(function(a,b){
                    return x(a,b)||y(a,b)
                })
            }
            return e;
        })();
        var s = firstBy(function (v1, v2) { return v1[c1] < v2[c1] ? -1 : (v1[c1] > v2[c1] ? 1 : 0); })
                 .thenBy(function (v1, v2) { return v1[c2] < v2[c2] ? -1 : (v1[c2] > v2[c2] ? 1 : 0); });
        return s;
    }	

};