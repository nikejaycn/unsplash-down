"use strict";

let request = require("request");
let fs      = require('fs');
const url   = 'https://unsplash.it/list';
let progress = require('request-progress');
let option = {
    finder: ""
}

function getUnsplashList(callback) {
    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const fbResponse = JSON.parse(body);
            callback && callback(fbResponse);
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
        }
    });
}

// Each JSON
function jsonHandler(rep) {
    fileDwonload(0, rep);
}

function fileDwonload(index, fileList, callback) {

    if(index == fileList.length) {
        return 'done';
    }
    let file_link = "https://unsplash.it/" + fileList[index].width + "/" + fileList[index].height + "?image=" + fileList[index].id;
    let file = fs.createWriteStream("unsplash/" + fileList[index].filename);

    progress(request(file_link))
    .on('progress', function (state) {
        // The state is an object that looks like this:
        // {
        //     percentage: 0.5,           // Overall percentage (between 0 to 1)
        //     speed: 554732,             // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,       // The total payload size in bytes
        //         transferred: 27610959  // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,      // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403     // The remaining seconds to finish (3 decimals)
        //     }
        // }
        console.log('download ' + file_link, Math.floor(state.percentage * 100)+"%");
    })
    .on('error', function (err) {
        // Do something with err
    })
    .pipe(file);

    file.on('finish', function() {
        file.close(function(){
            console.info(file_link, 'download done.');
            fileDwonload( index + 1, fileList);
        });
    });
}

getUnsplashList(jsonHandler);
