//URL DE PRODUÇÃO

sourceui.Zenvia = function(){

	var baseUrl = "https://api-rest.zenvia360.com.br/services";

	var auth = {
		account: 'sourcelab.api',
		password: 'QR6wozQXMw'
	};

	function makeBaseAuth(e, t){
		var n = e + ":" + t;
		var r = btoa(n);
		return "Basic " + r;
	};

	this.sendSms = function(setup){

		//msg, from, mobile, messageId, aggregateId, schedule, callbackOption, doneFunction, failFunction

		var sendSmsUrl = baseUrl + "/send-sms";
		var stringg = JSON.stringify(serializeSendSmsRequest(
			setup.message, 
			setup.from, 
			setup.mobile, 
			setup.messageId || new Date().getTime(), 
			setup.aggregateId, 
			setup.schedule,
			setup.onoption || 'NONE'));
		callPost(stringg, sendSmsUrl, setup.ondone, setup.onfail);

	};

	this.sendMultipleSms = function(layout, list, aggregateId, doneFunction, failFunction){
		// no setup implementd
		var sendMultipleSmsUrl = baseUrl + "/send-sms-multiple";
		callPost(JSON.stringify(serializeSendSmsMultiRequest(layout, list, aggregateId)), sendMultipleSmsUrl, doneFunction, failFunction);

	};
	this.cancelSms = function(setup){

		var cancelSmsUrl = baseUrl + "/cancel-sms/" +  setup.id;
		callPost(undefined, cancelSmsUrl, setup.ondone, setup.onfail);

	};
	this.getSmsStatus = function(setup){

		var getSmsStatusUrl = baseUrl + "/get-sms-status/" + setup.id;
		callGet(getSmsStatusUrl, setup.ondone, setup.onfail);

	};
	this.listUnreadMessages = function(setup){

		var listUnreadMessagesUrl = baseUrl + "/received/list";
		callPost(undefined, listUnreadMessagesUrl, setup.ondone, setup.onfail);

	};
	this.searchReceivedMessages = function(setup){

		//startPeriod, endPeriod, messageId, mobile, doneFunction, failFunction

		var newUrl = "/received/search/";

		if(setup.start && setup.end){
			newUrl = newUrl + setup.start + "/" + setup.end;

			if(setup.mobile){
				newUrl = newUrl + "?mobile=" + setup.mobile;
				if(setup.id){
					newUrl = newUrl + "&mtId=" + setup.id;
				}
			} 
			else if(setup.id){
				newUrl = newUrl + "?mtId=" + setup.id;
			}
		}

		var searchReceivedMessagesUrl = baseUrl + newUrl;
		callGet(searchReceivedMessagesUrl, setup.ondone, setup.onfail);
	};

	function callPost(data, url, doneFunction, failFunction) {

		console.log(data);
		console.log(url);
		console.log(doneFunction);
		console.log(failFunction);

		if(typeof doneFunction == "undefined"){
			doneFunction = function(data){  defaultDoneFunction(data); }
		}

		if(typeof failFunction == "undefined"){
			failFunction = function(data){ defaultFailFunction(data) };
		}

		$.ajax({
			headers: {
				"Accept": "application/json",
				"Content-type": "application/json",
				"Authorization": makeBaseAuth(auth.account, auth.password)
			},
			cache: false,
			type: "POST",
			data: data,
			url: url,
			crossDomain: true
		})
		.done(doneFunction)
		.fail(failFunction);
	}

	function callGet(url, doneFunction, failFunction) {

		if(typeof doneFunction == "undefined"){
			doneFunction = function(data){  defaultDoneFunction(data); }
		}

		if(typeof failFunction == "undefined"){
			failFunction = function(data){ defaultFailFunction(data) };
		}


		$.ajax({
			headers: {
				"Accept": "application/json",
				"Authorization": makeBaseAuth(auth.account, auth.password)
			},
			cache: false,
			type: "GET",
			url: url,
			crossDomain: true
		})
		.done(doneFunction)
		.fail(failFunction);
	}

	function validCallbackFunction(callbackFunction, defaultCallbackFunction){
		if(typeof callbackFunction == 'undefined'){
			return defaultCallbackFunction;
		}
		else{
			return callbackFunction;
		}

	}

	function defaultDoneFunction(data){
		console.log(data);
	}

	function defaultFailFunction (data){
		if(data.status == '401'){
			console.error("HTTP 401 Unauthorized");
		} else if(data.responseJSON != null) {
			console.error(data.responseJSON);
		} else {
			console.error(data);
		}
	}

	function serializeSendSmsMultiRequest(layout, list, aggregateId){

		var lines = list.split("\n");

		var string = "{\"sendSmsMultiRequest\":  { \"aggregateId\" : \"" + aggregateId + "\", \"sendSmsRequestList\" : [ ";

		for(var i = 0; i < lines.length; i++) {
			var fields = lines[i].split(";");

			if(fields == ""){
				continue;
			}

			string = string + "{";

			if(layout == "A"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\"";

			} else if(layout == "B"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"from\": \"" + fields[2] + "\"";

			} else if(layout == "C"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"id\": \"" + fields[2] + "\"";

			} else if(layout == "D"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"id\": \"" + fields[2] + "\",";
				string = string + "\"from\": \"" + fields[3] + "\"";

			} else if(layout == "E"){
				string = string + "\"to\": \"" + fields[0] + "\",";
				string = string + "\"msg\": \"" + fields[1] + "\",";
				string = string + "\"id\": \"" + fields[2] + "\",";
				string = string + "\"from\": \"" + fields[3] + "\",";
				string = string + "\"schedule\": \"" + fields[4] + "\"";
			}

			string = string + "},";

		};

		string = string.substring(0, string.length - 1); 

		string = string + " ] } } "; 

		return $.parseJSON(string);
	}

	function serializeSendSmsRequest(msg, from, mobile, messageId, aggregateId, schedule, callbackOption){

		var string = "{\"sendSmsRequest\":  { ";
		if (aggregateId) string = string + "\"aggregateId\" : \"" + aggregateId + "\", ";
		if (msg) string = string + "\"msg\" : \"" + msg + "\", ";
		if (messageId) string = string + "\"id\" : \"" + messageId + "\", ";
		if (from) string = string + "\"from\" : \"" + from + "\", ";
		if (mobile) string = string + "\"to\" : \"" + mobile + "\", ";
		if (schedule) string = string + "\"schedule\" : \"" + schedule + "\", ";
		if (callbackOption) string = string + "\"callbackOption\" : \"" + callbackOption + "\" ";

		string = string + " } } "; 

		return $.parseJSON(string);

	}

}