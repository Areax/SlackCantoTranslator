var rp = require('request-promise');
const lib = require('lib')({token: process.env.STDLIB_TOKEN});

/**
* /translate
*
*   Translates Chinese characters to jyutping using
*	https://www.chineseconverter.com/cantonesetools/en/cantonese-to-jyutping

* @param {string} user The user id of the user that invoked this command (name is usable as well)
* @param {string} channel The channel id the command was executed in (name is usable as well)
* @param {string} text The text contents of the command
* @param {object} command The full Slack command object
* @param {string} botToken The bot token for the Slack bot you have activated
* @returns {object}
*/
module.exports = function(user, channel, text = '', command = {}, botToken = null, callback) {
  var options = {
		method:'POST',
		uri:'https://www.chineseconverter.com/cantonesetools/en/cantonese-to-jyutping',
		formData: {text: "Tparse" + text + "Tparse"},
		headers: {
			"Content-Type":"application/x-www-form-urlencoded"
		}
	}
		
  rp(options)
    .then(function(res){
      // Calling the end function will send the request
      callback(null, {
        response_type: 'in_channel',
        text: "Translate", // full english translation
        "attachments": [createAttachment(res)]
      });
    })
	.catch(function(err){
		callback(null, {
			response_type: 'in_channel',
			text: "something went wrong"
		  });
	});
};

async function charToJyut(text) {
	var options = {
		method:'POST',
		uri:'https://www.chineseconverter.com/cantonesetools/en/cantonese-to-jyutping',
		formData: {text: "Tparse" + text + "Tparse"},
		headers: {
			"Content-Type":"application/x-www-form-urlencoded"
		}
	}
	return await rp(options)
		.then(function(err, httpResponse, body) {
			return parseHTMLForJyut(body);
		});
}

function parseHTMLForChinese(body) {
	if(body == undefined)
	{
		return "";
	}
	// Tparse will appear several times: 
	// 0 is before, 1 is Canto, 2 is between, 3 is jyutping, 4 is nothing
	if(body.split("Tparse")[1].trim().length > 500)
	{
		return "Error in input.";
	}
	return body.split("Tparse")[1].trim();
}
function parseHTMLForJyut(body) {
	if(body == undefined)
	{
		return "";
	}
	
	// Tparse will appear several times: 
	// 0 is before, 1 is Canto, 2 is between, 3 is jyutping, 4 is nothing
	var translation = body.split("Tparse")[3].trim();
	var htmlTrash = "span>";
	var htmlTrash2 = "<span";
	if(translation.includes(htmlTrash))
	{
		translation = translation.split(htmlTrash)[1].trim();
	}
	if(translation.includes(htmlTrash2))
	{
		translation = translation.split(htmlTrash2)[0].trim();
	}
	
	if(translation.length > 500)
	{
		return "Error in jyutping return.";
	}
	return translation;
}

function createAttachment(body) {
	return attachment = {
      title: parseHTMLForChinese(body), // chinese characters
      text: parseHTMLForJyut(body) // jyutping
    };
}