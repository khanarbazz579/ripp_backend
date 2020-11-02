/**
 * Created by cis on 27/7/18.
 * @author Gourav V.
 */

const MeetingRoom = require('./../../models').meeting_rooms;

const create = async function(req, res){
    let err, meetingRoom;
     meetingRoom =req.body;
    [err, meetingRoom] = await to(MeetingRoom.create(meetingRoom));
    if(err){
        return ReE(res, err, 422);
    }
    let meeting_json = meetingRoom.toJSON();

    return ReS(res,{meetingRoom:meeting_json}, 201);
};

module.exports.create = create;

const getAll = async function(req, res){
  let  [err, meetingRooms] = await to(
     MeetingRoom.findAll()
    );
 return ReS(res, {meetingRooms:meetingRooms,err},200);
};

module.exports.getAll = getAll;


const update = async function(req, res){
    const _id = req.params.meeting_room_id;
    const meetingRoomBody = req.body;
    let [err, meetingRoom] = await to(
        MeetingRoom.update( meetingRoomBody, {where: {
            id: _id
        }})
    );
    return ReS(res, {meetingRoom:meetingRoomBody,err},201);
};

module.exports.update = update;

const remove = async function(req, res){
    const _id = req.params.meeting_room_id;
    let [err, meetingRoom] = await to(
        MeetingRoom.destroy({where: {
            id: _id
        }})
    );
    if(err){
        return ReE(res, err, 422);
    }
    return ReS(res, {meetingRoom:_id},200);
};

module.exports.remove = remove;