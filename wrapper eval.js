'use strict';
//const Discord = require('discord.js'); //console.log(client._eval('eval')) exploit
//also wilson found another bypass by `({}).constructor.constructor("return process")().mainModule.require`

const vm = require('vm');

const untrustedCode = process.argv[2];

const returned = vm.runInNewContext(`\
'use strict';
vm.runInNewContext(untrustedCode, {});
`, { vm, untrustedCode });

console.log(returned);