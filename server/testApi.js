const api = require('./calendarApi.js');

setTimeout(() => {
    api.getEvents("2020-12-26T22:00:00.000Z", "2021-02-06T22:00:00.000Z").then(res => console.log(res))
}, 2000);