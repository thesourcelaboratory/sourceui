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

	this.sendSms = function(msg, from, mobile, messageId, aggregateId, schedule, callbackOption, doneFunction, failFunction){

		var sendSmsUrl = baseUrl + "/send-sms";
		var stringg = JSON.stringify(serializeSendSmsRequest(msg, from, mobile, messageId, aggregateId, schedule, callbackOption));
		callPost(stringg, sendSmsUrl, doneFunction, failFunction);

	};

	this.sendMultipleSms = function(layout, list, aggregateId, doneFunction, failFunction){

		var sendMultipleSmsUrl = baseUrl + "/send-sms-multiple";
		callPost(JSON.stringify(serializeSendSmsMultiRequest(layout, list, aggregateId)), sendMultipleSmsUrl, doneFunction, failFunction);

	};
	this.cancelSms = function(messageId, doneFunction, failFunction){

		var cancelSmsUrl = baseUrl + "/cancel-sms/" +  messageId;
		callPost(undefined, cancelSmsUrl, doneFunction, failFunction);

	};
	this.getSmsStatus = function(messageId, doneFunction, failFunction){

		var getSmsStatusUrl = baseUrl + "/get-sms-status/" + messageId;
		callGet(getSmsStatusUrl, doneFunction, failFunction);

	};
	this.listUnreadMessages = function(doneFunction, failFunction){

		var listUnreadMessagesUrl = baseUrl + "/received/list";
		callPost(undefined, listUnreadMessagesUrl, doneFunction, failFunction);

	};
	this.searchReceivedMessages = function(startPeriod, endPeriod, messageId, mobile, doneFunction, failFunction){
		var newUrl = "/received/search/";

		if(startPeriod != "" && endPeriod != ""){
			newUrl = newUrl + startPeriod + "/" + endPeriod;

			if(mobile != ""){
				newUrl = newUrl + "?mobile=" + mobile;
				if(messageId != ""){
					newUrl = newUrl + "&mtId=" + messageId;
				}
			} 
			else if(messageId != ""){
				newUrl = newUrl + "?mtId=" + messageId;
			}
		}

		var searchReceivedMessagesUrl = baseUrl + newUrl;
		callGet(searchReceivedMessagesUrl, doneFunction, failFunction);
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

		var string = "{\"sendSmsRequest\":  { \"aggregateId\" : \"" + aggregateId + "\", ";
		string = string + "\"msg\" : \"" + msg + "\", ";
		string = string + "\"id\" : \"" + messageId + "\", ";
		string = string + "\"from\" : \"" + from + "\", ";
		string = string + "\"to\" : \"" + mobile + "\", ";
		string = string + "\"schedule\" : \"" + schedule + "\", ";
		string = string + "\"callbackOption\" : \"" + callbackOption + "\" ";

		string = string + " } } "; 

		return $.parseJSON(string);

	}

}