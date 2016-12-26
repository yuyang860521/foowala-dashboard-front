var people = { // our "users database"
    1: {
        id: 1,
        name: 'Jen Jones'
    },
    2: {
        id: 2,
        name: 'asd'
    }
};

const _staff = require('../services/staff.service');

module.exports = exports = function(decoded, request, callback) {
    console.log(" - - - - - - - decoded token:");
    console.log(decoded);
    console.log(" - - - - - - - request info:");
    console.log(request.info);
    console.log(" - - - - - - - user agent:");
    console.log(request.headers['user-agent']);
    // do your checks to see if the person is valid
    // _staff.getStaffsOpenid()
    //     .then(openids => {
    //         if (openids.indexOf(decoded.open_id) != -1) {
    //             return callback(null, true);
    //         } else {
    //             return callback(null, false);
    //         }
    //     })
    if (!people[decoded.id]) {
          return callback(null, false);
        }
        else {
          return callback(null, true);
        }
};
