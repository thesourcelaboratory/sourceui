/*                                  _    __            ____
 ___  ___  _   _ _ __ ___ ___ _   _(_)  / _|_      __ | ___|
/ __|/ _ \| | | | '__/ __/ _ \ | | | | | |_\ \ /\ / / |___ \
\__ \ (_) | |_| | | | (_|  __/ |_| | | |  _|\ V  V /   ___) |
|___/\___/ \__,_|_|  \___\___|\__,_|_| |_|   \_/\_/   |____/

 * ---------------------------------------------------------
 * SourceUI Framework v5.0.1
 * Revision: 0001 by Marino Boscolo Neto
 * Date: 2015-08-12 17:10:05 +0300 (Wed, 18 aug 2015)
 * Dual licensed under the MIT and GPL licenses.
 * Copyright (c) 2006-2015 - SourceLab Tecnologia Ltda
 * --------------------------------------------------------- */

/**
 * INTERFACE - AUTH
 * @description Interface do autenticador do sistema
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */

sourceui.interface.auth = function(){

	'use strict';

	var Auth = this;
	var Interface = sourceui.interface;
	var Network = sourceui.instances.network;
	
	Auth.auth = $('#suiAuth');
	Auth.body = $('#suiBody');
	Auth.container = Auth.auth.find('#suiAuthContainer');
	Auth.modal = Auth.container.children('.modal');
	Auth.forms = Auth.container.find('.form');
	Auth.fields = Auth.container.find('.sui-field');
	Auth.buttons = Auth.container.find('.sui-button a');
	Auth.fields.customField();

	Auth.formdata = function(form){
		var data = {};
		var isValid = true;
		var $forms = form || Auth.forms;
		$forms.each(function(){
			var $form = $(this);
			var $fields = $form.find('.sui-field');
			$fields.each(function(){
				var $fd = $(this);
				if (!$fd.data('customField').validate.test.all()){
					isValid = false;
					return true;
				} else {
					data[$fd.data('name')] = $fd.val();
				}
			});
		});
		return (isValid) ? data : false;
	};

	Auth.buttons.on('click',function(event){
		var $this = $(this);
		if ($this.isDisable()) return false;
		if ($this.data('alias') == 'submit' || $this.is('#submit')){
			var data = Auth.formdata();
			if (data){
				data.kp = 's';
				Network.link.call($this,{
					cache : false,
					data : data,
					ondone : function(setup){
						var $xml = $(setup.response.parsedXML);
						if ($xml.find('interface > notify[type="error"]').length){
							Auth.forms.find('.sui-field[data-mode="password"]').val('');
						} else {
							Auth.container.remove();
						}
					}
				});
			}
		}
	});

	Auth.container.on('click','[data-link-href], .options a',function(event,data){
		var $this = $(this);
		if ($this.isDisable()) return false;
		Network.link.call($this,data);
	});	

	Auth.modal.velocity({
		opacity:[1,0],
		scale:[1,0.95]
	},'ease-out');

	Auth.body.removeClass('loading sui-ajax').children('.sui-spinner:eq(0)').remove();
}

