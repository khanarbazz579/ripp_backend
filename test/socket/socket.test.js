const expect = require('chai').expect;
const io = require('socket.io-client');
io_server = require('socket.io').listen(3001);

describe('Suite of unit tests', () => {

    var socket;
    beforeEach((done) => {
        // setup
        socket = io.connect('http://localhost:3001', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new conncetion': true
        });
        socket.on('connect', () => {
            console.log('worked...');
        });
        socket.on('disconnect', () => {
            console.log('disconnected...');
        });
        done();
    });

    afterEach((done) => {
        // cleanup
        if (socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            // there will not be a connection unless you have done() in beforeEach, socket.on('connect')...
            console.log('no connection to break...');
        }
        done();
    });

    describe('Socket test', () => {

        it('Test1 - Doing some things with indexOf() for checking connection on Before and After', (done) => {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });

        it('Test2 - should communicate', (done) => {
            // once connected emit, Hello World
            io_server.emit('echo', 'Hello World');

            socket.once('echo', (message) => {
                // Check that the message matches
                expect(message).to.equal('Hello World');
                done();
            });

            io_server.on('connection', (socket) => {
                expect(socket).to.not.be.null;
            });
            done();
        });

    });

});