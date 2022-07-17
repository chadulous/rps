import { customAlphabet } from 'nanoid'
// this aproach needs at least 15 years to at just a 1% chance of collision
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

var choices = ["rock", "paper", "scissors"];

function compare(player, owner) {
    player = choices.indexOf(player);
    owner = choices.indexOf(owner);
    if (player == owner) {
        return 'draw';
    }
    if (player == choices.length - 1 && owner == 0) {
        return "owin";
    }
    if (owner == choices.length - 1 && player == 0) {
        return "pwin";
    }
    if (player > owner) {
        return "pwin";
    } else {
        return "owin";
    }
}

/**
 * 
 * @param {import('socket.io').Server} io 
 */
function attachrealtime(io) {
    const matches = []
    const route = /^\/play:([\w\s\d]*)$/
    io.of(route).on('connection', (s) => {
        const matchid = s.nsp.name.match(route)[1]
        if(!matches.find((v) => v.id === matchid)) return
        const gameindex = matches.findIndex(v => v.id === matchid)
        io.of('/').emit('update', matches.filter((v) => v.player === null))
        if(matches[gameindex].owner === null) {
            matches[gameindex].owner = s.id
            s.emit('game')
            s.emit('game:owner')
            s.on('choice', (ch) => {
                matches[gameindex].ownerchoice = ch
                if(matches[gameindex].playerchoice) {
                    const result = compare(matches[gameindex].playerchoice, matches[gameindex].ownerchoice)
                    s.emit('round', matches[gameindex].playerchoice, result)
                    s.broadcast.emit('round', matches[gameindex].ownerchoice, result)
                    matches[gameindex].ownerchoice = null
                    matches[gameindex].playerchoice = null
                    if(result === 'owin') {
                        matches[gameindex].ownerpoints += 1
                    } else if(result === 'pwin') {
                        matches[gameindex].playerpoints += 1
                    }
                    s.emit('score', [matches[gameindex].ownerpoints, matches[gameindex].playerpoints])
                    s.broadcast.emit('score', [matches[gameindex].playerpoints, matches[gameindex].ownerpoints])
                    if(matches[gameindex].ownerpoints === 6) {
                        s.emit('end', true)
                        s.broadcast.emit('end', false)
                        delete matches[gameindex]
                    } else if(matches[gameindex].playerpoints === 6) {
                        s.emit('end', false)
                        s.broadcast.emit('end', true)
                        delete matches[gameindex]
                    }
                    io.of('/').emit('update', matches.filter((v) => v.player === null))
                }
            })
            s.on('disconnect', () => {
                s.broadcast.emit('end', true)
            })
        } else if(matches[gameindex].player === null) {
            matches[gameindex].player = s.id
            s.emit('game')
            s.emit('game:join', matches[gameindex].owner)
            s.to(matches[gameindex].owner).emit('join', s.id)
            s.on('choice', (ch) => {
                matches[gameindex].playerchoice = ch
                if(matches[gameindex].ownerchoice) {
                    const result = compare(matches[gameindex].playerchoice, matches[gameindex].ownerchoice)
                    s.emit('round', matches[gameindex].ownerchoice, result)
                    s.broadcast.emit('round', matches[gameindex].playerchoice, result)
                    matches[gameindex].playerchoice = null
                    matches[gameindex].ownerchoice = null
                    if(result === 'owin') {
                        matches[gameindex].ownerpoints += 1
                    } else if(result === 'pwin') {
                        matches[gameindex].playerpoints += 1
                    }
                    s.emit('score', [matches[gameindex].playerpoints, matches[gameindex].ownerpoints])
                    s.broadcast.emit('score', [matches[gameindex].ownerpoints, matches[gameindex].playerpoints])

                    if(matches[gameindex].ownerpoints === 6) {
                        s.emit('end', false)
                        s.broadcast.emit('end', true)
                    } else if(matches[gameindex].playerpoints === 6) {
                        s.emit('end', true)
                        s.broadcast.emit('end', false)
                    }
                }
            })
            s.on('disconnect', () => {
                s.broadcast.emit('end', true)
            })
        } else {
            s.disconnect()
            return
        }
        s.emit('ready')
        s.on('start', () => {
            s.emit('start')
            s.broadcast.emit('start')
        })
    })
    io.on('connection', (s) => {
        s.emit('ready')
        s.emit('update', matches.filter((v) => v.player === null))
        s.on('create', (n, cb) => {
            const id = nanoid()
            matches.push({
                owner: null,
                ownerchoice: null,
                ownerpoints: 0,
                player: null,
                playerchoice: null,
                playerpoints: 0,
                id,
                name: n
            })
            cb(id)
            s.broadcast.emit('update', matches.filter((v) => v.player === null))
        })
    })
}

export default attachrealtime