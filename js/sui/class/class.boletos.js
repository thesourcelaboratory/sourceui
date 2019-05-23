var boletos = {

    test: function (str) {
        var data = { validtype: false, fullvalid: false };
        boletos.testBoleto(str, data);
        boletos.testFatura(str, data);
        if (data.boleto.validblock === 4) {
            data.validtype = 'boleto';
            data.fullvalid = true;
        } else if (data.fatura.validblock === 4) {
            data.validtype = 'fatura';
            data.fullvalid = true;
        } else if (data.boleto.validblock.length - data.boleto.errorblock.length > data.fatura.validblock.length - data.fatura.errorblock.length) {
            data.validtype = 'boleto';
        } else if (data.fatura.validblock.length - data.fatura.errorblock.length > data.boleto.validblock.length - data.boleto.errorblock.length) {
            data.validtype = 'fatura';
        }
        return data;
    },

    mask: function (str) {
        var data = boletos.test(str);
        if (data.validtype == 'boleto') return '99999.99999 99999.999999 99999.999999 9 99999999999999';
        else if (data.validtype == 'fatura') return '99999999999.9 99999999999.9 99999999999.9 99999999999.9';
        else return '999999999999999999999999999999999999999999999999';
    },

    /**
     * Valida boletos do tipo fatura ou carnê.
     *
     * @example Exemplo: 42297.11504 00001.954411 60020.034520 2 68610000054659
     *
     * @param string linhaDigitavel Linha digitalizável com ou sem mascara.
     * @param function callback função de retorno.
     */
    testBoleto: function (linhaDigitavel, dados) {

        linhaDigitavel = linhaDigitavel.replace(/\D/g, '');

        var data = $.extend(true, dados || {}, {
            boleto: {
                digitable: linhaDigitavel,
                validblock: [],
                errorblock: [],
            }
        });
        var d = data.boleto;

        if (!/^\d+$/.test(linhaDigitavel)) {
            d.errorblock[0] = 'Boleto inválido';
            return data;
        }

        if (d.digitable.length === 47) {
            d.barcode =
                d.digitable.substr(0, 4) +
                d.digitable.substr(32, 15) +
                d.digitable.substr(4, 5) +
                d.digitable.substr(10, 10) +
                d.digitable.substr(21, 10);
        }

        d.blocos = [];

        d.blocos[0] = d.digitable.length >= 10 ? d.digitable.substr(0, 10) : null;
        d.blocos[1] = d.digitable.length >= 21 ? d.digitable.substr(10, 11) : null;
        d.blocos[2] = d.digitable.length >= 32 ? d.digitable.substr(21, 11) : null;

        $.each(d.blocos, function (k, b) {
            if (b === null) return true;
            boletos.modulo10(b, function (digitoVerificador) {
                if (digitoVerificador == b[b.length - 1]) {
                    d.validblock[k] = true;
                } else {
                    d.errorblock[k] = 'Digito verificador inválido';
                    return false;
                }
            });
        });

        if (d.validblock.length === 3 && d.barcode) {
            if (boletos.modulo11_2(d.barcode.substr(0, 4) + d.barcode.substr(5, 39)) != d.barcode.substr(4, 1)) {
                d.errorblock[3] = 'Código de barras inválido';
            } else {
                d.validblock[3] = true;
            }
        }

        return data;
    },

    /**
     * Valida boletos do tipo convênio.
     *
     * @example Exemplo modulo 10: 83640000001-1 33120138000-2 81288462711-6 08013618155-1
     * @example Exemplo modulo 11: 85890000460-9 52460179160-5 60759305086-5 83148300001-0
     *
     * @param string codigoBarras Código de barras com ou sem mascara.
     * @param function callback função de retorno.
     */

    testFatura: function (codigoBarras, dados) {

        codigoBarras = codigoBarras.replace(/\D/g, '');

        var data = $.extend(true, dados || {}, {
            fatura: {
                barcode: codigoBarras,
                validblock: [],
                errorblock: [],
                modulo10: false,
                modulo11: false,
            }
        });
        var d = data.fatura;

        if (!/^\d+$/.test(codigoBarras)) {
            d.errorblock[0] = 'Fatura inválida';
            return data;
        }

        d.blocos = [];

        d.blocos[0] = codigoBarras.length >= 12 ? codigoBarras.substr(0, 12) : null;
        d.blocos[1] = codigoBarras.length >= 24 ? codigoBarras.substr(12, 12) : null;
        d.blocos[2] = codigoBarras.length >= 36 ? codigoBarras.substr(24, 12) : null;
        d.blocos[3] = codigoBarras.length == 48 ? codigoBarras.substr(36, 12) : null;

        /**
         * Verifica se é o modulo 10 ou modulo 11.
         * Se o 3º digito for 6 ou 7 é modulo 10, se for 8 ou 9, então modulo 11.
         */
        d.modulo10 = ['6', '7'].indexOf(codigoBarras[2]) != -1;
        d.modulo11 = ['8', '9'].indexOf(codigoBarras[2]) != -1;

        $.each(d.blocos, function (k, b) {
            if (b === null) return true;
            var fn;
            if (d.modulo10) fn = 'modulo10';
            else if (d.modulo11) fn = 'modulo11';
            if (boletos[fn]) {
                boletos[fn](b, function (digitoVerificador) {
                    if (digitoVerificador == b[b.length - 1]) {
                        d.validblock[k] = true;
                    } else {
                        d.errorblock[k] = 'Digito verificador inválido';
                    }
                });
            } else {
                d.errorblock[k] = 'Módulo inválido';
                return false;
            }

        });

        return data;
    },


    /**
     * Cacula o módulo 10 do bloco.
     *
     * @param string bloco
     * @param function callback função de retorno.
     */
    modulo10: function (bloco, callback) {
        var tamanhoBloco = bloco.length - 1;

        var codigo = bloco.substr(0, tamanhoBloco);

        codigo = boletos.strrev(codigo);
        codigo = codigo.split('');

        var somatorio = 0;

        codigo.forEach(function (value, index) {

            var soma = value * (index % 2 == 0 ? 2 : 1);

            /**
             * Quando a soma tiver mais de 1 algarismo(ou seja, maior que 9),
             * soma-se os algarismos antes de somar com somatorio
             */
            if (soma > 9) {
                somatorio += soma.toString().split('').reduce(function (sum, current) {
                    return parseInt(sum) + parseInt(current);
                });
            } else {
                somatorio += soma;
            }

            if (codigo.length == index + 1) {
                /**
                 * (Math.ceil(somatorio / 10) * 10) pega a dezena imediatamente superior ao somatorio
                 * (dezena superior de 25 é 30, a de 43 é 50...).
                 */
                var dezenaSuperiorSomatorioMenosSomatorio = (Math.ceil(somatorio / 10) * 10) - somatorio;

                callback(dezenaSuperiorSomatorioMenosSomatorio);
            }
        });
    },

    /**
     * Cacula o módulo 11 do bloco.
     *
     * @param string bloco
     * @param function callback função de retorno.
     */
    modulo11: function (bloco, callback) {
        var tamanhoBloco = bloco.length - 1;
        var dezenaSuperiorSomatorioMenosSomatorio;

        var codigo = bloco.substr(0, tamanhoBloco);

        codigo = boletos.strrev(codigo);
        codigo = codigo.split('');

        var somatorio = 0;

        codigo.forEach(function (value, index) {
            somatorio += value * (2 + (index >= 8 ? index - 8 : index));

            if (codigo.length == index + 1) {
                var restoDivisao = somatorio % 11;

                if (restoDivisao == 0 || restoDivisao == 1) {
                    dezenaSuperiorSomatorioMenosSomatorio = 0;
                } else if (restoDivisao == 10) {
                    dezenaSuperiorSomatorioMenosSomatorio = 1;
                } else {
                    dezenaSuperiorSomatorioMenosSomatorio = (Math.ceil(somatorio / 11) * 11) - somatorio;
                }

                callback(dezenaSuperiorSomatorioMenosSomatorio);
            }
        });
    },
    modulo11_2: function (bloco) {
        var numero = bloco;
        //debug('Barra: '+numero);
        var soma = 0;
        var peso = 2;
        var base = 9;
        var resto = 0;
        var contador = numero.length - 1;
        //debug('tamanho:'+contador);
        // var numero = "12345678909";
        for (var i = contador; i >= 0; i--) {
            //alert( peso );
            soma = soma + (numero.substring(i, i + 1) * peso);
            //debug( i+': '+numero.substring(i,i+1) + ' * ' + peso + ' = ' +( numero.substring(i,i+1) * peso)+' soma='+ soma);
            if (peso < base) {
                peso++;
            } else {
                peso = 2;
            }
        }
        var digito = 11 - (soma % 11);
        //debug( '11 - ('+soma +'%11='+(soma % 11)+') = '+digito);
        if (digito > 9) digito = 0;
        /* Utilizar o dígito 1(um) sempre que o resultado do cálculo padrão for igual a 0(zero), 1(um) ou 10(dez). */
        if (digito == 0) digito = 1;
        return digito;
    },

    strrev: function (string) {
        return string.split('').reverse().join('');
    },
};
