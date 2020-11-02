/**
 * Created by cis on 29/03/19.
 */
module.exports = (sequelize,DataType) => {
    let Model = sequelize.define("deleted_events",{
        event_id : { 
            type: DataType.INTEGER,
            allowNull: false
        },
        delete_date : {
            type :DataType.DATE
        }
    },{underscored: true});

    return Model;
};