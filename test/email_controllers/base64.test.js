var assert = assert || require("assert");
var Base64 = Base64 || require('../../controllers/mailerController/base64Decoder').Base64;
var is = function (a, e, m) {
    return function () {
        assert.equal(a, e, m)
    }
};
describe('base64js', function () {
    describe('basic', function () {
        it('d',    is(Base64.btoa('d'),    'ZA=='));
        it('da',   is(Base64.btoa('da'),   'ZGE='));
        it('dan',  is(Base64.btoa('dan'),  'ZGFu'));
        it('ZA==', is(Base64.atob('ZA=='), 'd'   ));
        it('ZGE=', is(Base64.atob('ZGE='), 'da'  ));
        it('ZGFu', is(Base64.atob('ZGFu'), 'dan' ));
    });
    describe('whitespace', function () {
        it('Z A==', is(Base64.atob('ZA =='), 'd'   ));
        it('ZG E=', is(Base64.atob('ZG E='), 'da'  ));
        it('ZGF u', is(Base64.atob('ZGF u'), 'dan' ));
    });
    describe('null', function () {
        it('\\0',       is(Base64.btoa('\0'),     'AA=='));
        it('\\0\\0',    is(Base64.btoa('\0\0'),   'AAA='));
        it('\\0\\0\\0', is(Base64.btoa('\0\0\0'), 'AAAA'));
        it('AA==',      is(Base64.atob('AA=='), '\0'    ));
        it('AAA=',      is(Base64.atob('AAA='), '\0\0'  ));
        it('AAAA',      is(Base64.atob('AAAA'), '\0\0\0'));
    });
    describe('binary', function () {
        var pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        var pngBinary = '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x04\x00\x00\x00\xb5\x1c\x0c\x02\x00\x00\x00\x0b\x49\x44\x41\x54\x78\xda\x63\x64\x60\x00\x00\x00\x06\x00\x02\x30\x81\xd0\x2f\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82';
        it('.btoa', is(Base64.btoa(pngBinary), pngBase64));
        it('.atob', is(Base64.atob(pngBase64), pngBinary));
	});
	describe('basic', function () {
		it('d',    is(Base64.encode('d'),    'ZA=='));
		it('da',   is(Base64.encode('da'),   'ZGE='));
		it('dan',  is(Base64.encode('dan'),  'ZGFu'));
		it('ZA==', is(Base64.decode('ZA=='), 'd'   ));
		it('ZGE=', is(Base64.decode('ZGE='), 'da'  ));
		it('ZGFu', is(Base64.decode('ZGFu'), 'dan' ));
	});
	describe('whitespace', function () {
		it('Z A==', is(Base64.decode('ZA =='), 'd'   ));
		it('ZG E=', is(Base64.decode('ZG E='), 'da'  ));
		it('ZGF u', is(Base64.decode('ZGF u'), 'dan' ));
	});
	describe('null', function () {
		it('\\0',       is(Base64.encode('\0'),     'AA=='));
		it('\\0\\0',    is(Base64.encode('\0\0'),   'AAA='));
		it('\\0\\0\\0', is(Base64.encode('\0\0\0'), 'AAAA'));
		it('AA==',      is(Base64.decode('AA=='), '\0'    ));
		it('AAA=',      is(Base64.decode('AAA='), '\0\0'  ));
		it('AAAA',      is(Base64.decode('AAAA'), '\0\0\0'));
	});
	describe('Base64', function () {
		it('.encode', is(Base64.encode('小飼弾'), '5bCP6aO85by+'));
		it('.encodeURI', is(Base64.encodeURI('小飼弾'), '5bCP6aO85by-'));
		it('.decode', is(Base64.decode('5bCP6aO85by+'), '小飼弾'));
		it('.decode', is(Base64.decode('5bCP6aO85by-'), '小飼弾'));
	});
	if ('extendString' in Base64){
		Base64.extendString();
		describe('String', function () {
			it('.toBase64', is('小飼弾'.toBase64(), '5bCP6aO85by+'));
			it('.toBase64', is('小飼弾'.toBase64(true), '5bCP6aO85by-'));
			it('.toBase64URI', is('小飼弾'.toBase64URI(), '5bCP6aO85by-'));
			it('.fromBase64', is('5bCP6aO85by+'.fromBase64(), '小飼弾'));
			it('.fromBase64', is('5bCP6aO85by-'.fromBase64(), '小飼弾'));
		});
	}

	var seed = function () {
		var a, i;
		for (a = [], i = 0; i < 256; i++) {
			a.push(String.fromCharCode(i));
		}
		return a.join('');
	}();
	describe('Base64', function () {
		for (var i = 0, str = seed; i < 16; str += str, i++) {
			it(''+str.length, is(Base64.decode(Base64.encode(str)), str));
		}
	});


	describe('Yoshinoya', function () {
		it('.encode', is(Base64.encode('𠮷野家'), '8KCut+mHjuWutg=='));
		it('.encodeURI', is(Base64.encodeURI('𠮷野家'), '8KCut-mHjuWutg'));
		it('.decode', is(Base64.decode('8KCut+mHjuWutg=='), '𠮷野家'));
		it('.decode', is(Base64.decode('8KCut-mHjuWutg'), '𠮷野家'));
		/* it('.decode', is(Base64.decode('7aGC7b636YeO5a62'), '𠮷野家')); */
	});
	





	
});
//////////////////////



