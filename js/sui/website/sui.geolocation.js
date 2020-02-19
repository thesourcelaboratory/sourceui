var suiGeolocation = {
	provuf: {
		'AC': 'Acre',
		'AL': 'Alagoas',
		'AM': 'Amazonas',
		'AP': 'Amapá',
		'BA': 'Bahia',
		'CE': 'Ceará',
		'DF': 'Distrito Federal',
		'ES': 'Espírito Santo',
		'GO': 'Goás',
		'MA': 'Maranhão',
		'MG': 'Minas Gerais',
		'MS': 'Mato Grosso do Sul',
		'MT': 'Mato Grosso',
		'PA': 'Pará',
		'PB': 'Paraíba',
		'PE': 'Pernambuco',
		'PI': 'Piauí',
		'PR': 'Paraná',
		'RJ': 'Rio de Janeiro',
		'RN': 'Rio Grande do Norte',
		'RO': 'Rondônia',
		'RR': 'Roráima',
		'RS': 'Rio Grande do Sul',
		'SC': 'Santa Catarina',
		'SE': 'Sergipe',
		'SP': 'São Paulo',
		'TO': 'Tocantins'
	},
	findAddressFromCEP: function(cep, setup){
		$.getJSON('https://viacep.com.br/ws/' + cep.replace(/\D+/g, '') + '/json/')
		.done(function(results){
			results.cidade = results.localidade;
			results.estado = suiGeolocation.provuf[results.uf] || results.uf;
			if (setup.ondone) setup.ondone.call(null, results);
		})
		.fail(function(jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			if (setup.onfail) setup.onfail.call(null, err);
		});
	}
};